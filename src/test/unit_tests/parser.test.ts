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

  test("select top-level form", async function () {
    let tests = [
      // after function call
      [
        `
def hello_world():
    print("hello world!")

hello_world()$ 
`,
        "hello_world()",
      ],
      // on function call

      [
        `
def hello_world():
    print("hello world!")

hello_$world() 
`,
        "hello_world()",
      ],

      // on function definition
      [
        `
def hello_world():
    pri$nt("hello world!")

hello_world() 
`,
        `def hello_world():
    print("hello world!")`,
      ],
    ];

    for (const [source, selected] of tests) {
      const { cursor, code } = extractCursor(source);
      const root: Parser.SyntaxNode = this.p.parse(code).rootNode;

      const res = parser.getTopLevelForm(root, cursor);
      assert.strictEqual(res?.text, selected, `failed input: ${source}`);
    }
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
      [`1+2$`, `2`],
      [`(1+2)$`, `(1+2)`],
      [`1+2           $`, `2`],
      [`loren(ipsum()      $, dolor())`, "ipsum()"],
    ];

    for (const [source, selected] of tests) {
      const { cursor, code } = extractCursor(source);
      const root: Parser.SyntaxNode = this.p.parse(code).rootNode;

      const res = parser.getPrecedingForm(root, cursor);
      assert.strictEqual(res?.text, selected, `failed input: ${source}`);
    }
  });
});
