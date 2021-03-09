import { readFile } from 'fs';
import path from 'path';
import { promisify } from 'util';

import { NearestScanner, NearScanner } from '@toio/scanner';
import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import Store from 'electron-store';
import { JSDOM } from 'jsdom';

import { createWindow, openFile, saveFile } from './helpers';
import toio from './toio';

const asyncReadFile = promisify(readFile);
const isProd: boolean = process.env.NODE_ENV === 'production';
const toioRefs = new Map<number, ToioRef>();
const store = new Store<StoreType>();
let toioScaner = new NearScanner(1);
let mainWindow: Electron.BrowserWindow = null;

const default_path = {
  path:
    'M1659.13,1590.51l135.25,133.71s154.55,243.73-18.55,348.68h0c-225.52,130.72-621.41-172.57-596.37-506.95-6.42-74-36.32-142.82-97-195',
  back: false,
  invert: true,
  delayMs: 1000,
};

const def_orbit = {
  id: 0,
  name: 'Takashi',
  color: '#ff0000',
  startPos: {
    x: 236.53660073075469,
    y: 318.12686534662095,
    angle: 90,
  },

  paths: [default_path],
};

const handleBattery = (id: number, value: number) => {
  if (mainWindow !== null) {
    mainWindow.webContents.send('ipc-toio-update-battery', id, value);
  }
};

const handlePosition = (id: number, position: Position) => {
  if (mainWindow !== null) {
    mainWindow.webContents.send('ipc-toio-update-position', { id, position });
  }
};

const handleUpdateStore = (orbits: OrbitData[]) => {
  if (mainWindow !== null) {
    mainWindow.webContents.send('ipc-store-update', orbits);
  }
};

const handleUpdateConfig = () => {
  if (mainWindow !== null) {
    mainWindow.webContents.send('ipc-config-update');
  }
};

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

if (!store.get('orbits')) {
  store.set('orbits', [def_orbit]);
}

if (!store.get('units')) {
  store.set('units', 1);
  toioScaner = new NearScanner(1);
} else {
  toioScaner = new NearScanner(store.get('units'));
}

(async () => {
  await app.whenReady();

  mainWindow = createWindow('main', {
    width: 1920,
    height: 1080,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, '../app/preload.js'),
    },
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});

store.onDidChange('orbits', (newOrbits, oldOrbits) => {
  handleUpdateStore(newOrbits);
});

ipcMain.handle('ipc-toio-connect', async (event, argv) => {
  const id = argv as number;
  const orbits = store.get('orbits');

  if (toioRefs.has(id)) {
    console.log('あるよ');
    return true;
  } else if (orbits.length > id) {
    const ref = await toio(
      id,
      toioRefs.size,
      orbits[id],
      toioScaner,
      handleBattery,
      handlePosition
    );
    toioRefs.set(id, ref);
    return true;
  }
  return false;
});

ipcMain.handle('ipc-toio-disconnect', async (event, argv) => {
  const id = argv as number;

  if (toioRefs.has(id)) {
    toioRefs.get(id).stop();
    return toioRefs.delete(id);
  }

  return true;
});

ipcMain.on('ipc-toio-start', (event, argv) => {
  const id = argv as number;

  if (toioRefs.has(id)) {
    toioRefs.get(id).start();
  }
});

ipcMain.on('ipc-toio-stop', (event, argv) => {
  const id = argv as number;

  if (toioRefs.has(id)) {
    toioRefs.get(id).stop();
  }
});

ipcMain.handle('ipc-toio-get-orbits-all', () => {
  const orbits = store.get('orbits');
  return orbits;
});

ipcMain.handle('ipc-toio-get-orbit', (event, argv) => {
  const orbits = store.get('orbits');

  const id = argv as number;

  return orbits[id] ? orbits[id] : null;
});

ipcMain.handle('ipc-toio-add-path', (event, argv) => {
  const orbits = store.get('orbits');
  const id = argv as number;

  if (orbits[id]) {
    const data = [...orbits[id].paths, default_path];
    const newData = { ...orbits[id], paths: data };
    const newArray = orbits.filter((_, i) => i !== id);
    newArray.splice(id, 0, newData);
    store.set('orbits', newArray);

    return data;
  }

  return null;
});

