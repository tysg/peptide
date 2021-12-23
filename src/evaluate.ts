import * as vscode from 'vscode';
import * as Parser from "web-tree-sitter"
import { getTopLevelForm } from "./parser"

// Commands related to evaluation

async function evalTopLevelForm(parser: Parser) {
    let editor = vscode.window.activeTextEditor!
    let doc = editor.document

    const tree = parser.parse(doc.getText()).rootNode

    // find form at cursor
    const p = editor.selection.active

    const form = getTopLevelForm(tree, doc.offsetAt(p))
    if (!form) {
        console.error("No parent found for current cursor")
        return
    }

    editor.selection = form
    vscode.commands.executeCommand("python.execSelectionInTerminal")
}

export { evalTopLevelForm };