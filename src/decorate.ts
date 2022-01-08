import * as vscode from "vscode";

export class DecorationManager {
  private anyHighlight: boolean;
  private decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgb(255, 250, 224)",
  });

  constructor() {
    vscode.window.activeTextEditor?.setDecorations(this.decorationType, []);
    this.anyHighlight = false;
  }

  decorateEvaluateResultRange(range: vscode.Range, result: string) {
    let displayedResult = ` => ${result} `.replace(/ /g, "\u00a0");
    let editor = vscode.window.activeTextEditor;

    const decorationOption: vscode.DecorationOptions = {
      range,
      renderOptions: { after: { contentText: displayedResult, textDecoration: "color: rgb(130, 130, 130)" } },
    };
    editor?.setDecorations(this.decorationType, [decorationOption]);
    this.anyHighlight = true;
  }

  public get isHighlighted(): boolean {
    return this.anyHighlight;
  }

  clearEvaluateResult() {
    if (this.anyHighlight) {
      vscode.window.activeTextEditor?.setDecorations(this.decorationType, []);
      this.anyHighlight = false;
    }
  }
}
