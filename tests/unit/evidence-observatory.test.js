import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import EvidenceObservatory from '../../src/core/evidence-observatory.js';

describe('EvidenceObservatory', () => {
  test('appends readable JSONL evidence entries', () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tlc-evidence-'));
    const evidence = new EvidenceObservatory({ rootDir: tempRoot, contractId: 'CRSP-STC-RUNTIME-001' });
    const { entry, path: logPath } = evidence.append({
      event_type: 'SYSTEM_ALERT',
      component: 'test',
      decision: 'LOG_ONLY',
      user: 'jest',
      role: 'System',
      message: 'test entry',
    });
    expect(fs.existsSync(logPath)).toBe(true);
    expect(entry.integrity_hash).toHaveLength(64);
    expect(evidence.latest(1)[0].message).toBe('test entry');
  });
});
