/**
 * Serializes a list of HTML5 tokens to an HTML string.
 * Based on HTML5 serialization algorithm.
 */

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttributeValue(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function needsQuotes(value: string): boolean {
  return value === '' || /[\t\n\r\f "'=`>]/.test(value);
}

function serializeAttribute(name: string, value: string, options?: { quote_char?: string; quote_attr_values?: boolean; minimize_boolean_attributes?: boolean; escape_lt_in_attrs?: boolean; escape_rcdata?: boolean }): string {
  if ((options?.minimize_boolean_attributes !== false) && value === name) {
    return name;
  }
  const needsQuote = needsQuotes(value) || options?.quote_attr_values;
  if (!needsQuote) {
    return `${name}=${value}`;
  }
  let escaped = value.replace(/&/g, '&amp;');
  if (options?.escape_lt_in_attrs) {
    escaped = escaped.replace(/</g, '&lt;');
  }
  const forcedQuote = options?.quote_char;
  if (forcedQuote) {
    if (forcedQuote === "'") {
      escaped = escaped.replace(/'/g, '&#39;');
    } else {
      escaped = escaped.replace(/"/g, '&quot;');
    }
    return `${name}=${forcedQuote}${escaped}${forcedQuote}`;
  } else {
    // Auto choose quote
    if (value.includes('"') && value.includes("'")) {
      escaped = escaped.replace(/"/g, '&quot;');
      return `${name}="${escaped}"`;
    } else if (value.includes('"')) {
      return `${name}='${escaped}'`;
    } else {
      escaped = escaped.replace(/"/g, '&quot;');
      return `${name}="${escaped}"`;
    }
  }
}

function serializeAttributes(attrs: any, options?: { quote_char?: string; quote_attr_values?: boolean; minimize_boolean_attributes?: boolean; escape_lt_in_attrs?: boolean; use_trailing_solidus?: boolean; escape_rcdata?: boolean }): string {
  let attrList: [string, string][];
  if (Array.isArray(attrs)) {
    attrList = attrs.map((attr: any) => [attr.name, attr.value]);
  } else {
    attrList = attrs ? Object.entries(attrs) : [];
  }
  attrList.sort(([a], [b]) => a.localeCompare(b));
  return attrList.map(([name, value]) => ' ' + serializeAttribute(name, value, options)).join('');
}

export function serializeTokens(tokens: any[], options?: { inject_meta_charset?: boolean; encoding?: string; quote_char?: string; quote_attr_values?: boolean; minimize_boolean_attributes?: boolean; escape_lt_in_attrs?: boolean; use_trailing_solidus?: boolean; escape_rcdata?: boolean; strip_whitespace?: boolean }): string {
  const encoding = options?.encoding || 'utf-8';
  let result = '';
  let inScript = false;
  let inPre = false;
  let inTextarea = false;
  let inStyle = false;
  let serializingHead = true;

  // If inject_meta_charset, modify tokens
  let processedTokens = tokens;
  if (options?.inject_meta_charset) {
    let hasCharset = false;
    let modifiedTokens: any[] = [];
    let inHead = false;

    // First pass: check if has charset
    for (const token of tokens) {
      const type = token[0];
      if (type === 'StartTag' && token[2] === 'head') {
        inHead = true;
      } else if (type === 'EndTag' && token[2] === 'head') {
        inHead = false;
      } else if (inHead && type === 'EmptyTag' && token[1] === 'meta') {
        const attrs = token[2];
        if (attrs.some((attr: any) => attr.name === 'charset')) {
          hasCharset = true;
        }
        const hasHttpEquiv = attrs.some((attr: any) => attr.name === 'http-equiv' && attr.value === 'content-type');
        if (hasHttpEquiv) {
          const contentAttr = attrs.find((attr: any) => attr.name === 'content');
          if (contentAttr && contentAttr.value.includes('charset=')) {
            hasCharset = true;
          }
        }
      }
    }

    // Second pass: modify
    inHead = false;
    for (const token of tokens) {
      const type = token[0];
      if (type === 'StartTag' && token[2] === 'head') {
        inHead = true;
        modifiedTokens.push(token);
        if (!hasCharset && options?.encoding) {
          modifiedTokens.push(['EmptyTag', 'meta', [{ name: 'charset', value: encoding }]]);
        }
      } else if (type === 'EndTag' && token[2] === 'head') {
        inHead = false;
        modifiedTokens.push(token);
      } else if (inHead && type === 'EmptyTag' && token[1] === 'meta') {
        let newAttrs = token[2].slice();
        let isHttpEquiv = false;
        for (let i = 0; i < newAttrs.length; i++) {
          const attr = newAttrs[i];
          if (attr.name === 'charset' && options?.encoding) {
            newAttrs[i] = { name: 'charset', value: encoding };
          } else if (attr.name === 'http-equiv' && attr.value === 'content-type') {
            isHttpEquiv = true;
          } else if (attr.name === 'content' && isHttpEquiv && options?.encoding) {
            newAttrs[i] = { name: 'content', value: attr.value.replace(/charset=[^;]*/, 'charset=' + encoding) };
          }
        }
        modifiedTokens.push([type, token[1], newAttrs]);
      } else {
        modifiedTokens.push(token);
      }
    }
    processedTokens = modifiedTokens;
  }

  // Serialize
  let omitHtml = false;
  let omitHead = false;
  let omitBody = false;
  let omitColgroup = false;
  let omitTbody = false;
  let headHasContent = false;
  let inHead = false;
  // First pass to detect optional tags
  let htmlStartIndex = -1;
  let headStartIndex = -1;
  let bodyStartIndex = -1;
  let colgroupStartIndex = -1;
  let tbodyStartIndex = -1;
  let tbodyCount = 0;
  let colgroupCount = 0;
  for (let i = 0; i < processedTokens.length; i++) {
    const token = processedTokens[i];
    const type = token[0];
    if (type === 'StartTag') {
      const name = token[2];
      if (name === 'html') {
        htmlStartIndex = i;
      }
      if (name === 'head') {
        headStartIndex = i;
      }
      if (name === 'body') {
        bodyStartIndex = i;
      }
      if (name === 'colgroup') {
        colgroupStartIndex = i;
        colgroupCount++;
      }
      if (name === 'tbody') {
        tbodyStartIndex = i;
        tbodyCount++;
      }
    }
  }
  // Check if html should be omitted
  if (htmlStartIndex >= 0) {
    const htmlToken = processedTokens[htmlStartIndex];
    const attrs = htmlToken[3];
    const hasAttributes = Array.isArray(attrs) ? attrs.length > 0 : (attrs ? Object.keys(attrs).length > 0 : false);
    if (hasAttributes) {
      omitHtml = false;
    } else {
      let firstToken = null;
      for (let j = htmlStartIndex + 1; j < processedTokens.length; j++) {
        const t = processedTokens[j];
        if (t[0] !== 'Characters' || t[1].trim() !== '') {
          firstToken = t;
          break;
        }
      }
      if (!firstToken) {
        omitHtml = true;
      } else if (firstToken[0] === 'Comment') {
        omitHtml = false;
      } else if (firstToken[0] === 'Characters') {
        if (/^\s/.test(firstToken[1])) {
          omitHtml = false;
        } else {
          omitHtml = true;
        }
      } else {
        omitHtml = true;
      }
    }
  }
  // Check if head should be omitted
  if (headStartIndex >= 0) {
    let firstToken = null;
    for (let j = headStartIndex + 1; j < processedTokens.length; j++) {
      const t = processedTokens[j];
      if (t[0] !== 'Characters' || t[1].trim() !== '') {
        firstToken = t;
        break;
      }
    }
    omitHead = false;
    if (firstToken) {
      if (firstToken[0] === 'StartTag') {
        omitHead = true;
      } else if (firstToken[0] === 'EndTag' && firstToken[2] === 'head') {
        omitHead = true;
      } else if (firstToken[0] === 'EmptyTag') {
        omitHead = true;
      }
    }
  }
  // Check if body should be omitted
  if (bodyStartIndex >= 0) {
    let firstToken = null;
    for (let j = bodyStartIndex + 1; j < processedTokens.length; j++) {
      const t = processedTokens[j];
      if (t[0] !== 'Characters' || t[1].trim() !== '') {
        firstToken = t;
        break;
      }
    }
    omitBody = false;
    if (firstToken) {
      if (firstToken[0] === 'StartTag') {
        omitBody = true;
      } else if (firstToken[0] === 'EndTag') {
        omitBody = true;
      } else if (firstToken[0] === 'Characters' && !/^\s/.test(firstToken[1])) {
        omitBody = true;
      }
    } else {
      omitBody = true;
    }
  }
  // Check if colgroup should be omitted
  if (colgroupStartIndex >= 0) {
    const colgroupToken = processedTokens[colgroupStartIndex];
    const attrs = colgroupToken[3];
    const hasAttributes = Array.isArray(attrs) ? attrs.length > 0 : (attrs ? Object.keys(attrs).length > 0 : false);
    let firstToken = null;
    for (let j = colgroupStartIndex + 1; j < processedTokens.length; j++) {
      const t = processedTokens[j];
      if (t[0] !== 'Characters' || t[1].trim() !== '') {
        firstToken = t;
        break;
      }
    }
    omitColgroup = !hasAttributes && firstToken && (firstToken[0] === 'StartTag' || firstToken[0] === 'EmptyTag') && ((firstToken[0] === 'StartTag' ? firstToken[2] : firstToken[1]) === 'col');
  }
  // Check if tbody should be omitted - we'll check this per tbody in the loop
  // omitTbody is now calculated per element

  for (let i = 0; i < processedTokens.length; i++) {
    const token = processedTokens[i];
    const nextToken = processedTokens[i + 1];
    const type = token[0];
    switch (type) {
      case 'StartTag':
        const [, , name, attrs] = token;
        const attrCount = Array.isArray(attrs) ? attrs.length : (attrs ? Object.keys(attrs).length : 0);
        
        // Check if tbody should be omitted for this specific tbody
        let omitThisTbody = false;
        if (name === 'tbody') {
          const hasAttributes = Array.isArray(attrs) ? attrs.length > 0 : (attrs ? Object.keys(attrs).length > 0 : false);
          if (!hasAttributes) {
            // Check if first significant token after tbody is a tr
            let firstToken = null;
            for (let j = i + 1; j < processedTokens.length; j++) {
              const t = processedTokens[j];
              if (t[0] !== 'Characters' || t[1].trim() !== '') {
                firstToken = t;
                break;
              }
            }
            const hasTrChild = firstToken && (firstToken[0] === 'StartTag' || firstToken[0] === 'EmptyTag') && firstToken[2] === 'tr';
            
            if (hasTrChild) {
              // Check if not preceded by tbody, thead, or tfoot
              // This is indicated by whether the fragment starts with EndTag of those elements
              let isPreceded = false;
              for (let j = 0; j < i; j++) {
                const t = processedTokens[j];
                if (t[0] === 'Characters' && t[1].trim() === '') continue;
                if (t[0] === 'EndTag' && ['tbody', 'thead', 'tfoot'].includes(t[2])) {
                  isPreceded = true;
                }
                break; // Only check the first significant token
              }
              omitThisTbody = !isPreceded;
            }
          }
        }
        
        if (name === 'colgroup' && omitColgroup) continue;
        if (name === 'tbody' && omitThisTbody) continue;
        if (name === 'head' && omitHead) continue;
        if (name === 'body' && omitBody) continue;
        if (name === 'html' && omitHtml) continue;
        if (name === 'pre') inPre = true;
        if (name === 'textarea') inTextarea = true;
        if (name === 'script') inScript = true;
        if (name === 'style') inStyle = true;
        if (name === 'head') {
          if (options?.inject_meta_charset) {
            serializingHead = true;
          } else {
            result += '<' + name + serializeAttributes(attrs, options) + '>';
          }
        } else if (serializingHead) {
          result += '<' + name + serializeAttributes(attrs, options) + '>';
        }
        break;
      case 'EmptyTag':
        const [, name2, attrs2] = token;
        result += '<' + name2 + serializeAttributes(attrs2, options) + (options?.use_trailing_solidus ? ' />' : '>');
        break;
      case 'EndTag':
        const [, , name3] = token;
        // Check if end-tag should be omitted
        let omitEndTag = false;
        if (['html', 'head', 'body'].includes(name3)) {
          if (!nextToken || nextToken[0] === 'StartTag' || nextToken[0] === 'EndTag' || (nextToken[0] === 'Characters' && !/^\s/.test(nextToken[1]))) {
            omitEndTag = true;
          }
        } else if (nextToken) {
          const nextType = nextToken[0];
          let nextName = null;
          if (nextType === 'StartTag' || nextType === 'EndTag') {
            nextName = nextToken[2];
          } else if (nextType === 'EmptyTag') {
            nextName = nextToken[1];
          }
          if (nextType === 'EndTag') {
            omitEndTag = ['p', 'li', 'option', 'optgroup', 'tbody', 'tfoot', 'tr', 'td', 'th', 'colgroup', 'dd'].includes(name3);
          } else if (nextType === 'StartTag') {
            if (name3 === 'p' && ['address', 'article', 'aside', 'blockquote', 'datagrid', 'dialog', 'dir', 'div', 'dl', 'fieldset', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'].includes(nextName)) {
              omitEndTag = true;
            } else if (name3 === 'li' && nextName === 'li') {
              omitEndTag = true;
            } else if ((name3 === 'dt' || name3 === 'dd') && (nextName === 'dt' || nextName === 'dd')) {
              omitEndTag = true;
            } else if (name3 === 'option' && (nextName === 'option' || nextName === 'optgroup')) {
              omitEndTag = true;
            } else if (name3 === 'optgroup' && nextName === 'optgroup') {
              omitEndTag = true;
            } else if ((name3 === 'tbody' || name3 === 'tfoot') && (nextName === 'tbody' || nextName === 'tfoot')) {
              omitEndTag = true;
            } else if (name3 === 'thead' && (nextName === 'tbody' || nextName === 'tfoot')) {
              omitEndTag = true;
            } else if (name3 === 'tr' && nextName === 'tr') {
              omitEndTag = true;
            } else if ((name3 === 'td' || name3 === 'th') && (nextName === 'td' || nextName === 'th')) {
              omitEndTag = true;
            } else if (name3 === 'colgroup' && nextName !== 'colgroup') {
              omitEndTag = true;
            }
            if (name3 === 'p' && nextName === 'hr') {
              omitEndTag = true;
            }
          } else if (nextType === 'EmptyTag') {
            if (name3 === 'p' && nextName === 'hr') {
              omitEndTag = true;
            }
          }
          if (name3 === 'colgroup' && nextType === 'Characters' && !/^\s/.test(nextToken[1])) {
            omitEndTag = true;
          }
        } else {
          // At EOF, omit certain end-tags
          omitEndTag = ['p', 'li', 'option', 'optgroup', 'tbody', 'tfoot', 'tr', 'td', 'th', 'colgroup', 'dd'].includes(name3);
        }
        if (omitEndTag) continue;
        if (name3 === 'script') inScript = false;
        if (name3 === 'pre') inPre = false;
        if (name3 === 'textarea') inTextarea = false;
        if (name3 === 'style') inStyle = false;
        if (name3 === 'head') {
          if (options?.inject_meta_charset) {
            serializingHead = false;
          } else {
            result += '</' + name3 + '>';
          }
        } else if (serializingHead) {
          result += '</' + name3 + '>';
        }
        break;
      case 'Characters':
        if (serializingHead) {
          let text = token[1];
          if (options?.strip_whitespace && !inPre && !inTextarea && !inScript && !inStyle) {
            text = text.replace(/\s+/g, ' ');
          }
          if (inScript) {
            if (options?.escape_rcdata) {
              result += escapeText(text);
            } else {
              result += text;
            }
          } else if (inTextarea) {
            if (options?.escape_rcdata) {
              result += escapeText(text);
            } else {
              result += text;
            }
          } else {
            result += escapeText(text);
          }
        }
        break;
      case 'Doctype':
        if (serializingHead) {
          result += '<!DOCTYPE ' + token[1];
          if (token[2]) {
            result += ' PUBLIC "' + token[2] + '"';
            if (token[3]) result += ' "' + token[3] + '"';
          } else if (token[3]) {
            result += ' SYSTEM "' + token[3] + '"';
          }
          result += '>';
        }
        break;
      case 'Comment':
        if (serializingHead) {
          result += '<!--' + token[1] + '-->';
        }
        break;
      default:
        // Ignore unknown tokens
        break;
    }
  }

  return result;
}