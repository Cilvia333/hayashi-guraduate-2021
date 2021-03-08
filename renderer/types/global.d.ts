declare global {
  interface Window {
    api: Sandbox;
  }
}

export interface Sandbox {
  ToioConnect: (id: number) => Promise<void | string[]>;
  ToioDisconnect: (id: number) => Promise<void | string[]>;
  ToioStart: (id) => void;
  ToioStop: (id) => void;
  ToioBatteryUpdate: (handler: (arg: any) => void) => void;
  ToioPositionUpdate: (handler: (arg: any) => void) => void;
  UpdateColor: (id: number, data: string) => void;
  UpdateName: (id: number, data: string) => void;
  UpdateStartPosition: (id: number, data: Position) => void;
  UpdatePaths: (id: number, data: OrbitPath[]) => void;
  AddPath: (id: number) => Promise<OrbitPath[]>;
  DeletePath: (id: number, index: number) => Promise<boolean>;
  ChangePath: (id: number, index: number, fileName: string) => Promise<string>;
  GetAllOrbits: () => Promise<OrbitData[] | null>;
  GetOrbitById: (id: number) => Promise<OrbitData | null>;
  CreateOrbit: () => Promise<{ id: number; orbit: OrbitData } | null>;
  DeleteOrbit: (id: number) => Promise<boolean>;
  StoreUpdate: (handler: (arg: OrbitData[]) => void) => void;
  ExportConfig: () => void;
  ImportConfig: () => void;
  UpdateConfig: (handler: () => void) => void;
}
