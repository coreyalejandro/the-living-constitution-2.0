/**
 * tlc-sl/src/parser.mjs
 * Recursive-descent parser for TLC-SL. Zero dependencies.
 *
 * Produces a resolved AST per invariant:
 *   {
 *     id, title, article, level, rationale,
 *     vars:  [{ name, kind:'state'|'input', domain:[...] }],
 *     init:  { name: value, ... },           // state vars only
 *     ops:   [{ name, guard:Expr, effects:[{var, expr:Expr}] }],
 *     safety: Expr
 *   }
 *
 * Expression grammar (lowest to highest precedence):
 *   implies  (right-assoc)  ->  or  ->  and  ->  not (unary)  ->  equality  ->  primary
 *   primary := '(' expr ')' | 'if' expr 'then' expr 'else' expr | IDENT | 'true' | 'false'
 */

import { tokenize } from './lexer.mjs';

export class ParseError extends Error {}

const RESERVED = new Set([
  'and', 'or', 'not', 'implies', 'if', 'then', 'else', 'true', 'false',
  'var', 'input', 'domain', 'init', 'op', 'guard', 'effect', 'safety',
  'invariant', 'title', 'article', 'level', 'rationale',
]);

class Cursor {
  constructor(tokens) { this.tokens = tokens; this.pos = 0; }
  peek(k = 0) { return this.tokens[this.pos + k]; }
  next() { return this.tokens[this.pos++]; }
  atEnd() { return this.peek().type === 'EOF'; }
  expect(type) {
    const t = this.next();
    if (t.type !== type) {
      throw new ParseError(`Expected ${type} but got ${t.type} '${t.value}' at line ${t.line}, col ${t.col}`);
    }
    return t;
  }
  // expect an IDENT with a specific keyword value
  expectKw(kw) {
    const t = this.next();
    if (t.type !== 'IDENT' || t.value !== kw) {
      throw new ParseError(`Expected '${kw}' but got '${t.value}' at line ${t.line}, col ${t.col}`);
    }
    return t;
  }
  isKw(kw, k = 0) {
    const t = this.peek(k);
    return t.type === 'IDENT' && t.value === kw;
  }
}

export function parse(src) {
  const cur = new Cursor(tokenize(src));
  const invariants = [];
  const warnings = [];
  while (!cur.atEnd()) {
    invariants.push(parseInvariant(cur, warnings));
  }
  return { invariants, warnings };
}

function parseInvariant(cur, warnings) {
  cur.expectKw('invariant');
  const id = cur.expect('STRING').value;
  cur.expect('LBRACE');

  const inv = {
    id, title: '', article: '', level: 'BLOCK', rationale: '',
    vars: [], init: {}, ops: [], safety: null,
  };

  while (cur.peek().type !== 'RBRACE') {
    const t = cur.peek();
    if (t.type !== 'IDENT') {
      throw new ParseError(`Expected a clause keyword but got ${t.type} '${t.value}' at line ${t.line}`);
    }
    switch (t.value) {
      case 'title': cur.next(); inv.title = cur.expect('STRING').value; break;
      case 'article': cur.next(); inv.article = cur.expect('STRING').value; break;
      case 'rationale': cur.next(); inv.rationale = cur.expect('STRING').value; break;
      case 'level': {
        cur.next();
        const lv = cur.expect('IDENT').value;
        if (!['BLOCK', 'WARN', 'LOG'].includes(lv)) {
          throw new ParseError(`level must be BLOCK, WARN, or LOG (got '${lv}')`);
        }
        inv.level = lv; break;
      }
      case 'var': case 'input': {
        const kind = cur.next().value === 'var' ? 'state' : 'input';
        const name = identName(cur);
        cur.expectKw('domain');
        cur.expect('LBRACE');
        const domain = [];
        domain.push(identName(cur));
        while (cur.peek().type === 'COMMA') { cur.next(); domain.push(identName(cur)); }
        cur.expect('RBRACE');
        inv.vars.push({ name, kind, domain });
        break;
      }
      case 'init': {
        cur.next();
        cur.expect('LBRACE');
        const first = readAssignmentValue(cur);
        inv.init[first.name] = first.value;
        while (cur.peek().type === 'COMMA') {
          cur.next();
          const a = readAssignmentValue(cur);
          inv.init[a.name] = a.value;
        }
        cur.expect('RBRACE');
        break;
      }
      case 'op': {
        cur.next();
        const name = identName(cur);
        cur.expect('LBRACE');
        cur.expectKw('guard');
        const guard = parseExpr(cur);
        const effects = [];
        if (cur.isKw('effect')) {
          cur.next();
          cur.expect('LBRACE');
          if (cur.peek().type !== 'RBRACE') {
            effects.push(readEffect(cur));
            while (cur.peek().type === 'COMMA') { cur.next(); effects.push(readEffect(cur)); }
          }
          cur.expect('RBRACE');
        }
        cur.expect('RBRACE');
        inv.ops.push({ name, guard, effects });
        break;
      }
      case 'safety': {
        cur.next();
        inv.safety = parseExpr(cur);
        break;
      }
      default:
        throw new ParseError(`Unknown clause '${t.value}' at line ${t.line}, col ${t.col}`);
    }
  }
  cur.expect('RBRACE');

  if (inv.safety === null) throw new ParseError(`Invariant ${id} has no safety clause`);

  return resolveAndCheck(inv, warnings);
}

