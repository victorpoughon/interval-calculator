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
    const K = nsf.ulog(nsf.union([nsf.inter(nsf.prev(base), nsf.next(base))]));
    return nsf.udiv(nsf.ulog(U), K);
}

function upperBound(U: nsf.Union): nsf.Union {
    const length = U.intervals.length;
    if (length === 0) return nsf.EMPTY;
    const hi = U.intervals[length - 1].hi;
    return nsf.union([nsf.inter(hi)]);
}

function lowerBound(U: nsf.Union): nsf.Union {
    const length = U.intervals.length;
    if (length === 0) return nsf.EMPTY;
    const lo = U.intervals[length - 1].lo;
    return nsf.union([nsf.inter(lo)]);
}

function hull(U: nsf.Union): nsf.Union {
    const length = U.intervals.length;
    if (length === 0) return nsf.EMPTY;
    const lo = U.intervals[0].lo;
    const hi = U.intervals[length - 1].hi;
    return nsf.union([nsf.inter(lo, hi)]);
}

const externalFunctions: Record<string, ExternalFunction> = {
    // 0-ary
    pi: fixedArity(0, () => nsf.union([nsf.inter(nsf.prev(Math.PI), nsf.next(Math.PI))])),

    // Unary
    lo: fixedArity(1, lowerBound),
    hi: fixedArity(1, upperBound),
    hull: fixedArity(1, hull),
    abs: fixedArity(1, nsf.uabs),
    sqrt: fixedArity(1, nsf.usqrt),
    log: fixedArity(1, nsf.ulog),
    log2: fixedArity(1, (u) => logBase(u, 2)),
    log10: fixedArity(1, (u) => logBase(u, 10)),
    exp: fixedArity(1, nsf.uexp),
    cos: fixedArity(1, nsf.ucos),
    sin: fixedArity(1, nsf.usin),
    tan: fixedArity(1, nsf.utan),
    sqinv: fixedArity(1, nsf.sqinv),

    // Binary
    min: fixedArity(2, nsf.umin),
    max: fixedArity(2, nsf.umax),
};
