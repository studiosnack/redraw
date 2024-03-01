import {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  dialog,
  ipcMain,
  ipcRenderer,
  session,
} from "electron";
import os from "node:os";
import path from "node:path";
import * as fs from "node:fs/promises";
import { StringDecoder } from "node:string_decoder";

import type { RootState } from "./reducer";

import ElectronStore from "electron-store";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const reactDevToolsPath = path.join(
  os.homedir(),
  "/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/5.0.0_22"
);

async function ingestAndReturnDocument<Doc = {}>(path: string): Promise<Doc> {
  try {
    const strContents = await fs.readFile(path, "utf8");
    return JSON.parse(strContents);
  } catch (err) {
    throw new Error(err);
  }
  return {};
}

const store = new ElectronStore();
ipcMain.on("store-set", (_evt, val) => {
  store.set("mainstore", val);
});
ipcMain.handle("get-mainstore", async (evt) => {
  return store.get("mainstore");
});
ipcMain.handle("get-document", async (evt, path) => {
  return ingestAndReturnDocument(path);
});
ipcMain.handle(
  "show-context-menu",
  (
    evt,
    categoryId: string,
    categoryName: string,
    premadeActions: { delete: {}; moveSiblingsInto?: {} },
    opts: { wantsNewChild: boolean }
  ) => {
    return new Promise((res, rej) => {
      const template = [
        {
          label: `Delete ${categoryName}`,
          click: () => {
            res(["delete", premadeActions.delete]);
          },
        },
        // premadeActions.moveSiblingsInto
        //   ? {
        //       label: "move siblings into this category",
        //       click: () => {
        //         res(["move", premadeActions.moveSiblingsInto]);
        //       },
        //     }
        //   : null,
        opts.wantsNewChild
          ? {
              label: "Add Child Category",
              click: () => {
                res(["add-child", categoryId]);
              },
            }
          : null,
      ].filter(Boolean);
      const menu = Menu.buildFromTemplate(template);
      menu.popup({ window: BrowserWindow.fromWebContents(evt.sender) });
    });
  }
);
const menuTemplate = [
  { role: "appMenu" },
  {
    label: "File",
    submenu: [
      {
        label: "New",
        accelerator: "CommandOrControl+N",
        click: (item, bw, evt) => {
          createWindow();
        },
      },
      {
        label: "Open…",
        accelerator: "CommandOrControl+O",
        click: async (item, bw, evt) => {
          const { filePaths, canceled } = await dialog.showOpenDialog(bw, {
            filters: [{ name: "redraw docs", extensions: [".rdrw"] }],
          });

          if (!canceled) {
            filePaths.forEach((path) => {
              console.log(path);
              openBrowserFromDocument(path);
            });
          }
          // console.log("want to open", filename);
        },
      },
      {
        label: "Open Recent",
        role: "recentDocuments",
        submenu: [
          {
            label: "Clear Recent...",
            role: "clearRecentDocuments",
          },
        ],
      },
      { type: "separator" },
      {
        label: "Save",
        accelerator: "CommandOrControl+S",
        click: (_item, bw: BrowserWindow, _evt) => {
          bw.webContents.send("request-save-document");
        },
      },
      { type: "separator" },
      { role: "close" },
    ],
  },
];

