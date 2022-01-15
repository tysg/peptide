import { KernelAPI, KernelManager, ServerConnection } from "@jupyterlab/services";
import * as vscode from "vscode";
import { JupyterConnection } from "./connection";
import { Ctx } from "./ctx";
import { evalSelectedForm } from "./evaluate";
import { getPrecedingForm, getTopLevelForm } from "./parser";

// Commands related to evaluation

type Cmd = () => any;

export function evalCurrentFile(ctx: Ctx): Cmd {
  return async () => {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    let doc = editor.document;
    const tree = ctx.parser.parse(doc.getText()).rootNode;

    const range = new vscode.Range(doc.positionAt(0), doc.positionAt(tree.endIndex));
    const res = await ctx.client.execute(doc.getText());
    ctx.decorator.decorateEvaluateResultRange(range, res);
  };
}

export function evalPrecedingForm(ctx: Ctx): Cmd {
  return async () => evalSelectedForm(ctx, getPrecedingForm);
}

export function evalTopLevelStmt(ctx: Ctx): Cmd {
  return async () => evalSelectedForm(ctx, getTopLevelForm);
}

export function clearInlineEvalResult(ctx: Ctx): Cmd {
  return () => ctx.decorator.clearEvaluateResult();
}

// Initialization command

export async function connectToJupyter(): Promise<JupyterConnection | undefined> {
  let pattern = /(https?:\/\/.+)\/\?token=(.+)/;
  const result = await vscode.window.showInputBox({
    placeHolder: "http://localhost:8888/?token=c0b2c7dac6e9bbccf62fbe98d33982219c1142a4ec016c88",
    // placeHolder: "Paste the Jupyter URL here..",
    validateInput: (text) => {
      return pattern.test(text) ? null : "Not valid Jupyter URL";
    },
  });

  const urlMatch = result?.trim().match(pattern);
  if (!urlMatch) {
    return;
  }

  const [_, baseUrl, token] = urlMatch;

  // listing available kernels
  const settings = ServerConnection.makeSettings({ baseUrl, token });
  const kernelManager = new KernelManager({ serverSettings: settings });

  const kernelModels = await KernelAPI.listRunning(settings);
  const newKernelPrompt = "Start a New Kernel";

  let selected;

  if (kernelModels.length > 0) {
    const kernelsToSelect = kernelModels.map((m) => {
      return `${m.name}: (${m.id})`;
    });

    // prompt the user to select 1, or create a new one
    selected = await vscode.window.showQuickPick([...kernelsToSelect, newKernelPrompt]);

    if (!selected) {
      return;
    }
  }

  try {
    let conn;
    if (!selected || selected === newKernelPrompt) {
      // create a new one
      const kernel = await kernelManager.startNew({ name: "python" });
      conn = new JupyterConnection(kernel, true);
    } else {
      const [_, name, id] = selected.match(/(.+): \((.+)\)/)!;
      const kernel = kernelManager.connectTo({ model: { id, name } });
      conn = new JupyterConnection(kernel, false);
    }

    vscode.window.showInformationMessage(`Connected: ${result}`);

    // return Ctx.create(context, kernelManager, conn);
    return conn;
  } catch (error) {
    vscode.window.showErrorMessage(`Unable to connect to Jupyter Server with ${result}`);
  }
}
