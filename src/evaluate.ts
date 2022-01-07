import * as vscode from "vscode";
import * as Parser from "web-tree-sitter";
import { JupyterConnection } from "./connection";
import { decorateEvaluateResultRange } from "./decorate";

// Commands related to evaluation
type SelectFn = (root: Parser.SyntaxNode, offset: number) => Parser.SyntaxNode | undefined;

async function evalSelectedForm(ctx: vscode.ExtensionContext, parser: Parser, selectFn: SelectFn) {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  let doc = editor.document;

  const tree = parser.parse(doc.getText()).rootNode;

  // find form at cursor
  const p = editor.selection.active;

  const form = selectFn(tree, doc.offsetAt(p));
  if (!form) {
    console.error("No parent found for current cursor");
    return;
  }

  const conn: JupyterConnection | undefined = ctx.workspaceState.get("jupyterConn");
  if (!conn) {
    return;
  }

  const range = new vscode.Range(doc.positionAt(form.startIndex), doc.positionAt(form.endIndex));

  const res = await conn.execute(form.text);

  decorateEvaluateResultRange(range, res);
  // vscode.window.showInformationMessage(res);
}

async function evalCurrentFile(ctx: vscode.ExtensionContext, parser: Parser) {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  let doc = editor.document;
  const tree = parser.parse(doc.getText()).rootNode;

  const conn: JupyterConnection | undefined = ctx.workspaceState.get("jupyterConn");
  if (!conn) {
    return;
  }

  editor.selection = new vscode.Selection(doc.positionAt(0), doc.positionAt(tree.endIndex));
  vscode.commands.executeCommand("python.execSelectionInTerminal");
}

function selectSyntaxNode(f: Parser.SyntaxNode): vscode.Selection {
  return new vscode.Selection(
    f.startPosition.row,
    f.startPosition.column,
    f.endPosition.row,
    f.endPosition.column
  );
}

export { evalSelectedForm, evalCurrentFile };
