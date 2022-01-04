import * as assert from "assert";
import * as parser from "./../../parser";
import { extractCursor } from "./utils";
import { suite, before, test } from "mocha";
import Parser = require("web-tree-sitter");

suite("Unit Test - Parser", () => {
  before(async function () {
    this.p = await parser.initParser();
    return;
  });

  test("select current top-level form: function definition", async function () {
    let raw = `
def hello_world():
    pri$nt("hello world!")

hello_world()
`;
    const { cursor, code } = extractCursor(raw);
    const root: Parser.SyntaxNode = this.p.parse(code).rootNode;

    const res = parser.getTopLevelForm(root, cursor);
    assert.strictEqual(
      res?.text,
      `def hello_world():
    print("hello world!")`
    );
  });

  test("select current top-level form: function call", async function () {
    let raw = `
def hello_world():
    print("hello world!")

hello_wor$ld()
`;
    const { cursor, code } = extractCursor(raw);
    const root: Parser.SyntaxNode = this.p.parse(code).rootNode;

    const res = parser.getTopLevelForm(root, cursor);
    assert.strictEqual(res?.text, "hello_world()");
  });

  test("select current top-level form: after function call", async function () {
    let raw = `
def hello_world():
    print("hello world!")

hello_world()$
`;
    const { cursor, code } = extractCursor(raw);
    const root: Parser.SyntaxNode = this.p.parse(code).rootNode;

    const res = parser.getTopLevelForm(root, cursor);
    assert.strictEqual(res?.text, "hello_world()");
  });

  test("select preceding form", async function () {
    let tests = [
      [`loren(ipsum(dolor()))$`, "loren(ipsum(dolor()))"],
      [`loren(ipsum(dolor())$)`, "ipsum(dolor())"],
      [`loren(ipsum(dolor()$))`, "dolor()"],
      [`loren(ipsum(dolor$()))`, "dolor"],
      [`hello(2$, "world", loren("ipsum"), True)`, "2"],
      [`hello(2, "world"$, loren("ipsum"), True)`, `"world"`],
      [`hello(2, "world", loren("ipsum")$, True)`, `loren("ipsum")`],
      [`hello(2, "world", loren("ipsum"), True$)`, `True`],
      [`hello(2, "world", loren("ipsum"), True)$`, `hello(2, "world", loren("ipsum"), True)`],
    ];

    for (const [source, selected] of tests) {
      const { cursor, code } = extractCursor(source);
      const root: Parser.SyntaxNode = this.p.parse(code).rootNode;

      const res = parser.getPrecedingForm(root, cursor);
      assert.strictEqual(res?.text, selected);
    }
  });
});
