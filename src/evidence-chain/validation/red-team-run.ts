/**
 * TLC Evidence Chain — Red-Team Validation Runner (R6)
 * Run: node --import tsx/esm src/evidence-chain/validation/red-team-run.ts
 * All 9 attack vectors must return BLOCKED. Any BYPASSED = CI failure.
 */
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EvidenceChainEngine, generateKeypair, createHITLSignature, sha256hex } from "../index.js";
import type { OperatorKey, ConstitutionRule } from "../index.js";

type AttackResult = { id: string; name: string; result: "BLOCKED" | "BYPASSED"; error: string };
const attacks: AttackResult[] = [];

function makeEngine() {
  const dir = mkdtempSync(join(tmpdir(), "rt-"));
  mkdirSync(join(dir, "ledger"), { recursive: true });
  const { publicKeyPem, privateKeyPem } = generateKeypair();
  const engine = new EvidenceChainEngine({
    ledgerDir: join(dir, "ledger"),
    ruleStorePath: join(dir, "rules.json"),
    keyringStoagePath: join(dir, "keyring.json"),
    privateKeyPem,
    publicKeyPem,
  });
  return { engine, dir };
}

function registerOp(engine: EvidenceChainEngine, id = "op"): { id: string; keys: ReturnType<typeof generateKeypair> } {
  const keys = generateKeypair();
  const opKey: OperatorKey = {
    id,
    publicKeyPem: keys.publicKeyPem,
    registeredAt: new Date().toISOString(),
    constitutionRef: "red-team",
    revoked: false,
  };
  engine.keyring_.register(opKey);
  return { id, keys };
}

function makeClaim(engine: EvidenceChainEngine, operatorId = "op") {
  return engine.registerClaim({
    title: "test-claim",
    description: "red-team",
    domainTags: [],
    createdAt: new Date().toISOString(),
    operator: operatorId,
    applicableRuleIds: [],
  });
}

function makeHITLEvidence(engine: EvidenceChainEngine, claimId: string, opId: string, privateKeyPem: string) {
  const base = {
    id: `hitl-${Date.now()}`,
    kind: "HITL" as const,
    path: "operational/attestation",
    hash: sha256hex(`hitl-${claimId}`),
    provenance: "operational attestation",
    createdAt: new Date().toISOString(),
    operator: opId,
    machineReadable: false as const,
    supportsClaimIds: [claimId],
  };
  const sig = createHITLSignature(base, privateKeyPem);
  engine.bindEvidence(claimId, { ...base, signature: sig });
}

// ── A1: State skip PROPOSED → VALIDATED (skipping 3 required states) ─────────
{
  const { engine } = makeEngine();
  const { id: opId } = registerOp(engine);
  const c = makeClaim(engine, opId);
  try {
    engine.advance(c.id, "VALIDATED", opId);
    attacks.push({ id: "A1", name: "State skip PROPOSED→VALIDATED", result: "BYPASSED", error: "no error thrown" });
  } catch (e) {
    attacks.push({ id: "A1", name: "State skip PROPOSED→VALIDATED", result: "BLOCKED", error: (e as Error).message });
  }
}

// ── A2: Backward transition VERIFIED → SPECIFIED ──────────────────────────────
{
  const { engine } = makeEngine();
  const { id: opId } = registerOp(engine);
  const c = makeClaim(engine, opId);
  engine.advance(c.id, "SPECIFIED", opId);
  engine.advance(c.id, "IMPLEMENTED", opId);
  engine.advance(c.id, "VERIFIED", opId);
  try {
    engine.advance(c.id, "SPECIFIED", opId);
    attacks.push({ id: "A2", name: "Backward transition VERIFIED→SPECIFIED", result: "BYPASSED", error: "no error thrown" });
  } catch (e) {
    attacks.push({ id: "A2", name: "Backward transition VERIFIED→SPECIFIED", result: "BLOCKED", error: (e as Error).message });
  }
}

// ── A3: Transition out of terminal DEPLOYED ────────────────────────────────────
{
  const { engine } = makeEngine();
  const { id: opId, keys } = registerOp(engine);
  const c = makeClaim(engine, opId);
  engine.advance(c.id, "SPECIFIED", opId);
  engine.advance(c.id, "IMPLEMENTED", opId);
  engine.advance(c.id, "VERIFIED", opId);
  makeHITLEvidence(engine, c.id, opId, keys.privateKeyPem);
  engine.advance(c.id, "VALIDATED", opId);
  engine.advance(c.id, "DEPLOYED", opId);
  try {
    engine.advance(c.id, "RETRACTED", opId);
    attacks.push({ id: "A3", name: "Transition from terminal DEPLOYED", result: "BYPASSED", error: "no error thrown" });
  } catch (e) {
    attacks.push({ id: "A3", name: "Transition from terminal DEPLOYED", result: "BLOCKED", error: (e as Error).message });
  }
}

// ── A4: Unregistered operator signs HITL evidence ─────────────────────────────
{
  const { engine } = makeEngine();
  const attackerKeys = generateKeypair();
  const c = makeClaim(engine);
  const base = {
    id: "hitl-a4",
    kind: "HITL" as const,
    path: "p",
    hash: sha256hex("a4"),
    provenance: "operational",
    createdAt: new Date().toISOString(),
    operator: "attacker",
    machineReadable: false as const,
    supportsClaimIds: [c.id],
  };
  try {
    engine.bindEvidence(c.id, { ...base, signature: createHITLSignature(base, attackerKeys.privateKeyPem) });
    attacks.push({ id: "A4", name: "Unregistered operator HITL", result: "BYPASSED", error: "no error thrown" });
  } catch (e) {
    attacks.push({ id: "A4", name: "Unregistered operator HITL", result: "BLOCKED", error: (e as Error).message });
  }
}

