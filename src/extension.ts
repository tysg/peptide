import { url } from "inspector";
import * as vscode from "vscode";
import { JupyterConnection } from "./connection";
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
      evalSelectedForm(context, parser, getTopLevelForm)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("peptide.evalPrecedingForm", () =>
      evalSelectedForm(context, parser, getPrecedingForm)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("peptide.evalCurrentFile", () => evalCurrentFile(parser))
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("peptide.inputJupyterServerURI", async () => {
      let pattern = /(https?:\/\/.+)\/\?token=(.+)/;
      const result = await vscode.window.showInputBox({
        value: "http://localhost:8888/?token=c0b2c7dac6e9bbccf62fbe98d33982219c1142a4ec016c88",
        placeHolder: "Paste the Jupyter URL here..",
        validateInput: (text) => {
          // vscode.window.showInformationMessage(`Validating: ${text}`);
          return pattern.test(text) ? null : "Not valid Jupyter URL";
        },
      });
      const urlMatch = result?.trim().match(pattern);
      if (!urlMatch) {
        return;
      }
      const [_, baseUrl, token] = urlMatch;
      try {
        const conn = await JupyterConnection.init(baseUrl, token);
        context.workspaceState.update("jupyterConn", conn);
        vscode.window.showInformationMessage(`Connected: ${result}`);
      } catch (error) {
        vscode.window.showErrorMessage(`Unable to connect to Jupyter Server with ${result}`);
      }
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
