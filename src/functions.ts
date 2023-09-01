export function extend<O, F extends (...args: any) => any>(func: F, extention: O): F & O {
    return Object.assign(func, extention)
}
