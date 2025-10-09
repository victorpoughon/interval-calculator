import { describe, it } from "node:test";
import assert from "node:assert";

import { calculator, EvalError } from "../src/calculator.ts";

function expectValidResult(exp: string, fullPrecision: boolean, expected: string) {
    const result = calculator(exp, fullPrecision);
    assert.ok(
        result.kind === "ValidResult",
        `${result.kind}: '${
            (result as EvalError | SyntaxError).message
        }' (expected ValidResult) for expression '${exp}'`
    );
    assert.deepEqual(result.output, expected);
}

function expectSyntaxError(exp: string) {
    const result = calculator(exp, false);
    assert.ok(
        result.kind === "SyntaxError",
        `got ${result.kind} ${
            (result as any).message
        }: (expected SyntaxError) for expression '${exp}'`
    );
}

function expectEvalError(exp: string) {
    const result = calculator(exp, false);
    assert.ok(result.kind === "EvalError", "expected eval error but got " + result.kind);
}

describe("calculator tests", () => {
    it("valid expressions", () => {
        const expect = (exp: string, expected: string) => expectValidResult(exp, false, expected);

        expect("1", "[1, 1]");
        expect("[-2, 2]", "[-2, 2]");
        expect(" [-2, 2]", "[-2, 2]");
        expect(" [ -2, 2]", "[-2, 2]");
        expect(" [ -2 , 2]", "[-2, 2]");
        expect(" [  -2 , 2 ]  ", "[-2, 2]");

        expect("[1, 2] U [5, 10]", "[1, 2] U [5, 10]");
        expect("[1, 2] U ([2, 4] + [5, 5])", "[1, 2] U [7, 9]");
        expect("1-1", "[-5e-324, 5e-324]");
        expect("[1, 2] * [2, 3] U 1 U 0", "[0, 0] U [1, 6]");
        expect("(1 U 2 U 3) * 10", "[10, 10] U [20, 20] U [30, 30]");
        expect("5 U 6 U 10", "[5, 5] U [6, 6] U [10, 10]");
        expect("[1, 2] U [50, 60] + 10", "[11, 12] U [60, 70]");
        expect("[-inf, inf]", "[-∞, +∞]");
        expect("[-∞, +∞]", "[-∞, +∞]");
        expect("-[-∞, +∞]", "[-∞, +∞]");
        expect("+[-∞, +∞]", "[-∞, +∞]");

        expect("[1, 2]^5", "[1, 32]");
        expect("[1, 2]^[1, 2]", "[1, 4]");

        expect("sqrt(1)", "[1, 1]");
        expect("sqrt([1, 4])", "[1, 2]");
        expect("sqrt([-1, 4])", "[0, 2]");
        expect("sqrt([-10, 2] + [0, 2])", "[0, 2]");

        expect("abs([-1, 2])", "[0, 2]");
        expect("abs([-10, 2])", "[0, 10]");
        expect("abs([1, 2])", "[1, 2]");
        expect("abs([-2, -1])", "[1, 2]");

        expect("cos([0, 2*pi])", "[-1, 1]");
        expect("sin([0, 2*pi])", "[-1, 1]");
        expect("sin([-pi, pi])", "[-1, 1]");
        expect("tan([pi/3, 2*pi/3])", "[-∞, -1.732] U [1.732, +∞]");

        expect("[1, [2, 3]]", "[1, 3]");

        expect("10+3*2", "[16, 16]");
    });

    it("invalid syntax", () => {
        const expect = expectSyntaxError;

        expect("");
        expect("U");
        expect("-");
        expect("+");
        expect("++1");
        expect("-+1");
        expect("--1");
        expect("++1");
        expect("1+");
        expect("[");
        expect("[1");
        expect("[1,");
        expect("[1,]");
        expect("[1,]1");
        expect("[]");
        expect("[1, 2] +");
        expect("[--1, 1]");
        expect("[-+1, 1]");
        expect("[++1, 1]");
    });

    it("eval error", () => {
        const expect = expectEvalError;

        expect("sqrt()");
        expect("sqrt(1, 2)");
    });
});
