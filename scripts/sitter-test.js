const path = require('path');
const Parser = require('web-tree-sitter');

const sourceCode =
`def hello_world():
    print("hello world!")

hello_world()
`
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
    const tree = parser.parse(sourceCode)
        // tree.rootNode.descendantForPosition({ row: 3, column: 12 })
        // .parent
        // .parent
        // .parent
        // .parent
        // .toString()

    // find the largest node s.t. index < given
    // idx 59

    const n = tree.rootNode
    

    // console.log(
    
    //     tree.rootNode.
    // )

}

main()