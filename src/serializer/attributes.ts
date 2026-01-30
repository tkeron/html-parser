export const needsQuotes = (value: string): boolean => {
  return value === "" || /[\t\n\r\f "'=`>]/.test(value);
};

export const serializeAttribute = (
  name: string,
  value: string,
  options?: {
    quote_char?: string;
    quote_attr_values?: boolean;
    minimize_boolean_attributes?: boolean;
    escape_lt_in_attrs?: boolean;
    escape_rcdata?: boolean;
  },
): string => {
  if (options?.minimize_boolean_attributes !== false && value === name) {
    return name;
  }
  const needsQuote =
    needsQuotes(value) || options?.quote_attr_values || !!options?.quote_char;
  if (!needsQuote) {
    let escaped = value.replace(/&/g, "&amp;");
    if (options?.escape_lt_in_attrs) {
      escaped = escaped.replace(/</g, "&lt;");
    }
    return `${name}=${escaped}`;
  }
  let escaped = value.replace(/&/g, "&amp;");
  if (options?.escape_lt_in_attrs) {
    escaped = escaped.replace(/</g, "&lt;");
  }
  const forcedQuote = options?.quote_char;
  if (forcedQuote) {
    if (forcedQuote === "'") {
      escaped = escaped.replace(/'/g, "&#39;");
    } else {
      escaped = escaped.replace(/"/g, "&quot;");
    }
    return `${name}=${forcedQuote}${escaped}${forcedQuote}`;
  } else {
    if (value.includes('"') && value.includes("'")) {
      escaped = escaped.replace(/"/g, "&quot;");
      return `${name}="${escaped}"`;
    } else if (value.includes('"')) {
      return `${name}='${escaped}'`;
    } else {
      escaped = escaped.replace(/"/g, "&quot;");
      return `${name}="${escaped}"`;
    }
  }
};

export const serializeAttributes = (
  attrs: any,
  options?: {
    quote_char?: string;
    quote_attr_values?: boolean;
    minimize_boolean_attributes?: boolean;
    escape_lt_in_attrs?: boolean;
    use_trailing_solidus?: boolean;
    escape_rcdata?: boolean;
  },
): string => {
  let attrList: [string, string][];
  if (Array.isArray(attrs)) {
    attrList = attrs.map((attr: any) => [attr.name, attr.value]);
  } else {
    attrList = attrs ? Object.entries(attrs) : [];
  }
  attrList.sort(([a], [b]) => a.localeCompare(b));
  return attrList
    .map(([name, value]) => " " + serializeAttribute(name, value, options))
    .join("");
};
