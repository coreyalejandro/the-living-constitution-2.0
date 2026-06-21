/**
 * tlc-sl/src/interp.mjs
 * The canonical TLC-SL expression evaluator and runtime decision function.
 *
 * This module is the SINGLE semantic authority for TLC-SL. The model checker,
 * the runtime enforcer, and every generated JS target all evaluate expressions
 * through evalExpr() here. That is what guarantees "compiles to runtime
 * enforcement" and "compiles to a formal model" cannot drift: there is exactly
 * one evaluator, used by all targets.
 *
 * Values are either strings (enum members, e.g. "active") or booleans.
 * Expression nodes (see parser.mjs):
 *   { t:'lit',  value }                  literal symbol or boolean
 *   { t:'var',  name }                   reference to a declared variable
 *   { t:'eq',   op:'='|'!=', l, r }      equality / inequality of values
 *   { t:'not',  e }
 *   { t:'and'|'or'|'implies', l, r }
 *   { t:'ite',  c, a, b }                if c then a else b  (returns a value)
 */

export function evalExpr(node, env) {
  switch (node.t) {
    case 'lit':
      return node.value;
    case 'var': {
      if (!(node.name in env)) {
        throw new Error(`unbound variable '${node.name}'`);
      }
      return env[node.name];
    }
    case 'eq': {
      const l = evalExpr(node.l, env);
      const r = evalExpr(node.r, env);
      return node.op === '=' ? l === r : l !== r;
    }
    case 'not':
      return !asBool(evalExpr(node.e, env), node);
    case 'and':
      return asBool(evalExpr(node.l, env), node) && asBool(evalExpr(node.r, env), node);
    case 'or':
      return asBool(evalExpr(node.l, env), node) || asBool(evalExpr(node.r, env), node);
    case 'implies':
      return (!asBool(evalExpr(node.l, env), node)) || asBool(evalExpr(node.r, env), node);
    case 'ite':
      return asBool(evalExpr(node.c, env), node) ? evalExpr(node.a, env) : evalExpr(node.b, env);
    default:
      throw new Error(`unknown expression node '${node.t}'`);
  }
}

function asBool(v, node) {
  if (typeof v !== 'boolean') {
    throw new Error(`expected a boolean in '${node.t}' but got '${String(v)}'`);
  }
  return v;
}

/**
 * decide(model, action)
 *
 * The runtime enforcement primitive. Given a compiled model and an action,
 * returns whether the action is permitted under this invariant.
 *
 *   action.type            the operation name (matched against model.ops[].name)
 *   action.env | action    a flat map of variable -> value (state + inputs)
 *
 * Returns:
 *   { applies:false }                                  invariant has no op named action.type
 *   { applies:true, allowed:true }                     permitted
 *   { applies:true, allowed:false, level, reason }     denied (guard fails OR result unsafe)
 *   { applies:true, error }                            could not evaluate (missing vars)
 */
export function decide(model, action) {
  const op = model.ops.find((o) => o.name === action.type);
  if (!op) return { applies: false };

  // Seed unsupplied state variables from the model's init values. Callers supply
  // the action context (and any inputs); internal modeling state defaults to init.
  const env = { ...(model.initState || {}), ...(action.env || action) };

  let guardOk;
  try {
    guardOk = evalExpr(op.guard, env) === true;
  } catch (e) {
    return { applies: true, error: e.message, invariant: model.id };
  }

  if (!guardOk) {
    return {
      applies: true,
      allowed: false,
      level: model.level,
      invariant: model.id,
      reason: `${model.id} (${model.title}): operation '${op.name}' is not permitted — guard not satisfied`,
    };
  }

  // Guard holds. Confirm the resulting state still satisfies the safety property.
  const next = { ...env };
  try {
    for (const ef of op.effects) next[ef.var] = evalExpr(ef.expr, env);
    const safe = evalExpr(model.safety, next) === true;
    if (!safe) {
      return {
        applies: true,
        allowed: false,
        level: model.level,
        invariant: model.id,
        reason: `${model.id} (${model.title}): operation '${op.name}' would violate the safety property`,
      };
    }
  } catch (e) {
    return { applies: true, error: e.message, invariant: model.id };
  }

  return { applies: true, allowed: true, invariant: model.id };
}
