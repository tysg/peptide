import * as path from "path";
import * as Parser from "web-tree-sitter";

const ALLOWED_LEAVES = new Set([
  "parenthesized_expression",
  "call",
  "identifier",
  "integer",
  "string",
  "float",
  "true",
  "false",
]);

function getTopLevelForm(root: Parser.SyntaxNode, offset: number): Parser.SyntaxNode | undefined {
  return root.children.find((n) => offset <= n.endIndex && offset >= n.startIndex);
}

function getPrecedingForm(root: Parser.SyntaxNode, offset: number): Parser.SyntaxNode | undefined {
  if (!root.namedChildren) {
    return root;
  }

  if (root.endIndex <= offset && ALLOWED_LEAVES.has(root.type)) {
    return root;
  }

  const children = root.namedChildren;
  let lastPrecedingForm;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (child.startIndex > offset) {
      break;
    }
    // included
    const res = getPrecedingForm(child, offset);
    if (res) {
      lastPrecedingForm = res;
    }
  }
  return lastPrecedingForm;
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
