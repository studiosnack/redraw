// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");
import { type IpcRendererEvent } from "electron/common";

contextBridge.exposeInMainWorld("electronAPI", {
  storeSet: (value: { [key: string]: any }) => {
    ipcRenderer.send("store-set", value);
  },
  getSavedState: () => {
    return ipcRenderer.invoke("get-mainstore") ?? {};
  },
  getWindowState: () => {
    return ipcRenderer.invoke("get-document") ?? {};
  },
  onReceiveInitialDocument: (cb: (evt: IpcRendererEvent, val: any) => any) => {
    console.log("calling onReceiveInitialDocument and registering callback");

    ipcRenderer.on("receive-initial-document", (evt, val) => {
      console.log("got initial recv event!", evt, val);
      cb(evt, val);
    });
  },
  showContextMenu: (
    categoryId: string,
    categoryName: string,
    actions: {},
    opts: {}
  ) => {
    return ipcRenderer.invoke(
      "show-context-menu",
      categoryId,
      categoryName,
      actions,
      opts
    );
  },
});
