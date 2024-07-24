import type { Add, Decrement, GT, Increment, LT } from "./math.js";

/**
 * Defines keys that are valid for sorting
 */
type SortKeys<T extends object> = {
  [Key in keyof T]: T[Key] extends number ? Key : never;
}[Extract<keyof T, string>];

/**
 * An item to use in the heap sort
 */
type HeapSortItem<N extends number = number, T extends object = object> = {
  value: N;
  item: T;
};

/**
 * Map the given items into a HeapSortItem array
 */
type MapItems<
  T extends object,
  Prop extends SortKeys<T>,
  Values
> = Values extends [infer Next extends T, ...infer Rest]
  ? Next[Prop] extends number
    ? Rest extends never[]
      ? [HeapSortItem<Next[Prop], Next>]
      : [HeapSortItem<Next[Prop], Next>, ...MapItems<T, Prop, Rest>]
    : never
  : never;

/**
 * Extract the original items
 */
type ExtractItems<
  T extends object,
  Items extends HeapSortItem[]
> = Items extends [infer Next extends HeapSortItem<number, T>, ...infer Rest]
  ? Rest extends never[]
    ? [Next["item"]]
    : Rest extends HeapSortItem[]
    ? [Next["item"], ...ExtractItems<T, Rest>]
    : never
  : never;

/**
 * Replace the value at the given location
 */
type Replace<
  Arr,
  Item extends HeapSortItem,
  Idx extends number,
  N extends number = 0
> = Arr extends [infer Next extends HeapSortItem, ...infer Rest]
  ? N extends Idx
    ? [Item, ...Rest]
    : Rest extends never[]
    ? [Next]
    : [Next, ...Replace<Rest, Item, Idx, Increment<N>>]
  : never;

/**
 * Swap two elements in the array
 */
type Swap<
  Arr extends HeapSortItem[],
  Left extends number,
  Right extends number
> = Replace<Replace<Arr, Arr[Right], Left>, Arr[Left], Right>;

/**
 * "Mulitiply" the number by 2
 */
type TwoN<Index extends number> = Add<0, Index> extends infer N extends number
  ? Add<N, Index> extends infer N2 extends number
    ? N2
    : never
  : never;

/**
 * "Divide" the number by 2
 */
type DivBy2<
  Index extends number,
  C extends number = 0
> = TwoN<C> extends infer N extends number
  ? N extends Index
    ? C
    : GT<Index, N> extends true
    ? DivBy2<Index, Increment<C>>
    : Decrement<C>
  : never;

/**
 * Get the left child of the index
 */
type LeftChild<Index extends number> =
  TwoN<Index> extends infer N extends number
    ? Add<N, 1> extends infer TwoNPlus1 extends number
      ? TwoNPlus1
      : never
    : never;

/**
 * Get the right child of the index
 */
type RightChild<Index extends number> =
  TwoN<Index> extends infer N extends number
    ? Add<N, 2> extends infer TwoNPlus2 extends number
      ? TwoNPlus2
      : never
    : never;

/**
 * Get the parent of the given index
 */
type Parent<Index extends number> =
  Decrement<Index> extends infer N extends number
    ? DivBy2<N> extends infer _ extends number
      ? _
      : never
    : never;

/**
 * Ensure the child moves up the heap if it's larger than it's parent
 */
type SiftUp<Arr extends HeapSortItem[], Idx extends number> = Idx extends 0
  ? Arr
  : Parent<Idx> extends infer _ extends number
  ? GT<Arr[Idx]["value"], Arr[_]["value"]> extends true
    ? Swap<Arr, _, Idx> extends infer Sifted extends HeapSortItem[]
      ? SiftUp<Sifted, _>
      : never
    : Arr
  : never;

/**
 * Move values down until the heap is back in a valid state
 */
type SiftDown<
  Arr extends HeapSortItem[],
  Idx extends number,
  Limit extends number
> = LeftChild<Idx> extends infer LC extends number
  ? LT<LC, Limit> extends true
    ? RightChild<Idx> extends infer RC extends number
      ? LT<RC, Limit> extends true
        ? GT<Arr[LC]["value"], Arr[RC]["value"]> extends true // Have to check GT of left or right
          ? LT<Arr[Idx]["value"], Arr[LC]["value"]> extends true
            ? Swap<Arr, Idx, LC> extends infer _ extends HeapSortItem[]
              ? SiftDown<_, LC, Limit>
              : never
            : Arr
          : LT<Arr[Idx]["value"], Arr[RC]["value"]> extends true
          ? Swap<Arr, Idx, RC> extends infer _ extends HeapSortItem[]
            ? SiftDown<_, RC, Limit>
            : never
          : Arr
        : LT<Arr[Idx]["value"], Arr[LC]["value"]> extends true
        ? Swap<Arr, Idx, LC> extends infer _ extends HeapSortItem[]
          ? SiftDown<_, LC, Limit>
          : never
        : Arr // Already sorted
      : never
    : Arr // No further children
  : never; // left child is always a number

/**
 * Heapify the array one element ta a time
 */
type Heapify<
  Arr extends HeapSortItem[],
  Limit extends number,
  N extends number = 0
> = N extends Limit
  ? Arr // Done
  : SiftUp<Arr, N> extends infer _ extends HeapSortItem[]
  ? Heapify<_, Limit, Increment<N>>
  : never;

/**
 * Perform the in place heap sort
 */
type HeapSort<
  T extends object,
  Items extends HeapSortItem[],
  N extends number = Decrement<Items["length"]>
> = N extends 0
  ? ExtractItems<T, Items>
  : Swap<Items, 0, N> extends infer Partial extends HeapSortItem[]
  ? SiftDown<
      Partial,
      0,
      Decrement<N>
    > extends infer Sifted extends HeapSortItem[]
    ? HeapSort<T, Sifted, Decrement<N>>
    : never
  : never;

/**
 * Perform a heap sort of the items using the property key defined
 */
export type Sort<
  T extends object,
  Values extends T[],
  Prop extends SortKeys<T>
> = MapItems<T, Prop, Values> extends infer Items extends HeapSortItem[]
  ? Heapify<
      Items,
      Items["length"]
    > extends infer HeapItems extends HeapSortItem[]
    ? HeapSort<T, HeapItems>
    : never
  : never;
