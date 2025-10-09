import * as nsf from "not-so-float";

export function constantUnionRegistry(name: string): nsf.Union | null {
    return constantUnions[name] || null;
}

const constantUnions: Record<string, nsf.Union> = {
    pi: nsf.union([nsf.inter(nsf.prev(Math.PI), nsf.next(Math.PI))]),
    PI: nsf.union([nsf.inter(nsf.prev(Math.PI), nsf.next(Math.PI))]),
    e: nsf.union([nsf.inter(nsf.prev(Math.E), nsf.next(Math.E))]),
    E: nsf.union([nsf.inter(nsf.prev(Math.E), nsf.next(Math.E))]),

    // this is a bit awkward but necesary to avoid stuff like [inf, inf] being valid
    inf: nsf.union([nsf.inter(nsf.prev(Infinity), Infinity)]),
    "∞": nsf.union([nsf.inter(nsf.prev(Infinity), Infinity)]),
};
