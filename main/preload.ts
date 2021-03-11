import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  ToioConnect: async (id: number) => {
    return await ipcRenderer.invoke('ipc-toio-connect', id);
  },
  ToioDisconnect: async (id: number) => {
    await ipcRenderer.invoke('ipc-toio-disconnect', id);
  },
  ToioStart: (id) => {
    ipcRenderer.send('ipc-toio-start', id);
  },
  ToioStop: (id) => {
    ipcRenderer.send('ipc-toio-stop', id);
  },
  ToioBatteryUpdate: (handler: (arg: any) => void) => {
    ipcRenderer.on('ipc-toio-update-battery', (event, arg) => handler(arg));
  },
  ToioPositionUpdate: (handler: (arg: any) => void) => {
    ipcRenderer.on('ipc-toio-update-position', (event, arg) => handler(arg));
  },
  DisableUnits: (handler: () => void) => {
    ipcRenderer.on('ipc-toio-units-disable', handler);
  },
  UpdateUnits: (data: number) => {
    ipcRenderer.send('ipc-toio-units-update', data);
  },
  GetUnits: async () => {
    return await ipcRenderer.invoke('ipc-toio-units');
  },
  UpdateColor: (id: number, data: string) => {
    ipcRenderer.send('ipc-toio-update-color', { id, data });
  },
  UpdateName: (id: number, data: string) => {
    ipcRenderer.send('ipc-toio-update-name', { id, data });
  },
  UpdateStartPosition: (id: number, data: Position) => {
    ipcRenderer.send('ipc-toio-update-start-position', { id, data });
  },
  UpdatePaths: (id: number, data: OrbitPath[]) => {
    ipcRenderer.send('ipc-toio-update-paths', { id, data });
  },
  AddPath: async (id: number) => {
    return await ipcRenderer.invoke('ipc-toio-add-path', id);
  },
  DeletePath: async (id: number, index: number) => {
    return await ipcRenderer.invoke('ipc-toio-delete-path', { id, index });
  },
  ChangePath: async (id: number, index: number, fileName: string) => {
    return await ipcRenderer.invoke('ipc-toio-change-path', {
      id,
      index,
      fileName,
    });
  },
  GetAllOrbits: async () => {
    return await ipcRenderer.invoke('ipc-toio-get-orbits-all');
  },
  GetOrbitById: async (id: number) => {
    return await ipcRenderer.invoke('ipc-toio-get-orbit', id);
  },
  CreateOrbit: async () => {
    return await ipcRenderer.invoke('ipc-toio-create-orbit');
  },
  DeleteOrbit: async (id: number) => {
    return await ipcRenderer.invoke('ipc-toio-delete-orbit', id);
  },
  StoreUpdate: (handler: (arg: any) => void) => {
    ipcRenderer.on('ipc-store-update', (event, arg) => handler(arg));
  },
  ExportConfig: () => {
    ipcRenderer.send('ipc-config-export');
  },
  ImportConfig: () => {
    ipcRenderer.send('ipc-config-import');
  },
  UpdateConfig: (handler: () => void) => {
    ipcRenderer.on('ipc-config-update', () => handler());
  },
});
