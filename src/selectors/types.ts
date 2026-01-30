export interface SelectorToken {
  type: "tag" | "class" | "id" | "attribute";
  value: string;
  attributeName?: string;
  attributeValue?: string;
}

export interface SelectorGroup {
  tokens: SelectorToken[];
}
