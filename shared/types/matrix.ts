export type NonEmptyArray<T> = [T, ...T[]];
export type Matrix2D<T> = NonEmptyArray<NonEmptyArray<T>>;
