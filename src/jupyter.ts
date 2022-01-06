// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { KernelAPI, KernelManager, KernelMessage, ServerConnection } from '@jupyterlab/services';
import { IKernelConnection } from '@jupyterlab/services/lib/kernel/kernel';

async function example(kernel: IKernelConnection, ) : Promise<void> {
  // Register a callback for when the kernel changes state.
  kernel.statusChanged.connect((_, status) => {
    console.log(`Status: ${status}`);
  });

  console.log('Executing code');
  const future = kernel.requestExecute({ code: 'a = 1' });
  // Handle iopub messages
  future.onIOPub = msg => {
    if (msg.header.msg_type !== 'status') {
      console.log(msg.content);
    }
  };
  await future.done;
  console.log('Execution is done');

  console.log('Send an inspect message');
  const request: KernelMessage.IInspectRequestMsg['content'] = {
    code: 'hello',
    cursor_pos: 4,
    detail_level: 0
  };
  const inspectReply = await kernel.requestInspect(request);
  console.log('Looking at reply');
  if (inspectReply.content.status === 'ok') {
    console.log('Inspect reply:');
    console.log(inspectReply.content.data);
  }

  console.log('Interrupting the kernel');
  await kernel.interrupt();

  console.log('Send an completion message');
  const reply = await kernel.requestComplete({ code: 'impor', cursor_pos: 4 });
  if (reply.content.status === 'ok') {
    console.log(reply.content.matches);
  }

  console.log('Restarting kernel');
  await kernel.restart();

  console.log('Shutting down kernel');
  await kernel.shutdown();

}


async function executeCode(kernel: IKernelConnection) : Promise<void> {
  console.log('Executing code');
  const code = `
def hello_world():
  return "hello world"
hello_world()
  `
  const future = kernel.requestExecute({code});
  // Handle iopub messages
  future.onIOPub = msg => {
    if (msg.header.msg_type !== 'status') {
      console.log(msg.content);
    }
  };
  await future.done;
  console.log('Execution is done');

}

export async function main(): Promise<void> {
  const settings = ServerConnection.makeSettings({baseUrl: "http://localhost:8888" , token: "8bd36b56927c7e9a4fe011ed20a38ccfc372d5e486c65221"})

  // Start a python kernel
  const kernelManager = new KernelManager({serverSettings: settings});
  // const kernel = await kernelManager.startNew({ name: 'python' });
  // await executeCode(kernel);
  console.log('Finding all existing kernels');
  const kernelModels = await KernelAPI.listRunning(settings);
  console.log(kernelModels);
  if (kernelModels.length > 0) {
    console.log(`Connecting to ${kernelModels[0].name}`);
    kernelManager.connectTo({ model: kernelModels[0] });
  }
}

main()