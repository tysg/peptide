import * as vscode from "vscode";
import { evalSelectedForm, evalCurrentFile } from "./evaluate";
import { initParser, getPrecedingForm, getTopLevelForm } from "./parser";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  const parser = await initParser();

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "peptide" is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand("peptide.evalTopLevelForm", () =>
      evalSelectedForm(parser, getTopLevelForm)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("peptide.evalPrecedingForm", () =>
      evalSelectedForm(parser, getPrecedingForm)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("peptide.evalCurrentFile", () => evalCurrentFile(parser))
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
