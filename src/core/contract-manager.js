import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const REPO_ROOT = path.resolve(__dirname, '../..');

export class ContractManager {
  constructor(options = {}) {
    this.rootDir = options.rootDir ? path.resolve(options.rootDir) : REPO_ROOT;
    this.contractPath = options.contractPath
      ? path.resolve(this.rootDir, options.contractPath)
      : path.join(this.rootDir, 'contracts/active/BUILD_CONTRACT.json');
    this.schemaDir = path.join(this.rootDir, 'schemas');
    this.contractSchemaPath = path.join(this.schemaDir, 'contract-schema.json');
  }

  readJson(filePath) {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`File not found: ${resolved}`);
    }
    try {
      return JSON.parse(fs.readFileSync(resolved, 'utf8'));
    } catch (error) {
      throw new Error(`Invalid JSON in ${resolved}: ${error.message}`);
    }
  }

  loadContract() {
    return this.readJson(this.contractPath);
  }

  createAjv() {
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    for (const schemaName of ['vnt-statement.schema.json', 'halt-condition.schema.json', 'evidence-entry.schema.json']) {
      const schemaPath = path.join(this.schemaDir, schemaName);
      if (fs.existsSync(schemaPath)) {
        ajv.addSchema(this.readJson(schemaPath), schemaName);
      }
    }
    return ajv;
  }

  validateContract(contract = this.loadContract()) {
    const schema = this.readJson(this.contractSchemaPath);
    const ajv = this.createAjv();
    const validate = ajv.compile(schema);
    const valid = validate(contract);
    return {
      valid,
      errors: valid ? [] : validate.errors.map((error) => ({
        path: error.instancePath || '/',
        message: error.message,
        keyword: error.keyword,
        params: error.params,
      })),
    };
  }

  summarize(contract = this.loadContract()) {
    const acceptance = contract.acceptance_criteria || [];
    const halts = contract.halt_conditions || [];
    const countBy = (items, key) => items.reduce((acc, item) => {
      const value = item[key] || 'unset';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    return {
      contract_id: contract.contract_id,
      title: contract.title,
      status: contract.status,
      adoption_tier: contract.adoption_tier,
      topology: contract.topology,
      components: contract.components || [],
      acceptance_criteria_total: acceptance.length,
      acceptance_by_status: countBy(acceptance, 'status'),
      halt_conditions_total: halts.length,
      halt_by_status: countBy(halts, 'status'),
      not_claimed: contract.not_claimed || [],
      evidence_paths: contract.evidence_paths || [],
      functional_status: this.deriveFunctionalStatus(contract),
    };
  }

  deriveFunctionalStatus(contract = this.loadContract()) {
    const allVerified = (contract.acceptance_criteria || []).length > 0
      && contract.acceptance_criteria.every((criterion) => criterion.status === 'verified');
    const anyBlocked = (contract.acceptance_criteria || []).some((criterion) => criterion.status === 'blocked')
      || (contract.halt_conditions || []).some((halt) => halt.status === 'active');

    if (anyBlocked) return 'blocked';
    if (allVerified && contract.status === 'Active') return 'working';
    if (contract.status === 'Draft') return 'scaffold';
    return 'partial';
  }

  updateAcceptanceCriterion(id, status, vnt = null) {
    const allowed = new Set(['unverified', 'verified', 'blocked', 'waived']);
    if (!allowed.has(status)) throw new Error(`Invalid acceptance status: ${status}`);
    const contract = this.loadContract();
    const criterion = contract.acceptance_criteria?.find((item) => item.id === id);
    if (!criterion) throw new Error(`Acceptance criterion not found: ${id}`);
    criterion.status = status;
    criterion.updated_at = new Date().toISOString();
    if (vnt !== null) criterion.vnt = vnt;
    this.writeContract(contract);
    return criterion;
  }

  writeContract(contract) {
    fs.writeFileSync(this.contractPath, `${JSON.stringify(contract, null, 2)}\n`, 'utf8');
  }
}

export default ContractManager;
