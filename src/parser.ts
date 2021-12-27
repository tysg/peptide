import * as path from "path";
import * as Parser from "web-tree-sitter";

function getTopLevelForm(root: Parser.SyntaxNode, offset: number): Parser.SyntaxNode | undefined {
  return root.children.find((n) => offset <= n.endIndex && offset >= n.startIndex);
}

function getPrecedingForm(root: Parser.SyntaxNode, offset: number): Parser.SyntaxNode | undefined {
  // selects the preceding function call or name
  return root.children.find((n) => offset <= n.endIndex && offset >= n.startIndex);
}

async function initParser(): Promise<Parser> {
  await Parser.init();

  const langFile = path.join(__dirname, "..", "assets", "tree-sitter-python.wasm");
  const parser = new Parser();
  const pythonLang = await Parser.Language.load(langFile);
  parser.setLanguage(pythonLang);
  return parser;
}

export { getTopLevelForm, initParser };
