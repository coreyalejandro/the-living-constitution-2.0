#!/usr/bin/env node
import { Command } from 'commander';
import ContractManager from '../core/contract-manager.js';
import EvidenceObservatory from '../core/evidence-observatory.js';
import PolicyEngine from '../core/policy-engine.js';
import RoleAuthorizer from '../core/role-authorizer.js';

function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

const program = new Command();
program
  .name('tlc-cli')
  .description('SocioTechnical Constitution Runtime CLI')
  .version('1.0.0');

program.command('validate')
  .description('Validate the active C-RSP contract against the local JSON schemas.')
  .option('--json', 'print machine-readable output')
  .action((options) => {
    const manager = new ContractManager();
    const result = manager.validateContract();
    new EvidenceObservatory().append({
      event_type: result.valid ? 'CONTRACT_LOADED' : 'SCHEMA_VALIDATION_FAILED',
      component: 'Contract Manager',
      decision: result.valid ? 'ALLOW' : 'BLOCK',
      role: 'System',
      user: 'tlc-cli',
      message: result.valid ? 'Active contract schema validation passed.' : 'Active contract schema validation failed.',
      payload: result,
    });
    if (options.json) printJson(result);
    else if (result.valid) console.log('VALID: active contract matches schema.');
    else {
      console.error('INVALID: active contract failed schema validation.');
      printJson(result.errors);
    }
    process.exit(result.valid ? 0 : 1);
  });

program.command('status')
  .description('Show the current runtime status summary.')
  .option('--json', 'print machine-readable output')
  .action((options) => {
    const manager = new ContractManager();
    const contract = manager.loadContract();
    const validation = manager.validateContract(contract);
    const policy = new PolicyEngine(contract).statusSummary();
    const summary = { ...manager.summarize(contract), schema_valid: validation.valid, policy };
    if (options.json) printJson(summary);
    else {
      console.log(`${summary.contract_id} — ${summary.title}`);
      console.log(`Status: ${summary.status} / ${summary.adoption_tier}`);
      console.log(`Functional status: ${summary.functional_status}`);
      console.log(`Schema valid: ${summary.schema_valid}`);
      console.log(`Acceptance: ${JSON.stringify(summary.acceptance_by_status)}`);
      console.log(`Halts: ${JSON.stringify(summary.halt_by_status)}`);
      console.log(`Active halt IDs: ${summary.policy.active_halts.join(', ') || 'none'}`);
    }
  });

program.command('evaluate')
  .description('Evaluate a proposed action against Tier-1 policy checks.')
  .requiredOption('--type <type>', 'action type, e.g. READ, PUSH, DEPLOY, LLM_ACTION')
  .option('--role <role>', 'actor role', 'Unknown')
  .option('--user <user>', 'actor identifier', 'unknown')
  .option('--contains-pii', 'flag action as containing PII')
  .option('--authorized-pii', 'flag PII use as authorized')
  .option('--json', 'print machine-readable output')
  .action((options) => {
    const manager = new ContractManager();
    const result = new PolicyEngine(manager.loadContract()).evaluate({
      type: options.type,
      role: options.role,
      contains_pii: Boolean(options.containsPii),
      authorized_pii: Boolean(options.authorizedPii),
    });
    new EvidenceObservatory().append({
      event_type: 'CI_GATE',
      component: 'Policy Engine',
      decision: result.decision,
      user: options.user,
      role: options.role,
      halt_conditions_triggered: result.halts,
      message: result.message,
      payload: { type: options.type },
    });
    if (options.json) printJson(result);
    else console.log(`${result.decision}: ${result.message}`);
    process.exit(result.decision === 'BLOCK' ? 1 : 0);
  });

program.command('authorize')
  .description('Check whether a role has a named permission.')
  .requiredOption('--role <role>', 'role name')
  .requiredOption('--permission <permission>', 'permission name')
  .option('--json', 'print machine-readable output')
  .action((options) => {
    const result = new RoleAuthorizer().evaluate(options.role, options.permission);
    new EvidenceObservatory().append({
      event_type: result.allowed ? 'ROLE_AUTH_GRANTED' : 'ROLE_AUTH_DENIED',
      component: 'Role Authorizer',
      decision: result.decision,
      user: 'tlc-cli',
      role: options.role,
      message: result.message,
      payload: { permission: options.permission },
    });
    if (options.json) printJson(result);
    else console.log(`${result.decision}: ${result.message}`);
    process.exit(result.allowed ? 0 : 1);
  });

program.command('evidence')
  .description('Show recent evidence log entries.')
  .option('--limit <number>', 'entry limit', '10')
  .option('--json', 'print machine-readable output')
  .action((options) => {
    const entries = new EvidenceObservatory().latest(Number(options.limit));
    if (options.json) printJson(entries);
    else entries.forEach((entry) => console.log(`${entry.timestamp} ${entry.decision} ${entry.event_type} ${entry.message}`));
  });

program.parse(process.argv);
if (process.argv.length <= 2) program.help();
