export type PieceType = "I" | "J" | "L" | "O" | "Z" | "T" | "S";
export type NonEmptyArray<T> = [T, ...T[]];
export type Matrix2D<T> = NonEmptyArray<NonEmptyArray<T>>;
