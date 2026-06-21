# TLC-SL Grammar (v0.1)

TLC-SL is a small language for writing one constitutional invariant as a **safety property
over a finite-state transition system**. The same definition compiles to runtime enforcement,
an in-process exhaustive model check, and a TLA+ module.

## Lexical structure

- Comments: `#` to end of line.
- Strings: double-quoted, e.g. `"INV-001"`.
- Identifiers: `[A-Za-z_][A-Za-z0-9_]*`.
- Symbols: `{ } ( ) ,` and the operators `=` and `!=`.
- Whitespace is insignificant.

## Grammar (EBNF)

```ebnf
file        = { invariant } ;
invariant   = "invariant" string "{" { clause } "}" ;

clause      = "title" string
            | "article" string
            | "rationale" string
            | "level" ( "BLOCK" | "WARN" | "LOG" )
            | "var"   ident "domain" "{" ident { "," ident } "}"
            | "input" ident "domain" "{" ident { "," ident } "}"
            | "init"  "{" assign { "," assign } "}"
            | "op"    ident "{" "guard" expr [ "effect" "{" [ assign_expr { "," assign_expr } ] "}" ] "}"
            | "safety" expr ;

assign      = ident "=" ident ;            (* init: variable = domain member *)
assign_expr = ident "=" expr ;             (* effect: variable = expression  *)

expr        = implies ;
implies     = or   [ "implies" implies ] ;          (* right associative *)
or          = and  { "or"  and } ;
and         = cmp_or_not { "and" cmp_or_not } ;
cmp_or_not  = "not" cmp_or_not
            | cmp ;
cmp         = primary [ ( "=" | "!=" ) primary ] ;
primary     = "(" expr ")"
            | "if" expr "then" expr "else" expr
            | "true" | "false"
            | ident ;                       (* a declared var, else an enum literal *)
```

## Semantics

- **Variables.** `var` declares *persistent state*; `input` declares a *per-action* value.
  Every variable has a finite domain (a set of enum members). `init` assigns a starting value
  to every state variable.
- **Operations.** Each `op` has a `guard` (a boolean expression over state and inputs) and an
  optional `effect` (assignments to state variables). At runtime an operation is permitted
  only if its guard holds and the resulting state still satisfies `safety`.
- **Safety.** A boolean predicate over **state variables only**. It must hold in every
  reachable state. The model checker verifies this exhaustively over the finite reachable
  state space.
- **Expressions.** Values are enum members (strings) or booleans. `=`/`!=` compare values;
  `and`/`or`/`not`/`implies` are boolean; `if c then a else b` returns a value. Precedence,
  lowest to highest: `implies` < `or` < `and` < `not` < `=`/`!=` < primary.

## Static checks (enforced by the parser)

- Every state variable must have an `init` value inside its domain.
- `effect` may assign only state variables (never inputs).
- `safety` may reference only state variables (not inputs).
- Comparing a variable to a literal outside its domain produces a warning.

## Two common shapes

- **Stateful invariant** (e.g. INV-001, INV-010, INV-011): declares state, init, guarded
  operations with effects, and a safety predicate over state.
- **Access-control invariant** (e.g. INV-023, INV-040): a per-action `input` plus a small
  state flag that records a breach; the guard denies the forbidden combination, the safety
  property asserts the breach flag is never set. Removing the guard makes the breach reachable
  — which the necessity check reports.