ipcMain.handle('ipc-toio-delete-path', (event, argv) => {
  const orbits = store.get('orbits');
  const id = argv.id as number;
  const index = argv.index as number;

  if (orbits[id]) {
    const newPaths = orbits[id].paths.filter((_, i) => i !== index);
    const newData = { ...orbits[id], paths: newPaths };

    const newOrbits = orbits.filter((_, i) => i !== id);
    newOrbits.splice(id, 0, newData);
    store.set('orbits', newOrbits);

    return true;
  }

  return false;
});

ipcMain.handle('ipc-toio-change-path', async (event, argv) => {
  const orbits = store.get('orbits');
  const id = argv.id as number;
  const index = argv.index as number;
  const fileName = argv.fileName as string;

  if (orbits[id]) {
    const data = await asyncReadFile(fileName);
    const svg = data.toString();

    const dom = new JSDOM(svg, { includeNodeLocations: true });
    const d = dom.window.document.querySelector('path').getAttribute('d');

    console.log(d);

    const currentPath = orbits[id].paths.filter((_, i) => i === index)[0];
    const newPath = { ...currentPath, path: d };

    const paths = orbits[id].paths.filter((_, i) => i !== index);
    paths.splice(index, 0, newPath);
    const newOrbit = { ...orbits[id], paths };

    const newOrbits = orbits.filter((_, i) => i !== id);
    newOrbits.splice(id, 0, newOrbit);
    store.set('orbits', newOrbits);

    return d;
  }

  return null;
});

ipcMain.handle('ipc-toio-delete-orbit', (event, argv) => {
  const orbits = store.get('orbits');
  const id = argv as number;

  if (!orbits[id]) {
    return false;
  }

  const newOrbits = orbits.filter((_, i) => i !== id);

  store.set('orbits', newOrbits);

  return true;
});

ipcMain.handle('ipc-toio-create-orbit', () => {
  const orbits = store.get('orbits');

  if (orbits) {
    store.set('orbits', [...orbits, { ...def_orbit, id: orbits.length }]);
  } else {
    store.set('orbits', [def_orbit]);
  }

  return { id: orbits.length - 1, orbit: def_orbit };
});

ipcMain.on('ipc-toio-update-color', (event, argv) => {
  const orbits = store.get('orbits');

  const id = argv.id as number;
  const data = argv.data as string;

  if (orbits[id]) {
    const newData = { ...orbits[id], color: data };
    const newArray = orbits.filter((_, i) => i !== id);
    newArray.splice(id, 0, newData);
    store.set('orbits', newArray);
  }
});

ipcMain.on('ipc-toio-update-name', (event, argv) => {
  const orbits = store.get('orbits');

  const id = argv.id as number;
  const data = argv.data as string;

  if (orbits[id]) {
    const newData = { ...orbits[id], name: data };
    const newArray = orbits.filter((_, i) => i !== id);
    newArray.splice(id, 0, newData);
    store.set('orbits', newArray);
  }
});

ipcMain.on('ipc-toio-update-position', (event, argv) => {
  const orbits = store.get('orbits');

  const id = argv.id as number;
  const data = argv.data as Position;

  if (orbits[id]) {
    const newData = { ...orbits[id], startPos: data };
    const newArray = orbits.filter((_, i) => i !== id);
    newArray.splice(id, 0, newData);
    store.set('orbits', newArray);
  }
});

ipcMain.on('ipc-toio-update-paths', (event, argv) => {
  const orbits = store.get('orbits');

  const id = argv.id as number;
  const data = argv.data as OrbitPath[];

  if (orbits[id]) {
    const newData = { ...orbits[id], paths: data };
    const newArray = orbits.filter((_, i) => i !== id);
    newArray.splice(id, 0, newData);
    store.set('orbits', newArray);
  }
});

ipcMain.on('ipc-config-export', async () => {
  const storeData = store.store;

  if (!storeData) {
    return false;
  }

  await saveFile(storeData);

  return true;
});

ipcMain.on('ipc-config-import', async () => {
  const storeData = await openFile();

  if (!storeData) {
    return false;
  }

  store.store = storeData;

  handleUpdateConfig();

  return true;
});

ipcMain.on('ipc-toio-units-update', (event, argv) => {
  const num = argv as number;

  if (!num) {
    return;
  }

  toioScaner = new NearScanner(num);
  store.set('units', num);
});

ipcMain.handle('ipc-toio-units', () => {
  const units = store.get('units');

  if (!units) {
    store.set('units', 1);
    toioScaner = new NearScanner(1);
    return 1;
  }

  return units;
});
