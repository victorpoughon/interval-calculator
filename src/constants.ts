import * as nsf from "not-so-float";

export function constantUnionRegistry(name: string): nsf.Union | null {
    return constantUnions[name] || null;
}

const constantUnions: Record<string, nsf.Union> = {
    pi: nsf.bounded(Math.PI),
    PI: nsf.bounded(Math.PI),
    e: nsf.bounded(Math.E),
    E: nsf.bounded(Math.E),

    // this is a bit awkward but necesary to avoid stuff like [inf, inf] being valid
    inf: nsf.single(nsf.prev(Infinity), Infinity),
    "∞": nsf.single(nsf.prev(Infinity), Infinity),
};
