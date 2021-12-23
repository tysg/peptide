// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path = require('path');
import * as vscode from 'vscode';
import * as Parser from "web-tree-sitter"

function getTopLevelForm(root: Parser.SyntaxNode, offset: number): vscode.Selection | null {
	const f = root.children.
		find((n) => (offset <= n.endIndex) && (offset >= n.startIndex))
	if (!f) {
		return null
	}

	const anchorLine = f.startPosition.row
	const anchorChar = f.startPosition.column

	const activeLine = f.endPosition.row
	const activeChar = f.endPosition.column

	return new vscode.Selection(anchorLine, anchorChar, activeLine, activeChar)
}

async function initParser(): Promise<Parser> {
	await Parser.init()

	const langFile = path.join(__dirname, '..', "assets", "tree-sitter-python.wasm")
	const parser = new Parser();
	const Lang = await Parser.Language.load(langFile)
	parser.setLanguage(Lang)
	return parser
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const parser = await initParser()

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "peptide" is now active!');


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('peptide.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from vscode!');
		let editor = vscode.window.activeTextEditor!
		let doc = editor.document

		const tree = parser.parse(doc.getText()).rootNode

		// find form at cursor
		const p = editor.selection.active

		const form = getTopLevelForm(tree, doc.offsetAt(p))
		if (!form) {
			console.log("no parent found for curr cursor")
			return
		}

		editor.selection = form
		vscode.commands.executeCommand("python.execSelectionInTerminal")
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
