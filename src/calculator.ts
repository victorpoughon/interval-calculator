import grammar from "./grammar.ohm-bundle";
import type { IntervalCalculatorSemantics } from "./grammar.ohm-bundle";
import * as ohm from "ohm-js";

import * as nsf from "not-so-float";

import { fregistry } from "./functions.ts";
import { constantUnionRegistry } from "./constants.ts";

export type ValidResult = { kind: "ValidResult"; output: string };
export type SyntaxError = { kind: "SyntaxError"; message: string };
export type EvalError = { kind: "EvalError"; message: string };

export type CalculatorResult = ValidResult | SyntaxError | EvalError;

// Calculator entry point
export function calculator(input: string, fullPrecision: boolean): CalculatorResult {
    const match = grammar.match(input);

    if (match.failed()) {
        return { kind: "SyntaxError", message: "Syntax Error" };
    }

    const sem = makeSemantics(fullPrecision);
    try {
        const result: nsf.Union = sem(match).evalUnion();
        const output = renderResult(result, fullPrecision);
        return { kind: "ValidResult", output: output };
    } catch (error: any) {
        const message = `error: ${error.message}`;
        return { kind: "EvalError", message: message };
    }
}

function renderResult(result: nsf.Union, fullPrecision: boolean): string {
    if (fullPrecision) {
        return result.toString((x) => {
            if (x === Infinity) return "+∞";
            if (x === -Infinity) return "-∞";
            return x.toString();
        });
    } else {
        return result.toString((x) => {
            if (x === Infinity) return "+∞";
            if (x === -Infinity) return "-∞";
            return parseFloat(x.toPrecision(4)).toString();
        });
    }
}

// Prefer this to sem.evalUnion () for stronger typing
function evalUnion(arg: ohm.Node): nsf.Union {
    return arg.evalUnion();
}

function parseNumber(s: string): number {
    if (s === "inf" || s === "∞") return Infinity;
    return parseFloat(s);
}

function isStringInteger(str: string): boolean {
    return /^-?\d+$/.test(str);
}

// Construct a union from a single number
function unionNumber(val: number, fullPrecision: boolean): nsf.Union {
    if (val === 0) return nsf.single(0, 0);
    else if (fullPrecision) return nsf.bounded(val);
    else return nsf.single(val, val);
}

function makeSemantics(fullPrecision: boolean): IntervalCalculatorSemantics {
    const sem = grammar.createSemantics();

    sem.addOperation("evalUnion", {
        AddExp_add(
            arg0: ohm.NonterminalNode,
            _: ohm.TerminalNode,
            arg2: ohm.NonterminalNode
        ): nsf.Union {
            return nsf.add(evalUnion(arg0), evalUnion(arg2));
        },

        AddExp_sub(
            arg0: ohm.NonterminalNode,
            _: ohm.TerminalNode,
            arg2: ohm.NonterminalNode
        ): nsf.Union {
            return nsf.sub(evalUnion(arg0), evalUnion(arg2));
        },

        MulExp_mul(
            arg0: ohm.NonterminalNode,
            _: ohm.TerminalNode,
            arg2: ohm.NonterminalNode
        ): nsf.Union {
            return nsf.mul(evalUnion(arg0), evalUnion(arg2));
        },

        MulExp_div(
            arg0: ohm.NonterminalNode,
            _: ohm.TerminalNode,
            arg2: ohm.NonterminalNode
        ): nsf.Union {
            return nsf.div(evalUnion(arg0), evalUnion(arg2));
        },

        PowExp_pow(
            base: ohm.NonterminalNode,
            _: ohm.TerminalNode,
            exponent: ohm.NonterminalNode
        ): nsf.Union {
            const baseUnion = evalUnion(base);
            // TODO also defer to powInt when exponent is a degenerate interval and integer
            if (isStringInteger(exponent.sourceString)) {
                const exponentNumber = parseNumber(exponent.sourceString);
                return nsf.powInt(baseUnion, exponentNumber);
            } else {
                const exponentUnion = evalUnion(exponent);
                return nsf.pow(baseUnion, exponentUnion);
            }
        },

        UnionExp_union(
            arg1: ohm.NonterminalNode,
            _: ohm.TerminalNode,
            arg2: ohm.NonterminalNode
        ): nsf.Union {
            return nsf.union([...evalUnion(arg1).intervals, ...evalUnion(arg2).intervals]);
        },

        UnaryTerm_neg(_: ohm.TerminalNode, arg1: ohm.NonterminalNode): nsf.Union {
            return nsf.neg(evalUnion(arg1));
        },

        UnaryTerm_pos(_: ohm.TerminalNode, arg1: ohm.NonterminalNode): nsf.Union {
            return evalUnion(arg1);
        },

        Term_paren(
            _1: ohm.TerminalNode,
            arg1: ohm.NonterminalNode,
            _2: ohm.TerminalNode
        ): nsf.Union {
            return evalUnion(arg1);
        },

        Term_constant(name: ohm.NonterminalNode): nsf.Union {
            const value = constantUnionRegistry(name.sourceString);

            if (value === null) {
                throw Error(`Unknown interval or union '${name.sourceString}'`);
            }

            return value;
        },

        Term_infsymbol(_: ohm.NonterminalNode): nsf.Union {
            return nsf.FULL;
        },

        FunctionExp(
            name: ohm.IterationNode,
            _1: ohm.TerminalNode,
            args: ohm.NonterminalNode,
            _3: ohm.TerminalNode
        ): nsf.Union {
            // Evaluate all children
            const argsResults = args.asIteration().children.map((c) => evalUnion(c));

            // Get function from the registry
            const func = fregistry(name.sourceString);
            if (func === null) {
                throw Error(`Unknown function '${name.sourceString}'`);
            }

            // Check arity
            const arity = args.asIteration().numChildren;
            if (!func.checkArity(arity)) {
                throw Error(
                    `'${name.sourceString}' expects ${func.arityText} arguments, got ${arity}`
                );
            }

            // Evaluate function
            return func.func(...argsResults);
        },

        Interval(
            _1: ohm.TerminalNode,
            arg0: ohm.NonterminalNode,
            _2: ohm.TerminalNode,
            arg1: ohm.NonterminalNode,
            _3: ohm.TerminalNode
        ): nsf.Union {
            const leftUnion = evalUnion(arg0);
            const rightUnion = evalUnion(arg1);

            if (leftUnion.isEmpty()) {
                throw Error(`empty lower bound: ${arg0.sourceString}`);
            }
            if (rightUnion.isEmpty()) {
                throw Error(`empty upper bound: ${arg1.sourceString}`);
            }

            const lo = leftUnion.intervals[0].lo;
            const hi = rightUnion.intervals[rightUnion.intervals.length - 1].hi;

            return nsf.single(lo, hi);
        },

        number(digits: ohm.NonterminalNode): nsf.Union {
            const val = parseNumber(digits.sourceString);
            return unionNumber(val, fullPrecision);
        },
    });

    return sem;
}
