import type { GTE, Increment, LTE } from "./math.js";

/**
 * Validate the candidate against the regex and return the candidate if there is
 * a match
 */
export type ValidateRegEx<
  Regex extends string,
  Candidate extends string
> = IsMatch<Regex, Candidate> extends true
  ? Candidate
  : "Candidate does not match supplied Regex";

/**
 * Verify if the given candidate matches the regex
 */
export type IsMatch<
  Regex extends string,
  Candidate extends string
> = RegEx<Regex> extends infer Tokens extends RegexToken[]
  ? RunStateMachine<Candidate, Tokens>
  : false;

/**
 * Expose the RegEx type
 */
export type RegEx<Regex extends string> =
  ParseRegex<Regex> extends infer Tokens extends RegexToken[]
    ? CollapseRegexTokens<Tokens>
    : never;

/**
 * Check if the string matches the given tokens
 */
type RunStateMachine<
  Candidate extends string,
  Tokens,
  N extends number = 0
> = Tokens extends never[]
  ? Candidate extends ""
    ? true
    : false
  : Candidate extends `${infer NextChar}${infer Rest}`
  ? Tokens extends [infer Token extends RegexToken, ...infer RemainingTokens]
    ? CheckMatch<NextChar, Token> extends true
      ? Rest extends ""
        ? true
        : RunStateMachine<Rest, RemainingTokens>
      : Token extends RegexRepeatingToken<infer RT, infer Min, infer Max>
      ? CheckMatch<NextChar, RT> extends true
        ? RunStateMachine<Rest, Tokens, Increment<N>>
        : InRange<N, Min, Max> extends true
        ? RunStateMachine<Candidate, RemainingTokens>
        : "Range exceeded"
      : RunStateMachine<Candidate, RemainingTokens>
    : `exhausted tokens: ${Candidate}` // No more tokens but string remains
  : Tokens extends [infer Token extends RegexToken, ...infer RemainingTokens]
  ? Token extends RegexRepeatingToken<infer _, infer Min, infer Max>
    ? InRange<N, Min, Max> extends true
      ? RunStateMachine<Candidate, RemainingTokens>
      : "Failed to satisfy range"
    : "string exhausted before tokens consumed"
  : "failed to match regex"; // Invalid string

/**
 * Verify if the number is in range after failing a match check (Min <= N <= Max)
 */
type InRange<N extends number, Min extends number, Max extends number> = GTE<
  N,
  Min
> extends true
  ? Max extends -1
    ? true
    : LTE<N, Max> extends true
    ? true
    : false
  : false;

/**
 * Check if the token is match for the current character
 */
type CheckMatch<
  C extends string,
  T extends RegexToken
> = T extends RegexLiteralToken<infer L>
  ? C extends L
    ? true
    : false
  : T extends RegexRangeToken<infer R>
  ? C extends R
    ? true
    : false
  : false;

/**
 * Take associated columns (like repetitions)
 */
type CollapseRegexTokens<Tokens> = Tokens extends [
  infer First extends RegexToken,
  infer Second,
  ...infer Rest
]
  ? Second extends RegexRepeatingToken<infer _, infer Min, infer Max>
    ? Rest extends never[]
      ? [RegexRepeatingToken<First, Min, Max>]
      : [RegexRepeatingToken<First, Min, Max>, ...CollapseRegexTokens<Rest>]
    : Rest extends never[]
    ? [First, Second]
    : [First, ...CollapseRegexTokens<[Second, ...Rest]>]
  : Tokens;

/**
 * Parse the full regex, extracting one token at a time
 */
type ParseRegex<RegEx extends string> = RegEx extends ""
  ? []
  : NextToken<RegEx> extends [infer Token, infer Remainder extends string]
  ? Remainder extends ""
    ? [Token]
    : ParseRegex<Remainder> extends infer Tokens extends unknown[]
    ? [Token, ...Tokens]
    : [Token]
  : never;

/**
 * Read the next regex token from the string
 */
type NextToken<RegEx extends string> =
  RegEx extends `{${infer Repeating}}${infer Unparsed}`
    ? [ParseRepeating<Repeating>, Unparsed]
    : RegEx extends `[${infer Group}]${infer Unparsed}`
    ? ParseRange<Group> extends infer Token extends string
      ? [RegexRangeToken<Token>, Unparsed]
      : "Invalid range"
    : RegEx extends `${infer Special extends REGEX_SPECIAL}${infer Unparsed}`
    ? [CheckSpecial<Special>, Unparsed]
    : RegEx extends `\\${infer Literal}${infer Unparsed}`
    ? [CheckLiteral<Literal>, Unparsed]
    : RegEx extends `${infer Literal}${infer Unparsed}`
    ? [RegexLiteralToken<Literal>, Unparsed]
    : never;

type REGEX_SPECIAL = "." | "+" | "*" | "?";

type REGEX_ANY = RegexRangeToken<string>;
type REGEX_WORD = RegexRangeToken<ParseRange<"a-zA-Z0-9_">>;
type REGEX_DIGIT = RegexRangeToken<ParseRange<"0-9">>;
type REGEX_WHITESPACE = RegexRangeToken<"\t" | " ">;

type REGEX_ONE_OR_MORE = RegexRepeatingToken<never, 1, -1>;
type REGEX_ZERO_OR_MORE = RegexRepeatingToken<never, 0, -1>;
type REGEX_ZERO_OR_ONE = RegexRepeatingToken<never, 0, 1>;

/**
 * Map special character sets
 */
