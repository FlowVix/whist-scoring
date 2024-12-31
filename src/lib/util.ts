export const arrFrom = <T>(len: number, cb: (i: number) => T): T[] =>
    Array(len).fill(0).map((_, i) => cb(i));

export const clamp = (v: number, min: number, max: number): number =>
    Math.min(max, Math.max(v, min));

export const rotArray = <T>(arr: T[], amount: number): T[] => {
    let out = [];
    for (let i = 0; i < arr.length; i++) {
        out.push(arr[(i + amount) % arr.length]);
    }
    return out;
};