function identName(cur) {
  const t = cur.expect('IDENT');
  return t.value;
}

function readAssignmentValue(cur) {
  const name = cur.expect('IDENT').value;
  cur.expect('EQ');
  const v = cur.expect('IDENT').value;
  return { name, value: v };
}

function readEffect(cur) {
  const v = cur.expect('IDENT').value;
  cur.expect('EQ');
  const expr = parseExpr(cur);
  return { var: v, expr };
}

/* ---------- expression parsing ---------- */

function parseExpr(cur) { return parseImplies(cur); }

function parseImplies(cur) {
  const left = parseOr(cur);
  if (cur.isKw('implies')) {
    cur.next();
    const right = parseImplies(cur); // right-associative
    return { t: 'implies', l: left, r: right };
  }
  return left;
}

function parseOr(cur) {
  let left = parseAnd(cur);
  while (cur.isKw('or')) { cur.next(); left = { t: 'or', l: left, r: parseAnd(cur) }; }
  return left;
}

function parseAnd(cur) {
  let left = parseNot(cur);
  while (cur.isKw('and')) { cur.next(); left = { t: 'and', l: left, r: parseNot(cur) }; }
  return left;
}

function parseNot(cur) {
  if (cur.isKw('not')) { cur.next(); return { t: 'not', e: parseNot(cur) }; }
  return parseCmp(cur);
}

function parseCmp(cur) {
  const left = parsePrimary(cur);
  if (cur.peek().type === 'EQ' || cur.peek().type === 'NEQ') {
    const op = cur.next().type === 'EQ' ? '=' : '!=';
    const right = parsePrimary(cur);
    return { t: 'eq', op, l: left, r: right };
  }
  return left;
}

function parsePrimary(cur) {
  const t = cur.peek();
  if (t.type === 'LPAREN') {
    cur.next();
    const e = parseExpr(cur);
    cur.expect('RPAREN');
    return e;
  }
  if (cur.isKw('if')) {
    cur.next();
    const c = parseExpr(cur);
    cur.expectKw('then');
    const a = parseExpr(cur);
    cur.expectKw('else');
    const b = parseExpr(cur);
    return { t: 'ite', c, a, b };
  }
  if (cur.isKw('true')) { cur.next(); return { t: 'lit', value: true }; }
  if (cur.isKw('false')) { cur.next(); return { t: 'lit', value: false }; }
  if (t.type === 'IDENT') {
    cur.next();
    return { t: 'name', name: t.value }; // resolved later to var or lit
  }
  throw new ParseError(`Unexpected ${t.type} '${t.value}' in expression at line ${t.line}, col ${t.col}`);
}

/* ---------- resolution + static checks ---------- */

