# Official HTML Parser Tests

This directory contains implementations of official HTML parsing test suites to ensure compliance with web standards.

## Test Sources

### HTML5lib Tests
- **Tokenizer Tests**: JSON format tests from `html5lib-tests/tokenizer/`
- **Tree Construction Tests**: DAT format tests from `html5lib-tests/tree-construction/`

### Web Platform Tests (WPT)
- **Parsing Tests**: HTML format tests from `wpt/html/syntax/parsing/`

### Benchmark/Compliance Tests
- **Acid Tests**: Standardized rendering tests (Acid1, Acid2, Acid3)
- **HTML5 Test Suite**: Comprehensive HTML5 compliance tests

## Test Structure

```
tests/official/
├── html5lib/
│   ├── tokenizer/           # JSON tokenizer tests
│   ├── tree-construction/   # DAT tree construction tests
│   └── utils/              # HTML5lib test utilities
├── wpt/                    # Web Platform Tests
├── acid/                   # Acid tests
├── benchmarks/             # Performance benchmarks
└── compliance/             # Compliance test results
```

## Test Formats

### HTML5lib Tokenizer Tests (JSON)
```json
{
  "tests": [
    {
      "description": "Test description",
      "input": "input_string",
      "output": [expected_output_tokens],
      "initialStates": [initial_states],
      "lastStartTag": "last_start_tag",
      "errors": [parse_errors]
    }
  ]
}
```

### HTML5lib Tree Construction Tests (DAT)
```
#data
<html>
#errors
(1,6): expected-doctype-but-got-start-tag
#document
| <html>
|   <head>
|   <body>
```

### Web Platform Tests (HTML)
Standard HTML files with embedded test assertions and expected results.

## Usage

```bash
# Run all official tests
bun test tests/official/

# Run specific test suite
bun test tests/official/html5lib/
bun test tests/official/wpt/
bun test tests/official/acid/

# Run with coverage
bun test --coverage tests/official/
```

## Test Results

Results are automatically generated and stored in `tests/official/compliance/` with detailed reports on:
- Tokenizer compliance
- Tree construction compliance  
- Error handling accuracy
- Performance benchmarks
- Standards compliance scores
