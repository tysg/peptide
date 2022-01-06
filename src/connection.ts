import { KernelManager, ServerConnection } from "@jupyterlab/services";
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
export class JupyterConnection {
  kernel: IKernelConnection;

  constructor(kernel: IKernelConnection) {
    this.kernel = kernel;
  }

  static async init(baseUrl: string, token: string): Promise<JupyterConnection> {
    const connectionSetting = ServerConnection.makeSettings({ baseUrl, token });
    const kernelManager = new KernelManager({ serverSettings: connectionSetting });
    const kernel = await kernelManager.startNew({ name: "python" });
    return new JupyterConnection(kernel);
  }

  async execute(code: string): Promise<string> {
    const future = this.kernel.requestExecute({ code });
    let executionResult: string;
    future.onIOPub = (msg) => {
      if (msg.header.msg_type !== "status") {
        //@ts-ignore
        executionResult = msg.content.data["text/plain"];
      }
    };
    await future.done;
    return executionResult!;
  }
}
