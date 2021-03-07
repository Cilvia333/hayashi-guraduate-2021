import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  ToioConnect: async (id: number) => {
    await ipcRenderer.invoke('ipc-toio-connect', id);
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
  DeletePath: async (id: number, num: number) => {
    return await ipcRenderer.invoke('ipc-toio-delete-path', { id, num });
  },
  ChangePath: async (id: number, fileName: string) => {
    return await ipcRenderer.invoke('ipc-toio-delete-path', { id, fileName });
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
});
