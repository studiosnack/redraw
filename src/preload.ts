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
  showContextMenu: (categoryId: string, actions: {}, opts: {}) => {
    console.log(`showig for ${categoryId}`);
    return ipcRenderer.invoke("show-context-menu", categoryId, actions, opts);
  },
});
