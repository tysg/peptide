import * as vscode from "vscode";

const decorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: "rgb(255, 250, 224)",
});

export async function decorateEvaluateResultRange(range: vscode.Range, result: string) {
  let displayedResult = ` => ${result} `.replace(/ /g, "\u00a0");
  let editor = vscode.window.activeTextEditor;

  const decorationOption: vscode.DecorationOptions = {
    range,
    renderOptions: { after: { contentText: displayedResult } },
  };
  editor?.setDecorations(decorationType, [decorationOption]);
}
