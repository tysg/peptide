import * as vscode from "vscode";
import * as Parser from "web-tree-sitter";
import { getTopLevelForm } from "./parser";

// Commands related to evaluation

async function evalTopLevelForm(parser: Parser) {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  let doc = editor.document;

  const tree = parser.parse(doc.getText()).rootNode;

  // find form at cursor
  const p = editor.selection.active;

  const form = getTopLevelForm(tree, doc.offsetAt(p));
  if (!form) {
    console.error("No parent found for current cursor");
    return;
  }

  editor.selection = selectSyntaxNode(form);
  vscode.commands.executeCommand("python.execSelectionInTerminal");
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

export { evalTopLevelForm, evalCurrentFile };
