import { describe, it } from 'bun:test';
import {
  loadHTML5libTokenizerTests,
  runHTML5libTokenizerTestSuite,
  type HTML5libTokenizerTestSuite
} from './tokenizer-utils';


const basicTokenizerTests: HTML5libTokenizerTestSuite = {
  "tests": [
    {
      "description": "Correct Doctype lowercase",
      "input": "<!DOCTYPE html>",
      "output": [["DOCTYPE", "html", null, null, true]]
    },
    {
      "description": "Correct Doctype uppercase",
      "input": "<!DOCTYPE HTML>",
      "output": [["DOCTYPE", "html", null, null, true]]
    },
    {
      "description": "Single Start Tag",
      "input": "<h>",
      "output": [["StartTag", "h", {}]]
    },
    {
      "description": "Start Tag w/attribute",
      "input": "<h a='b'>",
      "output": [["StartTag", "h", { "a": "b" }]]
    },
    {
      "description": "Start/End Tag",
      "input": "<h></h>",
      "output": [["StartTag", "h", {}], ["EndTag", "h"]]
    },
    {
      "description": "Simple comment",
      "input": "<!--comment-->",
      "output": [["Comment", "comment"]]
    },
    {
      "description": "Character data",
      "input": "Hello World",
      "output": [["Character", "Hello World"]]
    },
    {
      "description": "Multiple attributes",
      "input": "<h a='b' c='d'>",
      "output": [["StartTag", "h", { "a": "b", "c": "d" }]]
    },
    {
      "description": "Self-closing tag",
      "input": "<br/>",
      "output": [["StartTag", "br", {}, true]]
    },
    {
      "description": "Empty comment",
      "input": "<!---->",
      "output": [["Comment", ""]]
    },
    {
      "description": "Text with entities",
      "input": "&amp;&lt;&gt;",
      "output": [["Character", "&<>"]]
    },
    {
      "description": "Numeric entity",
      "input": "&#65;",
      "output": [["Character", "A"]]
    },
    {
      "description": "Hex entity",
      "input": "&#x41;",
      "output": [["Character", "A"]]
    },
    {
      "description": "Unquoted attribute",
      "input": "<h a=b>",
      "output": [["StartTag", "h", { "a": "b" }]]
    },
    {
      "description": "Tag with mixed case",
      "input": "<DiV>",
      "output": [["StartTag", "div", {}]]
    }
  ]
};


const entityTests: HTML5libTokenizerTestSuite = {
  "tests": [
    {
      "description": "Entity with trailing semicolon",
      "input": "I'm &not;it",
      "output": [["Character", "I'm ¬it"]]
    },
    {
      "description": "Entity without trailing semicolon",
      "input": "I'm &notit",
      "output": [["Character", "I'm ¬it"]],
      "errors": [
        { "code": "missing-semicolon-after-character-reference", "line": 1, "col": 9 }
      ]
    },
    {
      "description": "Ampersand EOF",
      "input": "&",
      "output": [["Character", "&"]]
    },
    {
      "description": "Unfinished entity",
      "input": "&f",
      "output": [["Character", "&f"]]
    },
    {
      "description": "Ampersand, number sign",
      "input": "&#",
      "output": [["Character", "&#"]],
      "errors": [
        { "code": "absence-of-digits-in-numeric-character-reference", "line": 1, "col": 3 }
      ]
    }
  ]
};


const commentTests: HTML5libTokenizerTestSuite = {
  "tests": [
    {
      "description": "Comment, Central dash no space",
      "input": "<!----->",
      "output": [["Comment", "-"]]
    },
    {
      "description": "Comment, two central dashes",
      "input": "<!-- --comment -->",
      "output": [["Comment", " --comment "]]
    },
    {
      "description": "Unfinished comment",
      "input": "<!--comment",
      "output": [["Comment", "comment"]],
      "errors": [
        { "code": "eof-in-comment", "line": 1, "col": 12 }
      ]
    },
    {
      "description": "Short comment",
      "input": "<!-->",
      "output": [["Comment", ""]],
      "errors": [
        { "code": "abrupt-closing-of-empty-comment", "line": 1, "col": 5 }
      ]
    },
    {
      "description": "Nested comment",
      "input": "<!-- <!--test-->",
      "output": [["Comment", " <!--test"]],
      "errors": [
        { "code": "nested-comment", "line": 1, "col": 10 }
      ]
    }
  ]
};


describe('HTML5lib Tokenizer Tests', () => {
  runHTML5libTokenizerTestSuite(basicTokenizerTests, 'Basic Tokenizer');
  runHTML5libTokenizerTestSuite(entityTests, 'Entity Handling');
  runHTML5libTokenizerTestSuite(commentTests, 'Comment Handling');
});
