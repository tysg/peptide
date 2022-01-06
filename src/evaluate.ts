import * as vscode from "vscode";
import * as Parser from "web-tree-sitter";
import { JupyterConnection } from "./connection";
import { getTopLevelForm } from "./parser";

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

  const res = await conn.execute(form.text);
  vscode.window.showInformationMessage(res);

  // editor.selection = selectSyntaxNode(form);
  // vscode.commands.executeCommand("python.execSelectionInTerminal");
}

async function evalCurrentFile(parser: Parser) {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  let doc = editor.document;
  const tree = parser.parse(doc.getText()).rootNode;

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
