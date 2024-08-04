import type { Decrement, Increment } from "./math.js";

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
 * Split into groups with open/close tokens at barriers
 */
export type SplitGroups<
  Original extends string,
  OpenToken extends string,
  CloseToken extends string,
  N extends number = 0,
  C extends string = ""
> = Original extends `${infer Left}${OpenToken}${infer Right}`
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
  : Original extends `${infer Left}${CloseToken}${infer Right}`
  ? N extends 1
    ? [`${C}${Left}`, ...SplitGroups<Right, OpenToken, CloseToken>]
    : SplitGroups<
        Right,
        OpenToken,
        CloseToken,
        Decrement<N>,
        `${C}${Left}${CloseToken}`
      >
  : C extends ""
  ? Original extends ""
    ? []
    : [Original]
  : never; // This means the sides were unbalanced

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
