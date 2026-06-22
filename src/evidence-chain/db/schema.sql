-- TLC Evidence Chain Engine — PostgreSQL Schema (spec §Gap-7)
-- Version: 2.0.0
-- Replaces: file-backed JSONL ledger (v1.x)
--
-- Design principles:
--   • Append-only evidence (ECE-I5): no DELETE on evidence_items, evidence_links, transitions.
--   • UUIDs everywhere for cross-environment portability.
--   • ltree NOT used (see ADR-002) — adjacency list pattern instead.
--   • challenge_lock implemented as nullable completed_at on challenges table.

BEGIN;

-- ── Extensions ───────────────────────────────────────────────────────────────
-- uuid-ossp provides uuid_generate_v4(); pgcrypto for sha256.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Truth-state enum ─────────────────────────────────────────────────────────
CREATE TYPE truth_state AS ENUM (
  'PROPOSED',
  'SPECIFIED',
  'IMPLEMENTED',
  'VERIFIED',
  'VALIDATED',
  'DEPLOYED',
  'RETRACTED',
  'REVIEW_REQUIRED'
);

-- ── Evidence-level enum ──────────────────────────────────────────────────────
CREATE TYPE evidence_level AS ENUM (
  'E0', 'E1', 'E2', 'E3', 'E4', 'E5'
);

-- ── Evidence-kind enum ───────────────────────────────────────────────────────
CREATE TYPE evidence_kind AS ENUM (
  'SPEC', 'ARTIFACT', 'TEST', 'TRACE', 'BENCHMARK', 'HITL', 'RETRO'
);

-- ── Operator keys ────────────────────────────────────────────────────────────
CREATE TABLE operator_keys (
  id               UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  fingerprint      TEXT    NOT NULL UNIQUE,
  public_key_pem   TEXT    NOT NULL,
  registered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  constitution_ref TEXT    NOT NULL,
  revoked          BOOLEAN NOT NULL DEFAULT FALSE,
  revoked_at       TIMESTAMPTZ
);
CREATE INDEX idx_operator_keys_fingerprint ON operator_keys (fingerprint);

-- ── Claims ───────────────────────────────────────────────────────────────────
CREATE TABLE claims (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT        NOT NULL,
  description         TEXT        NOT NULL DEFAULT '',
  domain_tags         TEXT[]      NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  operator_id         UUID        NOT NULL REFERENCES operator_keys(id),
  state               truth_state NOT NULL DEFAULT 'PROPOSED',
  applicable_rule_ids TEXT[]      NOT NULL DEFAULT '{}'
);
CREATE INDEX idx_claims_state       ON claims (state);
CREATE INDEX idx_claims_operator    ON claims (operator_id);
CREATE INDEX idx_claims_domain_tags ON claims USING GIN (domain_tags);

-- ── Evidence items ───────────────────────────────────────────────────────────
-- Append-only (ECE-I5). No DELETE trigger enforced at DB level here
-- to keep the schema portable; the application layer enforces this.
-- author_operator_id must differ from the claim's operator_id for E3-E5 (ECE-I3).
CREATE TABLE evidence_items (
  id                   UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id             UUID          NOT NULL REFERENCES claims(id),
  kind                 evidence_kind NOT NULL,
  level                evidence_level NOT NULL,
  path                 TEXT          NOT NULL,
  hash                 TEXT          NOT NULL,      -- sha256 hex
  provenance           TEXT          NOT NULL DEFAULT '',
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  operator_id          UUID          NOT NULL REFERENCES operator_keys(id),
  author_operator_id   UUID          REFERENCES operator_keys(id),  -- nullable; set for E3-E5
  machine_readable     BOOLEAN       NOT NULL DEFAULT TRUE,
  signature            TEXT,                        -- base64 Ed25519
  verification_method  TEXT CHECK (verification_method IN ('pgp','git-commit','ed25519')),
  superseded_by        UUID          REFERENCES evidence_items(id)  -- null = current
);
CREATE INDEX idx_evidence_items_claim  ON evidence_items (claim_id);
CREATE INDEX idx_evidence_items_level  ON evidence_items (level);
CREATE INDEX idx_evidence_items_active ON evidence_items (claim_id) WHERE superseded_by IS NULL;

