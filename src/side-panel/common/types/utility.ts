export type AtLeastOne<T, U> =
    | (T & Partial<U>)
    | (U & Partial<T>)
    | (T & U);