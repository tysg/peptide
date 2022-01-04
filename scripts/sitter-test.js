const path = require('path');
const Parser = require('web-tree-sitter');


function extractCursor(source) {
    const idx = source.indexOf("$");
    const sourceCode = source.replace("$", "");
    return [idx, sourceCode]
}

function pp(n) {
    console.log(n.toString())
}
async function main() {
    // parse current python file
    const langFile = path.join(__dirname, "..", "assets", "tree-sitter-python.wasm")
    await Parser.init()

    const parser = new Parser();
    const Lang = await Parser.Language.load(langFile)
    parser.setLanguage(Lang)

    const sourceCode   =
`def hello_world():
    print("hello world!")

hello_world()
`
    let [cursorIdx, source] = extractCursor(sourceCode)

    const tree = parser.parse(source);
    const loren = `lorem(ipsum(hello("world"))$)`
    console.log(extractCursor(loren))

    console.log(
        tree.rootNode.descendantForIndex(cursorIdx)
        .toString()
    )

    // console.log(tree)
    // find the largest node s.t. index < given
    // idx 59

    const n = tree.rootNode
    


}

main()