-- ── Evidence links (ADR-002 adjacency list) ──────────────────────────────────
-- No ltree extension. Application-level BFS via hasConnectedPath().
CREATE TABLE evidence_links (
  id                  UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id            UUID  NOT NULL REFERENCES claims(id),
  parent_evidence_id  UUID  NOT NULL REFERENCES evidence_items(id),
  child_evidence_id   UUID  NOT NULL REFERENCES evidence_items(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_loop CHECK (parent_evidence_id <> child_evidence_id)
);
CREATE INDEX idx_evidence_links_claim    ON evidence_links (claim_id);
CREATE INDEX idx_evidence_links_parent   ON evidence_links (parent_evidence_id);
CREATE INDEX idx_evidence_links_child    ON evidence_links (child_evidence_id);
CREATE UNIQUE INDEX idx_evidence_links_unique
  ON evidence_links (parent_evidence_id, child_evidence_id);

-- ── Constitution rules ───────────────────────────────────────────────────────
CREATE TABLE constitution_rules (
  id                          TEXT NOT NULL,
  version                     TEXT NOT NULL,
  name                        TEXT NOT NULL,
  applies_to                  TEXT[] NOT NULL DEFAULT '{}',
  required_evidence_kinds     evidence_kind[] NOT NULL DEFAULT '{}',
  required_truth_state        truth_state NOT NULL,
  block_on_missing_evidence   BOOLEAN NOT NULL DEFAULT TRUE,
  require_operational_att     BOOLEAN NOT NULL DEFAULT FALSE,
  constitution_clause         TEXT NOT NULL,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, version)
);

-- ── Transitions ──────────────────────────────────────────────────────────────
CREATE TYPE transition_result AS ENUM (
  'ALLOWED', 'BLOCKED', 'REVIEW_REQUIRED', 'RETRACTED'
);

CREATE TABLE transitions (
  id           UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id     UUID              NOT NULL REFERENCES claims(id),
  from_state   truth_state       NOT NULL,
  to_state     truth_state       NOT NULL,
  triggered_by UUID              NOT NULL REFERENCES operator_keys(id),
  timestamp    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  rule_id      TEXT              NOT NULL,
  result       transition_result NOT NULL DEFAULT 'ALLOWED',
  notes        TEXT              NOT NULL DEFAULT ''
);
CREATE INDEX idx_transitions_claim ON transitions (claim_id);
CREATE INDEX idx_transitions_ts    ON transitions (timestamp);

-- ── Challenges (spec §Gap-5 / ADR-005) ──────────────────────────────────────
-- A PENDING challenge sets a challenge_lock that blocks forward transitions.
-- challenge_lock is derived: EXISTS (SELECT 1 FROM challenges WHERE claim_id=? AND resolved_at IS NULL).
CREATE TYPE challenge_type AS ENUM (
  'CLAIM', 'EVIDENCE', 'TRANSITION', 'REPLICATION'
);

CREATE TABLE challenges (
  id          UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id    UUID           NOT NULL REFERENCES claims(id),
  type        challenge_type NOT NULL,
  description TEXT           NOT NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,              -- NULL = PENDING (lock is ACTIVE)
  resolution  TEXT                      -- required when resolved_at IS NOT NULL
);
CREATE INDEX idx_challenges_claim    ON challenges (claim_id);
CREATE INDEX idx_challenges_pending  ON challenges (claim_id) WHERE resolved_at IS NULL;

-- View: active (pending) challenge locks per claim
CREATE VIEW claim_challenge_lock AS
  SELECT claim_id, COUNT(*) AS pending_count
  FROM challenges
  WHERE resolved_at IS NULL
  GROUP BY claim_id;

-- ── Ledger (JSONL hash-chain) ────────────────────────────────────────────────
-- Stores the hash-chain entries that back the file-based Ledger.
-- Migration path: write ledger records here instead of JSONL files.
CREATE TABLE ledger_entries (
  id          UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id    UUID  NOT NULL REFERENCES claims(id),
  node_type   TEXT  NOT NULL CHECK (node_type IN ('Claim','EvidenceItem','TransitionRecord')),
  node_json   JSONB NOT NULL,
  prev_hash   TEXT  NOT NULL,
  entry_hash  TEXT  NOT NULL,
  sig         TEXT  NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ledger_claim ON ledger_entries (claim_id);
CREATE INDEX idx_ledger_ts    ON ledger_entries (created_at);

COMMIT;
