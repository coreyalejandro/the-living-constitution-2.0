/**
 * tlc-sl/src/model.mjs
 * Builds a JSON-serializable transition-system "model" from a resolved AST.
 * The model is the compiled intermediate representation shared by every target.
 */

export function buildModel(inv) {
  const stateVars = inv.vars.filter((v) => v.kind === 'state');
  const inputVars = inv.vars.filter((v) => v.kind === 'input');
  const domains = Object.fromEntries(inv.vars.map((v) => [v.name, v.domain]));
  const initState = {};
  for (const v of stateVars) initState[v.name] = inv.init[v.name];

  return {
    id: inv.id,
    title: inv.title,
    article: inv.article,
    level: inv.level,
    rationale: inv.rationale,
    stateVars: stateVars.map((v) => v.name),
    inputVars: inputVars.map((v) => v.name),
    domains,
    initState,
    ops: inv.ops,
    safety: inv.safety,
  };
}

/** Cartesian product of the input variables' domains. No inputs -> [{}]. */
export function inputCombos(model) {
  let combos = [{}];
  for (const name of model.inputVars) {
    const next = [];
    for (const c of combos) {
      for (const val of model.domains[name]) next.push({ ...c, [name]: val });
    }
    combos = next;
  }
  return combos;
}
