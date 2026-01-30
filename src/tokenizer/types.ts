export enum TokenType {
  TAG_OPEN = "TAG_OPEN",
  TAG_CLOSE = "TAG_CLOSE",
  TEXT = "TEXT",
  COMMENT = "COMMENT",
  CDATA = "CDATA",
  DOCTYPE = "DOCTYPE",
  PROCESSING_INSTRUCTION = "PROCESSING_INSTRUCTION",
  EOF = "EOF",
}

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export interface Token {
  type: TokenType;
  value: string;
  position: Position;
  attributes?: Record<string, string>;
  isSelfClosing?: boolean;
  isClosing?: boolean;
}
