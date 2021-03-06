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
  ToioBatteryUpdate: (handler) => void;
  UpdateColor: (id: number, data: string) => void;
  UpdateName: (id: number, data: string) => void;
  UpdateStartPosition: (id: number, data: Position) => void;
  UpdatePaths: (id: number, data: OrbitPath[]) => void;
  AddPath: (id: number) => Promise<OrbitPath[]>;
  GetAllOrbits: () => Promise<OrbitData[] | null>;
  GetOrbitById: (id: number) => Promise<OrbitData | null>;
  CreateOrbit: () => Promise<{ id: number; orbit: OrbitData } | null>;
}
