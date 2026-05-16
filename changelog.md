# Changelog

## 1.5.7

### Bug Fixes

- Fix: text content inside `<script>` and `<style>` elements was incorrectly escaped (`>` → `&gt;`) when serializing via `innerHTML`/`outerHTML`. Raw text elements now serialize their text nodes without escaping, matching the HTML5 spec.

## 1.5.6

- Previous releases
