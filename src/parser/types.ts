import type { Token } from "../tokenizer/index.js";

export interface ParserState {
  tokens: Token[];
  position: number;
  length: number;
  stack: any[];
  root: any;
  insertionMode: InsertionMode;
  errors: ParseError[];
  explicitHead?: boolean;
}

export interface ParseError {
  message: string;
  position: number;
  line: number;
  column: number;
  severity: "error" | "warning";
}

export enum InsertionMode {
  Initial = "initial",
  BeforeHtml = "beforeHtml",
  BeforeHead = "beforeHead",
  InHead = "inHead",
  AfterHead = "afterHead",
  InBody = "inBody",
}

export enum ASTNodeType {
  Document = "document",
  Element = "element",
  Text = "text",
  Comment = "comment",
  Doctype = "doctype",
  CDATA = "cdata",
}

export interface ASTNode {
  type: ASTNodeType;
  tagName?: string;
  value?: string;
  attributes?: Record<string, string>;
  children?: ASTNode[];
  isSelfClosing?: boolean;
  content?: string;
  name?: string;
  publicId?: string;
  systemId?: string;
  namespaceURI?: string;
  target?: string;
  data?: string;
}