type CheckSpecial<Special extends REGEX_SPECIAL> = Special extends "."
  ? REGEX_ANY
  : Special extends "+"
  ? REGEX_ONE_OR_MORE
  : Special extends "*"
  ? REGEX_ZERO_OR_MORE
  : Special extends "?"
  ? REGEX_ZERO_OR_ONE
  : never;

/**
 * Check literal escape vs supported sets
 */
type CheckLiteral<Literal extends string> = Literal extends "w"
  ? REGEX_WORD
  : Literal extends "s"
  ? REGEX_WHITESPACE
  : Literal extends "d"
  ? REGEX_DIGIT
  : RegexLiteralToken<Literal>; // Check a word

/**
 * Parse a repeating token: {2,3}
 */
type ParseRepeating<Repeating extends string> =
  Repeating extends `${infer Min extends number},${infer Max extends number}`
    ? RegexRepeatingToken<never, Min, Max>
    : Repeating extends `${infer Min extends number},`
    ? RegexRepeatingToken<never, Min, -1>
    : Repeating extends `${infer Min extends number}`
    ? RegexRepeatingToken<never, Min, Min>
    : never;

/**
 * Parse a range token: A-Z
 */
type ParseRange<Range extends string> =
  Range extends `${infer Start}-${infer End}${infer Other}`
    ? Other extends ""
      ? VerifyRange<Start, End>
      : VerifyRange<Start, End> | ParseRange<Other>
    : Range extends `${infer Start}-${infer End}`
    ? VerifyRange<Start, End>
    : Range extends `${infer Token}${infer Rest}`
    ? Rest extends ""
      ? Token
      : Token | ParseRange<Rest>
    : never;

/**
 * Verify the range is valid and fits our hard coded sets
 */
type VerifyRange<
  Start extends string,
  End extends string
> = CToN<Start> extends number
  ? CToN<End> extends number
    ? BuildRange<CToN<Start>, CToN<End>> extends infer R extends string
      ? R
      : never
    : never
  : never;

/**
 * Build all the characters in a range
 */
type BuildRange<
  N extends number,
  End extends number,
  D extends number = 0
> = D extends 28
  ? never
  : NToC<N> extends string
  ? N extends End
    ? NToC<N>
    : NToC<N> | BuildRange<Increment<N>, End, Increment<D>>
  : never;

/**
 * Valid token types
 */
type RegexToken =
  | RegexLiteralToken
  | RegexRangeToken
  | RegexRepeatingToken<any, number, number>;

/**
 * Represents a literal token: A
 */
type RegexLiteralToken<Literal extends string = string> = {
  literal: Literal;
};

/**
 * Represents a range of characters: [a-Z]
 */
type RegexRangeToken<Range extends string = string> = {
  range: Range;
};

/**
 * Represents a repeating token
 */
type RegexRepeatingToken<
  Token extends RegexToken = RegexToken,
  Minimum extends number = 0,
  Maximum extends number = -1
> = {
  token: Token;
  min: Minimum;
  max: Maximum;
};

/**
 * Get the value for the character
 */
type CToN<C extends string> = C extends keyof CharToIdx ? CharToIdx[C] : never;

/**
 * Get the character for the value
 */
type NToC<N extends number> = IdxToChar[N] extends [never]
  ? never
  : IdxToChar[N];

/**
 * Array index to character
 */
type IdxToChar = [
  "\t",
  "\n",
  "\r",
  " ",
  "!",
  '"',
  "#",
  "$",
  "%",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  ",",
  "-",
  ".",
  "/",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "[",
  "\\",
  "]",
  "^",
  "_",
  "`",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "{",
  "|",
  "}",
  "~"
];

/**
 * Character to index mapping
 */
type CharToIdx = {
  "\t": 0;
  "\n": 1;
  "\r": 2;
  " ": 3;
  "!": 4;
  '"': 5;
  "#": 6;
  $: 7;
  "%": 8;
  "&": 9;
  "'": 10;
  "(": 11;
  ")": 12;
  "*": 13;
  "+": 14;
  ",": 15;
  "-": 16;
  ".": 17;
  "/": 18;
  "0": 19;
  "1": 20;
  "2": 21;
  "3": 22;
  "4": 23;
  "5": 24;
  "6": 25;
  "7": 26;
  "8": 27;
  "9": 28;
  ":": 29;
  ";": 30;
  "<": 31;
  "=": 32;
  ">": 33;
  "?": 34;
  "@": 35;
  A: 36;
  B: 37;
  C: 38;
  D: 39;
  E: 40;
  F: 41;
  G: 42;
  H: 43;
  I: 44;
  J: 45;
  K: 46;
  L: 47;
  M: 48;
  N: 49;
  O: 50;
  P: 51;
  Q: 52;
  R: 53;
  S: 54;
  T: 55;
  U: 56;
  V: 57;
  W: 58;
  X: 59;
  Y: 60;
  Z: 61;
  "[": 62;
  "\\": 63;
  "]": 64;
  "^": 65;
  _: 66;
  "`": 67;
  a: 68;
  b: 69;
  c: 70;
  d: 71;
  e: 72;
  f: 73;
  g: 74;
  h: 75;
  i: 76;
  j: 77;
  k: 78;
  l: 79;
  m: 80;
  n: 81;
  o: 82;
  p: 83;
  q: 84;
  r: 85;
  s: 86;
  t: 87;
  u: 88;
  v: 89;
  w: 90;
  x: 91;
  y: 92;
  z: 93;
  "{": 94;
  "|": 95;
  "}": 96;
  "~": 97;
};
