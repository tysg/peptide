import * as Parser from "web-tree-sitter";
import * as vscode from "vscode";
import { JupyterConnection } from "./connection";
import { initParser } from "./parser";
import { DecorationManager } from "./decorate";

export class Ctx {
  private constructor(
    private readonly extCtx: vscode.ExtensionContext,
    readonly parser: Parser,
    readonly client: JupyterConnection,
    readonly decorator: DecorationManager
  ) {}

  static async create(extCtx: vscode.ExtensionContext, conn: JupyterConnection) {
    const parser = await initParser();
    const decorator = new DecorationManager();
    return new Ctx(extCtx, parser, conn, decorator);
  }

  registerCommand(name: string, factory: (_: Ctx) => any) {
    const fullName = `peptide.${name}`;
    const cmd = factory(this);
    const d = vscode.commands.registerCommand(fullName, cmd);
    this.pushCleanup(d);
  }

  pushCleanup(d: vscode.Disposable) {
    this.extCtx.subscriptions.push(d);
  }

  async dispose() {
    this.client.dispose();
    this.parser.delete();
  }
}
