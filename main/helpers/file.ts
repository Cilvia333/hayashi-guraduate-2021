import { readFile, writeFile } from 'fs';
import { promisify } from 'util';

import { BrowserWindow, dialog } from 'electron';

const asyncReadFile = promisify(readFile);
const asyncWriteFile = promisify(writeFile);

export const openFile = async () => {
  const win = BrowserWindow.getFocusedWindow();
  const path = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'Document', extensions: ['json'] }],
  });

  if (!path) {
    return null;
  }

  const json = JSON.parse(await asyncReadFile(path.filePaths[0], 'utf-8'));

  if (!json) {
    return null;
  }

  return json;
};

export const saveFile = async (data: any) => {
  const win = BrowserWindow.getFocusedWindow();
  const path = await dialog.showSaveDialogSync(win, {
    properties: ['createDirectory'],
    filters: [{ name: 'marchmallow.config', extensions: ['json'] }],
  });

  if (!path) {
    return null;
  }

  return await asyncWriteFile(path, JSON.stringify(data));
};