function resolveAndCheck(inv, warnings) {
  const stateVars = new Set(inv.vars.filter((v) => v.kind === 'state').map((v) => v.name));
  const inputVars = new Set(inv.vars.filter((v) => v.kind === 'input').map((v) => v.name));
  const allVars = new Set([...stateVars, ...inputVars]);
  const domainOf = Object.fromEntries(inv.vars.map((v) => [v.name, new Set(v.domain)]));

  const resolve = (node) => {
    switch (node.t) {
      case 'name':
        return allVars.has(node.name) ? { t: 'var', name: node.name } : { t: 'lit', value: node.name };
      case 'lit': return node;
      case 'eq': return { t: 'eq', op: node.op, l: resolve(node.l), r: resolve(node.r) };
      case 'not': return { t: 'not', e: resolve(node.e) };
      case 'and': case 'or': case 'implies':
        return { t: node.t, l: resolve(node.l), r: resolve(node.r) };
      case 'ite': return { t: 'ite', c: resolve(node.c), a: resolve(node.a), b: resolve(node.b) };
      default: return node;
    }
  };

  inv.ops = inv.ops.map((op) => ({
    name: op.name,
    guard: resolve(op.guard),
    effects: op.effects.map((e) => ({ var: e.var, expr: resolve(e.expr) })),
  }));
  inv.safety = resolve(inv.safety);

  // Static checks
  if (inv.vars.length === 0) throw new ParseError(`Invariant ${inv.id} declares no variables`);

  for (const name of stateVars) {
    if (!(name in inv.init)) throw new ParseError(`Invariant ${inv.id}: state var '${name}' has no init value`);
    if (!domainOf[name].has(inv.init[name])) {
      throw new ParseError(`Invariant ${inv.id}: init value '${inv.init[name]}' for '${name}' is not in its domain`);
    }
  }
  for (const k of Object.keys(inv.init)) {
    if (!stateVars.has(k)) throw new ParseError(`Invariant ${inv.id}: init refers to '${k}' which is not a state var`);
  }
  for (const op of inv.ops) {
    for (const ef of op.effects) {
      if (!stateVars.has(ef.var)) {
        throw new ParseError(`Invariant ${inv.id}: op '${op.name}' assigns '${ef.var}' which is not a state var`);
      }
    }
  }
  // Safety must reference only state vars (it is a predicate over reachable states).
  for (const name of varsIn(inv.safety)) {
    if (inputVars.has(name)) {
      throw new ParseError(`Invariant ${inv.id}: safety references input var '${name}'; safety must be over state only`);
    }
  }
  // Soft check: literals compared to a var should be in that var's domain.
  checkLiteralDomains(inv, domainOf, warnings);

  return inv;
}

function varsIn(node, acc = new Set()) {
  switch (node.t) {
    case 'var': acc.add(node.name); break;
    case 'eq': varsIn(node.l, acc); varsIn(node.r, acc); break;
    case 'not': varsIn(node.e, acc); break;
    case 'and': case 'or': case 'implies': varsIn(node.l, acc); varsIn(node.r, acc); break;
    case 'ite': varsIn(node.c, acc); varsIn(node.a, acc); varsIn(node.b, acc); break;
    default: break;
  }
  return acc;
}

function checkLiteralDomains(inv, domainOf, warnings) {
  const visit = (node) => {
    if (node.t === 'eq') {
      const pairs = [[node.l, node.r], [node.r, node.l]];
      for (const [a, b] of pairs) {
        if (a.t === 'var' && b.t === 'lit' && typeof b.value === 'string') {
          if (!domainOf[a.name].has(b.value)) {
            warnings.push(`${inv.id}: literal '${b.value}' compared to var '${a.name}' is not in its domain`);
          }
        }
      }
    }
    for (const key of ['l', 'r', 'e', 'c', 'a', 'b']) if (node[key]) visit(node[key]);
  };
  inv.ops.forEach((op) => { visit(op.guard); op.effects.forEach((e) => visit(e.expr)); });
  visit(inv.safety);
}
