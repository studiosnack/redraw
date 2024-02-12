import {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  ipcMain,
  ipcRenderer,
  session,
} from "electron";
import os from "node:os";
import path from "node:path";
import * as fs from "node:fs/promises";
import { StringDecoder } from "node:string_decoder";

import ElectronStore from "electron-store";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const reactDevToolsPath = path.join(
  os.homedir(),
  "/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/5.0.0_22"
);

async function ingestAndReturnDocument(path: string): Promise<{}> {
  let handle;
  const decoder = new StringDecoder();
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
const menu = new Menu({});

const createWindow = async (doc, filePath) => {
  // Create the browser window.

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: false,
    vibrancy: "under-window",
    roundedCorners: true,
    title: path.basename(filePath),
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

  console.log("sending initial doc event");
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("receive-initial-document", doc);
    mainWindow.setRepresentedFilename(filePath);
    // mainWindow.setDocumentEdited(true);
  });
  // Open the DevTools.
  mainWindow.webContents.openDevTools({ mode: "detach" });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on("ready", createWindow);
app.whenReady().then(async () => {
  // await session.defaultSession.loadExtension(reactDevToolsPath);
  // console.log(reactDevToolsPath);
  // createWindow();
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

app.addRecentDocument("/Users/marcos/projects/redraw/stash.rdrw");

app.on("open-file", async (evt, filePath) => {
  evt.preventDefault();
  // console.log("would open file at ", filePath);

  const doc = await ingestAndReturnDocument(path.join(filePath, "config.json"));
  // console.log("opening doc", doc.mainstore);
  createWindow(doc.mainstore, filePath);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
