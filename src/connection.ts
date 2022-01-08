import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";

export class JupyterConnection {
  /**
   * Manages functions and resources related to a kernel.
   * @param kernel
   * @param isOwned whether the kernel is created by the class
   */
  constructor(private kernel: IKernelConnection, private isOwned: boolean) {}

  async execute(code: string): Promise<string> {
    const future = this.kernel.requestExecute({ code });
    let executionResult: string;
    future.onIOPub = (msg) => {
      // console.log(msg);
      if (msg.header.msg_type === "execute_result") {
        // @ts-ignore: field `data` existing on `content`
        executionResult = msg.content.data["text/plain"];
      }
    };
    await future.done;
    return executionResult!;
  }

  async dispose() {
    if (this.isOwned) {
      await this.kernel.shutdown();
    } else {
      this.kernel.dispose();
    }
  }
}
