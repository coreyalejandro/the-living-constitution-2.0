/**
 * tlc-sl/src/lexer.mjs
 * Hand-rolled tokenizer for TLC-SL. Zero dependencies.
 *
 * Tokens: STRING, IDENT, EQ '=', NEQ '!=', LBRACE '{', RBRACE '}',
 *         LPAREN '(', RPAREN ')', COMMA ','.
 * Comments: '#' to end of line. Whitespace is insignificant.
 * Keywords (and, or, not, implies, if, then, else, true, false, var, input,
 * domain, init, op, guard, effect, safety, invariant, title, article, level,
 * rationale, BLOCK, WARN, LOG) are lexed as IDENT and recognized by the parser.
 */

export class LexError extends Error {}

export function tokenize(src) {
  const tokens = [];
  let i = 0;
  let line = 1;
  let col = 1;

  const push = (type, value, startLine, startCol) =>
    tokens.push({ type, value, line: startLine, col: startCol });

  const advance = (n = 1) => {
    for (let k = 0; k < n; k++) {
      if (src[i] === '\n') { line++; col = 1; } else { col++; }
      i++;
    }
  };

  while (i < src.length) {
    const c = src[i];

    if (c === '\n' || c === ' ' || c === '\t' || c === '\r') { advance(); continue; }

    if (c === '#') {
      while (i < src.length && src[i] !== '\n') advance();
      continue;
    }

    const startLine = line, startCol = col;

    if (c === '"') {
      advance(); // opening quote
      let str = '';
      while (i < src.length && src[i] !== '"') {
        if (src[i] === '\n') throw new LexError(`Unterminated string at line ${startLine}`);
        str += src[i];
        advance();
      }
      if (i >= src.length) throw new LexError(`Unterminated string at line ${startLine}`);
      advance(); // closing quote
      push('STRING', str, startLine, startCol);
      continue;
    }

    if (c === '{') { push('LBRACE', '{', startLine, startCol); advance(); continue; }
    if (c === '}') { push('RBRACE', '}', startLine, startCol); advance(); continue; }
    if (c === '(') { push('LPAREN', '(', startLine, startCol); advance(); continue; }
    if (c === ')') { push('RPAREN', ')', startLine, startCol); advance(); continue; }
    if (c === ',') { push('COMMA', ',', startLine, startCol); advance(); continue; }

    if (c === '!' && src[i + 1] === '=') { push('NEQ', '!=', startLine, startCol); advance(2); continue; }
    if (c === '=') { push('EQ', '=', startLine, startCol); advance(); continue; }

    if (/[A-Za-z_]/.test(c)) {
      let id = '';
      while (i < src.length && /[A-Za-z0-9_]/.test(src[i])) { id += src[i]; advance(); }
      push('IDENT', id, startLine, startCol);
      continue;
    }

    throw new LexError(`Unexpected character '${c}' at line ${line}, col ${col}`);
  }

  push('EOF', null, line, col);
  return tokens;
}
