import * as path from "path";
import * as Parser from "web-tree-sitter";

function getTopLevelForm(root: Parser.SyntaxNode, offset: number): Parser.SyntaxNode | undefined {
  return root.children.find((n) => offset <= n.endIndex && offset >= n.startIndex);
}

function getPrecedingForm(root: Parser.SyntaxNode, offset: number): Parser.SyntaxNode | undefined {
  if (root.endIndex <= offset || root.namedChildren === null) {
    return root;
  }

  for (const child of root.namedChildren) {
    if (child.startIndex > offset) {
      break;
    }
    if (child.startIndex < offset && child.endIndex >= offset) {
      // included
      return getPrecedingForm(child, offset);
    }
  }
}

async function initParser(): Promise<Parser> {
  await Parser.init();

  const langFile = path.join(__dirname, "..", "assets", "tree-sitter-python.wasm");
  const parser = new Parser();
  const pythonLang = await Parser.Language.load(langFile);
  parser.setLanguage(pythonLang);
  return parser;
}

export { getTopLevelForm, getPrecedingForm, initParser };
