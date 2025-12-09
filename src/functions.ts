import * as nsf from "not-so-float";

type UnionFunction = (...args: nsf.Union[]) => nsf.Union;

export type ExternalFunction = {
    checkArity: (n: number) => boolean;
    arityText: string;
    func: UnionFunction;
};

export function fregistry(name: string): ExternalFunction | null {
    return externalFunctions[name] || null;
}

function fixedArity(n: number, func: UnionFunction): ExternalFunction {
    return {
        checkArity: (a: number) => n === a,
        arityText: n.toString(),
        func: func,
    };
}

function logBase(U: nsf.Union, base: number): nsf.Union {
    const K = nsf.log(nsf.bounded(base));
    return nsf.div(nsf.log(U), K);
}

function upperBound(U: nsf.Union): nsf.Union {
    const length = U.intervals.length;
    if (length === 0) return nsf.EMPTY;
    const hi = U.intervals[length - 1].hi;
    return nsf.single(hi);
}

function lowerBound(U: nsf.Union): nsf.Union {
    const length = U.intervals.length;
    if (length === 0) return nsf.EMPTY;
    const lo = U.intervals[length - 1].lo;
    return nsf.single(lo);
}

const externalFunctions: Record<string, ExternalFunction> = {
    // 0-ary
    pi: fixedArity(0, () => nsf.bounded(Math.PI)),

    // Unary
    lo: fixedArity(1, lowerBound),
    hi: fixedArity(1, upperBound),
    hull: fixedArity(1, (u) => u.hull()),
    abs: fixedArity(1, nsf.abs),
    sqrt: fixedArity(1, nsf.sqrt),
    log: fixedArity(1, nsf.log),
    log2: fixedArity(1, (u) => logBase(u, 2)),
    log10: fixedArity(1, (u) => logBase(u, 10)),
    exp: fixedArity(1, nsf.exp),
    cos: fixedArity(1, nsf.cos),
    sin: fixedArity(1, nsf.sin),
    tan: fixedArity(1, nsf.tan),
    acos: fixedArity(1, nsf.acos),
    asin: fixedArity(1, nsf.asin),
    atan: fixedArity(1, nsf.atan),
    sqinv: fixedArity(1, nsf.sqinv),

    // Binary
    min: fixedArity(2, nsf.min),
    max: fixedArity(2, nsf.max),
};
