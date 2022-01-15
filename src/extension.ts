import * as vscode from "vscode";
import * as commands from "./command";
import { connectToJupyter } from "./command";
import { Ctx } from "./ctx";

let ctx: Ctx | undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "peptide" is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand("peptide.connectJupyterServerURI", async () => {
      const conn = await connectToJupyter();
      if (!conn) {
        return;
      }
      ctx = await Ctx.create(context, conn);

      vscode.commands.executeCommand("setContext", "peptide.isJupyterConnected", true);
      registerCodeEvaluationCommands(ctx);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((_) => {
      ctx?.decorator.clearEvaluateResult;
    })
  );
}

// this method is called when your extension is deactivated
export async function deactivate() {
  if (ctx) {
    await ctx?.dispose();
    vscode.commands.executeCommand("setContext", "peptide.isJupyterConnected", undefined);
    ctx = undefined;
  }
}

function registerCodeEvaluationCommands(ctx: Ctx) {
  ctx.registerCommand("evalCurrentFile", commands.evalCurrentFile);
  ctx.registerCommand("evalPrecedingForm", commands.evalPrecedingForm);
  ctx.registerCommand("evalTopLevelStmt", commands.evalTopLevelStmt);
  ctx.registerCommand("clearInlineEvalResult", commands.clearInlineEvalResult);
}
