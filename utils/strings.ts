import type { Decrement, Increment, LT } from "./math.js";

/**
 * Split the string using the given token
 */
export type Split<
  Original extends string,
  Token extends string
> = Original extends `${infer Left}${Token}${infer Right}`
  ? [Left, ...Split<Right, Token>]
  : [Original];

/**
 * Find the length of the string
 */
export type StrLen<
  Original extends string,
  N extends number = 0
> = Original extends ""
  ? N
  : Original extends `${infer _}${infer Rest}`
  ? StrLen<Rest, Increment<N>>
  : -1;

/**
 * Find the index of the character in the string
 */
export type IndexOf<
  Original extends string,
  Token extends string,
  N extends number = 0
> = Original extends ""
  ? -1
  : Original extends `${Token}${infer _}`
  ? N
  : Original extends `${infer _}${infer Rest}`
  ? IndexOf<Rest, Token, Increment<N>>
  : -1;

/**
 * Split into groups with open/close tokens at barriers
 */
export type SplitGroups<
  Original extends string,
  OpenToken extends string,
  CloseToken extends string,
  N extends number = 0,
  C extends string = ""
> = IndexOf<Original, OpenToken> extends infer OT extends number
  ? IndexOf<Original, CloseToken> extends infer CT extends number
    ? OT extends -1
      ? Original extends `${infer Left}${CloseToken}${infer Right}`
        ? N extends 1
          ? Right extends ""
            ? [`${C}${Left}`]
            : [`${C}${Left}`, ...SplitGroups<Right, OpenToken, CloseToken>]
          : SplitGroups<
              Right,
              OpenToken,
              CloseToken,
              Decrement<N>,
              `${C}${Left}${CloseToken}`
            >
        : N extends 0
        ? [Original]
        : never
      : OT extends CT
      ? [Original]
      : LT<OT, CT> extends true
      ? Original extends `${infer Left}${OpenToken}${infer Right}`
        ? N extends 0
          ? Left extends ""
            ? SplitGroups<Right, OpenToken, CloseToken, 1>
            : [Left, ...SplitGroups<Right, OpenToken, CloseToken, 1>]
          : SplitGroups<
              Right,
              OpenToken,
              CloseToken,
              Increment<N>,
              `${C}${Left}${OpenToken}`
            >
        : never
      : Original extends `${infer Left}${CloseToken}${infer Right}`
      ? N extends 1
        ? Right extends ""
          ? [`${C}${Left}`]
          : [`${C}${Left}`, ...SplitGroups<Right, OpenToken, CloseToken>]
        : SplitGroups<
            Right,
            OpenToken,
            CloseToken,
            Decrement<N>,
            `${C}${Left}${CloseToken}`
          >
      : never
    : never
  : never;

/**
 * Utility type to check if there is a partial or unbalanced open/close count
 */
export type IsPartialGroup<
  Original extends string,
  OpenToken extends string,
  CloseToken extends string
> = CountTokens<Original, OpenToken> extends CountTokens<Original, CloseToken>
  ? false
  : true;

/**
 * Count the number of times the given token appears in the string
 */
export type CountTokens<
  Original extends string,
  Token extends string,
  N extends number = 0
> = Original extends `${infer _}${Token}${infer Right}`
  ? CountTokens<Right, Token, Increment<N>>
  : N;
