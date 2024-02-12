/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "./index.css";

import * as React from "react";
import * as ReactDOMClient from "react-dom/client";

import { App } from "./app";
import { getReduxStore, type RootState } from "./reducer";

async function getStateAndRender() {
  // @ts-ignore
  // const preloadedState = await window.electronAPI.getSavedState();
  const preloadedState = await window.electronAPI.getWindowState();
  const reduxStore = getReduxStore(preloadedState);

  const appRoot = ReactDOMClient.createRoot(document.getElementById("app"));
  appRoot.render(React.createElement(App, { reduxStore }));
}

async function renderFromDocumentState(documentState: RootState) {
  // @ts-ignore
  // const preloadedState = await window.electronAPI.getSavedState();
  // const preloadedState = await window.electronAPI.getWindowState();
  const reduxStore = getReduxStore(documentState);

  const appRoot = ReactDOMClient.createRoot(document.getElementById("app"));
  appRoot.render(React.createElement(App, { reduxStore }));
}
// @ts-ignore
window.electronAPI.onReceiveInitialDocument((evt, documentState: RootState) => {
  console.log("oh wow, got a doc", documentState, evt);
  renderFromDocumentState(documentState);
});

// getStateAndRender();
