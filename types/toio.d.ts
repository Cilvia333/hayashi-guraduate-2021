type OrbitData = {
  color: string;
  id: number;
  name: string;
  startPos: Position;
  paths: OrbitPath[];
};

type OrbitPath = {
  path: string;
  back: boolean;
  invert: boolean;
  delayMs: number;
};

type PathData = {
  path: ReturnType<typeof svgPathProperties>;
  length: number;
  rate: number;
  back: boolean;
  invert: boolean;
  delayMs: number;
};

type Position = {
  x: number;
  y: number;
  angle: number;
};

type ToioRef = {
  start: () => void;
  stop: () => void;
  disconnect: () => Promise<void>;
  id: number;
};

declare class Cube {
  disconnect(): Promise<void>;
}
