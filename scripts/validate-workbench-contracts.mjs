#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const bundlePath = path.join(repoRoot, 'contracts/active/json/tlc-workbench.bundle.json');
const contractSchemaPath = path.join(repoRoot, 'schemas/contracts/crsp-workbench-contract.schema.json');
const bundleSchemaPath = path.join(repoRoot, 'schemas/contracts/crsp-workbench-bundle.schema.json');
const schemaOnly = process.argv.includes('--schema-only');

function readJson(absolutePath) {
  try {
    return JSON.parse(readFileSync(absolutePath, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to parse JSON at ${path.relative(repoRoot, absolutePath)}: ${error.message}`);
  }
}

function formatAjvErrors(source, errors = []) {
  return errors.map((error) => {
    const pointer = error.instancePath || '/';
    return `${source}${pointer}: ${error.message}`;
  });
}

function recordOccurrence(map, id, location, kind) {
  const current = map.get(id) || [];
  current.push({ location, kind });
  map.set(id, current);
}

export function findDuplicateIdErrors(contracts) {
  const idOccurrences = new Map();
  const errors = [];

  for (const { contractRef, contract } of contracts) {
    recordOccurrence(idOccurrences, contract.contract_id, contractRef.path, 'contract');
    for (const acceptanceCriterion of contract.acceptance_criteria) {
      recordOccurrence(idOccurrences, acceptanceCriterion.id, `${contractRef.path}#acceptance_criteria`, 'acceptance criterion');
    }
    for (const haltCondition of contract.halt_conditions) {
      recordOccurrence(idOccurrences, haltCondition.id, `${contractRef.path}#halt_conditions`, 'halt condition');
    }
  }

  for (const [id, occurrences] of idOccurrences.entries()) {
    if (occurrences.length > 1) {
      const detail = occurrences.map(({ kind, location }) => `${kind} at ${location}`).join('; ');
      errors.push(`Duplicate ID detected for ${id}: ${detail}`);
    }
  }

  return errors;
}

export function validateWorkbenchContracts(options = {}) {
  const validateSchemasOnly = options.schemaOnly ?? schemaOnly;
  const errors = [];
  const ajv = new Ajv({ allErrors: true, strict: true });
  addFormats(ajv);

  if (!existsSync(bundlePath)) {
    return { valid: false, errors: [`Missing bundle file: ${path.relative(repoRoot, bundlePath)}`] };
  }
  if (!existsSync(contractSchemaPath)) {
    return { valid: false, errors: [`Missing contract schema: ${path.relative(repoRoot, contractSchemaPath)}`] };
  }
  if (!existsSync(bundleSchemaPath)) {
    return { valid: false, errors: [`Missing bundle schema: ${path.relative(repoRoot, bundleSchemaPath)}`] };
  }

  const contractSchema = readJson(contractSchemaPath);
  const bundleSchema = readJson(bundleSchemaPath);
  const validateContract = ajv.compile(contractSchema);
  const validateBundle = ajv.compile(bundleSchema);

  const bundle = readJson(bundlePath);
  if (!validateBundle(bundle)) {
    errors.push(...formatAjvErrors('Bundle ', validateBundle.errors));
    return { valid: false, errors };
  }

  const bundleContractIds = bundle.contracts.map((contractRef) => contractRef.contract_id);
  const bundleContractIdSet = new Set(bundleContractIds);
  const externalIds = new Set(bundle.external_contract_references || []);
  const allowedRelationshipIds = new Set([...bundleContractIds, ...externalIds]);
  const seenPaths = new Set();
  const seenHumanPaths = new Set();
  const contractsById = new Map();
  const validatedContracts = [];

  for (const contractRef of bundle.contracts) {
    if (seenPaths.has(contractRef.path)) {
      errors.push(`Bundle path is duplicated: ${contractRef.path}`);
    }
    seenPaths.add(contractRef.path);
    if (seenHumanPaths.has(contractRef.human_contract_path)) {
      errors.push(`Bundle human contract path is duplicated: ${contractRef.human_contract_path}`);
    }
    seenHumanPaths.add(contractRef.human_contract_path);

    const contractPath = path.join(repoRoot, contractRef.path);
    if (!existsSync(contractPath)) {
      errors.push(`Missing contract JSON referenced by bundle: ${contractRef.path}`);
      continue;
    }

    const contract = readJson(contractPath);
    if (!validateContract(contract)) {
      errors.push(...formatAjvErrors(`${contractRef.path} `, validateContract.errors));
      continue;
    }

    if (contract.contract_id !== contractRef.contract_id) {
      errors.push(`${contractRef.path}: contract_id ${contract.contract_id} does not match bundle reference ${contractRef.contract_id}`);
    }
    if (contract.human_contract_path !== contractRef.human_contract_path) {
      errors.push(`${contractRef.path}: human_contract_path ${contract.human_contract_path} does not match bundle reference ${contractRef.human_contract_path}`);
    }

    if (!validateSchemasOnly && !existsSync(path.join(repoRoot, contract.human_contract_path))) {
      errors.push(`${contractRef.path}: referenced human-readable contract is missing: ${contract.human_contract_path}`);
    }

    contractsById.set(contract.contract_id, contract);
    validatedContracts.push({ contractRef, contract });
  }

  for (const expectedId of bundle.validation_order) {
    if (!bundleContractIdSet.has(expectedId)) {
      errors.push(`validation_order references unknown contract_id: ${expectedId}`);
    }
  }
  for (const contractId of bundleContractIds) {
    if (!bundle.validation_order.includes(contractId)) {
      errors.push(`validation_order is missing contract_id: ${contractId}`);
    }
  }

  if (!contractsById.has(bundle.entrypoint_contract_id)) {
    errors.push(`Entrypoint contract is missing from bundle: ${bundle.entrypoint_contract_id}`);
  }

  for (const [contractId, contract] of contractsById.entries()) {
    const { parent_contract_id: parentContractId, child_contract_ids: childContractIds, dependency_contract_ids: dependencyContractIds } = contract.relationships;

    if (!allowedRelationshipIds.has(parentContractId)) {
      errors.push(`${contractId}: parent_contract_id is not resolvable from bundle or external references: ${parentContractId}`);
    }

    for (const relatedId of [...childContractIds, ...dependencyContractIds]) {
      if (!allowedRelationshipIds.has(relatedId)) {
        errors.push(`${contractId}: relationship references unknown contract_id: ${relatedId}`);
      }
    }

    for (const childId of childContractIds) {
      const childContract = contractsById.get(childId);
      if (childContract && childContract.relationships.parent_contract_id !== contractId) {
        errors.push(`${contractId}: child contract ${childId} points to ${childContract.relationships.parent_contract_id} instead of ${contractId}`);
      }
    }
  }

  errors.push(...findDuplicateIdErrors(validatedContracts));

  return { valid: errors.length === 0, errors };
}

function printResult(result) {
  if (result.valid) {
    if (schemaOnly) {
      console.log('Workbench contract schemas validated successfully.');
    } else {
      console.log('Workbench contract bundle validation passed.');
    }
    return;
  }

  console.error('Workbench contract validation failed:');
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
}

const invokedScriptUrl = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;

if (invokedScriptUrl === import.meta.url) {
  printResult(validateWorkbenchContracts({ schemaOnly }));
}
