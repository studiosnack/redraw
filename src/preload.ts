// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");

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
