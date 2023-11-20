export class MapList<K, V> {
    private map: Map<K, Array<V>>

    constructor(entries?: Array<readonly [K, Array<V>]> | null) {
        this.map = new Map(entries)
    }

    forEach(key: K, callbackfn: (value: V, index: number, key: K) => void) {
        if (!this.map.has(key)) return
        this.map.get(key)!.forEach((value, index) => callbackfn(value, index, key))
    }

    push(key: K, value: V) {
        if (!this.map.has(key)) this.map.set(key, [value])
        else {
            const values = this.map.get(key)!
            values.push(value)
        }
        return this
    }
}