const createWindow = async (
  doc?: RootState,
  filePath?: string,
  bounds?: Electron.Rectangle
) => {
  // Create the browser window.
  if (filePath) {
    app.addRecentDocument(filePath);
  }
  const basePathTitle = filePath
    ? path.basename(filePath).replace(".rdrw", "")
    : "New Drawer";

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: false,
    vibrancy: "under-window",
    roundedCorners: true,
    title: basePathTitle,
    titleBarStyle: "default",
    titleBarOverlay: true,
    backgroundColor: "rgba(0,0,0,0)",
    visualEffectState: "followWindow",
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
  /*
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("receive-initial-document", doc);

    if (filePath) {
      mainWindow.setRepresentedFilename(filePath);
    }
  });*/

  // Open the DevTools.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  // register a window specific handler for load
  mainWindow.webContents.ipc.handle(
    "request-initial-document-state",
    async () => {
      return doc ?? undefined;
    }
  );
  // handle requests from the renderer to save the current document state
  // usually called by the Save menu item or the reducer middleware which
  // will attempt to autosave the document
  mainWindow.webContents.ipc.handle("save-document", (evt, document) => {
    saveDocumentAtPath(document, filePath, mainWindow);
  });
  mainWindow.webContents.ipc.handle("autosave-document", (evt, document) => {
    saveDocumentAtPath(document, filePath, filePath ? mainWindow : undefined);
  });

  // register window-specific state event handlers
  mainWindow.on("move", (_evt) => {
    const bounds = mainWindow.getBounds();
    console.log(`window ${basePathTitle} moved to ${JSON.stringify(bounds)}`);
    // update position in recent docs list
  });
  mainWindow.on("will-resize", (evt, bounds) => {
    console.log(`window ${basePathTitle} resized to ${JSON.stringify(bounds)}`);
    // update size in recent docs list
  });
  mainWindow.on("close", (evt) => {
    // remove from opened docs list
    console.log(`closing window for ${filePath}`);
    const openDocs: Array<{ path: string }> = store.get("app:opendocs") ?? [];
    const nowOpenDocs = openDocs.filter((d) => d.path !== filePath);
    store.set("app:opendocs", nowOpenDocs);
    console.log("app:opendocs now", JSON.stringify(nowOpenDocs));
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on("ready", createWindow);
app.whenReady().then(async () => {
  // await session.defaultSession.loadExtension(reactDevToolsPath);

  // app.addRecentDocument("/Users/marcos/projects/redraw/stash.rdrw");

  const recentDocs: string[] = store.get("app:recentdocs") ?? [];
  console.log(`adding recent docs: ${recentDocs.join("\n")}`);
  recentDocs.forEach((path) => app.addRecentDocument(path));

  // console.log("app ready!");
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  // restorePreviouslyOpenedDocuments();
});

app.on("before-quit", (evt) => {
  console.log("gonna quit!");
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    // createWindow();
  }
});

async function openBrowserFromDocument(packagePath: string) {
  // console.log(`attempting to own package at `, packagePath);
  const doc = await ingestAndReturnDocument(
    path.join(packagePath, "config.json")
  );

  // this .mainstore here is because in the current version of this file
  // we store the entire redux store in the config.json under the mainstore path
  // because of the earlier use of electron-store
  // future versions... won't
  createWindow(doc.mainstore, packagePath);

  // add path to the currently open docs list
  const openDocs: Array<{ path: string }> = store.get("app:opendocs") ?? [];
  const recentDocs: string[] = store.get("app:recentdocs") ?? [];
  if (openDocs.findIndex((d) => d.path === packagePath) > -1) {
    // we're reopening a document, no need to update recents
    // or opendocs
  } else {
    // we're opening a document for the first time
    openDocs
      .filter(({ path }) => path !== packagePath)
      .push({ path: packagePath });
    store.set("app:opendocs", openDocs);
    const updatedRecentDocs = recentDocs
      .filter((pth) => pth !== packagePath)
      .toSpliced(0, 0, packagePath);
    store.set("app:recentdocs", updatedRecentDocs);
  }
}

app.on("open-file", async (evt, filePath) => {
  evt.preventDefault();
  console.log("would open file at ", filePath);

  openBrowserFromDocument(filePath);
});

async function saveDocumentAtPath(
  document: RootState,
  packagePath?: string,
  bw?: BrowserWindow
) {
  if (packagePath != null) {
    // console.log("would have saved document at path", packagePath);
    const meta = await ingestAndReturnDocument<{ version: number }>(
      path.join(packagePath, "meta.json")
    );
    if (meta.version === 1) {
      const allData = await ingestAndReturnDocument<{ mainstore: RootState }>(
        path.join(packagePath, "config.json")
      );
      allData["mainstore"] = document;
      const jsonifiedDoc = JSON.stringify(allData, null, 2);
      console.log(jsonifiedDoc);
      await fs.writeFile(path.join(packagePath, "config.json"), jsonifiedDoc);
    }
  } else if (bw != null) {
    const { filePath, canceled } = await dialog.showSaveDialog(bw, {
      defaultPath: "New Drawer.rdrw",
      properties: ["treatPackageAsDirectory", "createDirectory"],
    });
    if (canceled) {
      console.log("cowardly refusing to save a document");
    } else {
      await fs.mkdir(filePath);
      await fs.writeFile(path.join(filePath, "meta.json"), `{"version": 1}`);
      const allData = { mainstore: document };
      await fs.writeFile(
        path.join(filePath, "config.json"),
        JSON.stringify(allData, null, 2)
      );
    }
  }
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
