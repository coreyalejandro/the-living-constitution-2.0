import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { REPO_ROOT } from './contract-manager.js';

export class EvidenceObservatory {
  constructor(options = {}) {
    this.rootDir = options.rootDir ? path.resolve(options.rootDir) : REPO_ROOT;
    this.contractId = options.contractId || 'CRSP-STC-RUNTIME-001';
    this.evidenceDir = options.evidenceDir
      ? path.resolve(this.rootDir, options.evidenceDir)
      : path.join(this.rootDir, 'evidence', this.contractId);
    fs.mkdirSync(this.evidenceDir, { recursive: true });
  }

  pathFor(eventType) {
    if (eventType?.startsWith('HALT_')) return path.join(this.evidenceDir, 'halt-log.jsonl');
    if (eventType === 'VNT_UPDATED' || eventType === 'AC_STATUS_CHANGED') return path.join(this.evidenceDir, 'vnt-audit.jsonl');
    return path.join(this.evidenceDir, 'lifecycle.jsonl');
  }

  makeEntry(partial) {
    const timestamp = partial.timestamp || new Date().toISOString();
    const base = {
      entry_id: partial.entry_id || `${partial.contract_id || this.contractId}-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      timestamp,
      event_type: partial.event_type || 'SYSTEM_ALERT',
      contract_id: partial.contract_id || this.contractId,
      component: partial.component || 'Evidence Observatory',
      decision: partial.decision || 'LOG_ONLY',
      user: partial.user || 'system',
      role: partial.role || 'System',
      payload: partial.payload || {},
      halt_conditions_triggered: partial.halt_conditions_triggered || [],
      halt_conditions_cleared: partial.halt_conditions_cleared || [],
      override_id: partial.override_id ?? null,
      vnt_ref: partial.vnt_ref ?? null,
      evidence_paths: partial.evidence_paths || [],
      message: partial.message || `${partial.event_type || 'SYSTEM_ALERT'} recorded`,
    };
    const integrity_hash = crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex');
    return { ...base, integrity_hash };
  }

  append(partial) {
    const entry = this.makeEntry(partial);
    const logPath = this.pathFor(entry.event_type);
    fs.appendFileSync(logPath, `${JSON.stringify(entry)}\n`, 'utf8');
    return { entry, path: logPath };
  }

  readLog(fileName = 'lifecycle.jsonl') {
    const logPath = path.join(this.evidenceDir, fileName);
    if (!fs.existsSync(logPath)) return [];
    return fs.readFileSync(logPath, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line, index) => {
        try { return JSON.parse(line); }
        catch (error) { return { parse_error: error.message, line: index + 1, raw: line }; }
      });
  }

  latest(limit = 10) {
    const all = ['lifecycle.jsonl', 'halt-log.jsonl', 'vnt-audit.jsonl']
      .flatMap((fileName) => this.readLog(fileName).map((entry) => ({ ...entry, log: fileName })));
    return all.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, limit);
  }
}

export default EvidenceObservatory;