// ── A5: Content tampering — alter node field directly in ledger file ───────────
{
  const { engine, dir } = makeEngine();
  const { id: opId5 } = registerOp(engine);
  const c = makeClaim(engine, opId5);
  engine.advance(c.id, "SPECIFIED", opId5);
  const file = join(dir, "ledger", `${c.id}.jsonl`);
  const lines = readFileSync(file, "utf8").trim().split("\n");
  const rec = JSON.parse(lines[0]!) as Record<string, unknown>;
  (rec["node"] as Record<string, unknown>)["title"] = "TAMPERED_TITLE";
  lines[0] = JSON.stringify(rec);
  writeFileSync(file, lines.join("\n") + "\n");
  const vr = engine.verifyIntegrityHash(c.id);
  attacks.push({
    id: "A5",
    name: "Content tampering — alter node field in ledger",
    result: vr.ok ? "BYPASSED" : "BLOCKED",
    error: (vr as { ok: boolean; reason?: string }).reason ?? "content-hash mismatch detected",
  });
}

// ── A6: Signature forgery — replace rec.sig with fabricated bytes ──────────────
{
  const { engine, dir } = makeEngine();
  const c = makeClaim(engine);
  const file = join(dir, "ledger", `${c.id}.jsonl`);
  const lines = readFileSync(file, "utf8").trim().split("\n");
  const rec = JSON.parse(lines[0]!) as Record<string, unknown>;
  rec["sig"] = Buffer.from("a".repeat(64)).toString("base64url");
  lines[0] = JSON.stringify(rec);
  writeFileSync(file, lines.join("\n") + "\n");
  const vr = engine.verifyIntegrityHash(c.id);
  attacks.push({
    id: "A6",
    name: "Signature forgery — replace rec.sig with forged bytes",
    result: vr.ok ? "BYPASSED" : "BLOCKED",
    error: (vr as { ok: boolean; reason?: string }).reason ?? "signature verification detected",
  });
}

// ── A7: Hash chain reorder — swap entries 0 and 1 ─────────────────────────────
{
  const { engine, dir } = makeEngine();
  const { id: opId7 } = registerOp(engine);
  const c = makeClaim(engine, opId7);
  engine.advance(c.id, "SPECIFIED", opId7);
  engine.advance(c.id, "IMPLEMENTED", opId7);
  const file = join(dir, "ledger", `${c.id}.jsonl`);
  const lines = readFileSync(file, "utf8").trim().split("\n");
  [lines[0], lines[1]] = [lines[1]!, lines[0]!];
  writeFileSync(file, lines.join("\n") + "\n");
  const vr = engine.verifyIntegrityHash(c.id);
  attacks.push({
    id: "A7",
    name: "Hash chain reorder — swap entries 0 and 1",
    result: vr.ok ? "BYPASSED" : "BLOCKED",
    error: (vr as { ok: boolean; reason?: string }).reason ?? "prev_hash mismatch detected",
  });
}

// ── A8: Revoked operator attempts to advance a claim ──────────────────────────
{
  const { engine } = makeEngine();
  const { id: opId } = registerOp(engine, "rop");
  const c = makeClaim(engine, opId);
  engine.keyring_.revoke(opId);
  try {
    engine.advance(c.id, "SPECIFIED", opId);
    attacks.push({ id: "A8", name: "Revoked operator advance", result: "BYPASSED", error: "no error thrown" });
  } catch (e) {
    attacks.push({ id: "A8", name: "Revoked operator advance", result: "BLOCKED", error: (e as Error).message });
  }
}

// ── A9: VALIDATED without operational attestation (rule enforced) ─────────────
{
  const { engine } = makeEngine();
  const { id: opId } = registerOp(engine, "op2");
  const rule: ConstitutionRule = {
    id: "attest-rule",
    version: "1.0.0",
    name: "Attestation Required",
    appliesTo: ["guarded"],
    requiredEvidenceKinds: ["HITL"],
    requiredTruthState: "VALIDATED",
    blockOnMissingEvidence: true,
    requireOperationalAttestation: true,
    constitutionClause: "Core §3.3",
  };
  engine.rules.add(rule);
  const c = engine.registerClaim({
    title: "A9",
    description: "d",
    domainTags: ["guarded"],
    createdAt: new Date().toISOString(),
    operator: opId,
    applicableRuleIds: ["attest-rule"],
  });
  ["SPECIFIED", "IMPLEMENTED", "VERIFIED"].forEach((s) => engine.advance(c.id, s as never, opId));
  try {
    engine.advance(c.id, "VALIDATED", opId);
    attacks.push({ id: "A9", name: "VALIDATED without HITL attestation", result: "BYPASSED", error: "no error thrown" });
  } catch (e) {
    attacks.push({ id: "A9", name: "VALIDATED without HITL attestation", result: "BLOCKED", error: (e as Error).message });
  }
}

// ── Results ────────────────────────────────────────────────────────────────────
const allBlocked = attacks.every((a) => a.result === "BLOCKED");
const output = { run_at: new Date().toISOString(), attacks, allBlocked };
console.log(JSON.stringify(output, null, 2));

const reportPath = new URL("./red-team-report.json", import.meta.url).pathname;
writeFileSync(reportPath, JSON.stringify(output, null, 2) + "\n");
console.log(`\nReport written: ${reportPath}`);

if (!allBlocked) {
  const bypassed = attacks.filter((a) => a.result === "BYPASSED").map((a) => a.id);
  console.error(`\nRED-TEAM FAILED — bypassed: ${bypassed.join(", ")}`);
  process.exit(1);
}
console.log("\nRED-TEAM PASSED — all 9 attack vectors BLOCKED");
