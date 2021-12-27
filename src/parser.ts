import * as path from "path";
import * as vscode from "vscode";
import * as Parser from "web-tree-sitter";

function getTopLevelForm(root: Parser.SyntaxNode, offset: number): vscode.Selection | null {
  const f = root.children.find((n) => offset <= n.endIndex && offset >= n.startIndex);

  if (!f) {
    return null;
  }

  return new vscode.Selection(
    f.startPosition.row,
    f.startPosition.column,
    f.endPosition.row,
    f.endPosition.column
  );
}

function getPrecedingForm(root: Parser.SyntaxNode, offset: number): vscode.Selection | null {
  // selects the preceding function call or name
  const f = root.children.find((n) => offset <= n.endIndex && offset >= n.startIndex);

  if (!f) {
    return null;
  }

  return new vscode.Selection(
    f.startPosition.row,
    f.startPosition.column,
    f.endPosition.row,
    f.endPosition.column
  );
}

async function initParser(): Promise<Parser> {
  await Parser.init();

  const langFile = path.join(__dirname, "..", "assets", "tree-sitter-python.wasm");
  const parser = new Parser();
  const Lang = await Parser.Language.load(langFile);
  parser.setLanguage(Lang);
  return parser;
}

export { getTopLevelForm, initParser };
