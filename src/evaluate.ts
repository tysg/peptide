import * as vscode from "vscode";
import * as Parser from "web-tree-sitter";
import { Ctx } from "./ctx";

type SelectFn = (root: Parser.SyntaxNode, offset: number) => Parser.SyntaxNode | undefined;

export async function evalSelectedForm(ctx: Ctx, selectFn: SelectFn) {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  let doc = editor.document;

  const tree = ctx.parser.parse(doc.getText()).rootNode;

  // find form at cursor
  const p = editor.selection.active;

  const form = selectFn(tree, doc.offsetAt(p));
  if (!form) {
    console.error("No parent found for current cursor");
    return;
  }

  const range = new vscode.Range(doc.positionAt(form.startIndex), doc.positionAt(form.endIndex));
  const res = await ctx.client.execute(form.text);
  ctx.decorator.decorateEvaluateResultRange(range, res);
}
