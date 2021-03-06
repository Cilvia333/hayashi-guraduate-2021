import fs from 'fs';

import { BrowserWindow, dialog } from 'electron';

export const openFile = (): any | null => {
  const win = BrowserWindow.getFocusedWindow();
  const paths = dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'Document', extensions: ['json'] }],
  });

  if (!paths) {
    return null;
  }

  return readFile(paths[0]);
};

const readFile = (path) => {
  const json = JSON.parse(fs.readFileSync(path, 'utf-8'));

  if (!json) {
    return null;
  }

  return json;
};

export const saveFile = (data: any): void => {
  const win = BrowserWindow.getFocusedWindow();
  const paths = dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'Document', extensions: ['json'] }],
  });

  if (!paths) {
    return null;
  }

  writeFile(paths[0], data);
};

const writeFile = (path, data) => {
  fs.writeFileSync(path, JSON.stringify(data));
};
