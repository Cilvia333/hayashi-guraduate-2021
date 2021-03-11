import { Cube, PositionIdInfo } from '@toio/cube';
import { NearScanner } from '@toio/scanner';
import Store from 'electron-store';
import { svgPathProperties } from 'svg-path-properties';

const IS_PRODUCTION = process.env.NODE_ENV;

const X_OFFSET = 34;
const Y_OFFSET = 35;
const X_MAX = 644;
const Y_MAX = 682;
const X_LENGTH = X_MAX - X_OFFSET;
const Y_LENGTH = Y_MAX - Y_OFFSET;

const SVG_WIDTH = 2525.67;
const SVG_HEIGHT = 2381.1;
const SVG_X_RATE = X_LENGTH / SVG_HEIGHT;
const SVG_Y_RATE = Y_LENGTH / SVG_WIDTH;

const MOVE_LENGTH = 9; // (length / 50) = 毎秒端から端まで
const MOTOR_SPEED = 25;

const GOAL_DISTANCE = 10;

function hex2rgb(hex: string) {
  if (hex.slice(0, 1) == '#') hex = hex.slice(1);
  if (hex.length == 3)
    hex =
      hex.slice(0, 1) +
      hex.slice(0, 1) +
      hex.slice(1, 2) +
      hex.slice(1, 2) +
      hex.slice(2, 3) +
      hex.slice(2, 3);

  return [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map(function (
    str
  ) {
    return parseInt(str, 16);
  });
}

const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

function chase(
  targetX: number,
  targetY: number,
  clientX: number,
  clientY: number,
  clientAngle: number,
  back = false
) {
  const diffX = targetX - clientX;
  const diffY = targetY - clientY;

  let relAngle = (Math.atan2(diffY, diffX) * 180) / Math.PI - clientAngle;

  if (back) {
    relAngle += Math.abs(relAngle) < 180 ? 180 : -180;
  }

  relAngle = relAngle % 360;
  if (relAngle < -180) {
    relAngle += 360;
  } else if (relAngle > 180) {
    relAngle -= 360;
  }

  const ratio = 1 - Math.abs(relAngle) / 90;

  if (relAngle > 0) {
    return back
      ? [-MOTOR_SPEED * ratio, -MOTOR_SPEED]
      : [MOTOR_SPEED, MOTOR_SPEED * ratio];
  } else {
    return back
      ? [-MOTOR_SPEED, -MOTOR_SPEED * ratio]
      : [MOTOR_SPEED * ratio, MOTOR_SPEED];
  }
}

function movePathByRate(
  cube: Cube,
  pos: Position,
  path: PathData,
  rate: number,
  setGoal: () => void
) {
  let calc_rate = path.invert ? path.length - rate : rate;

  if (calc_rate >= path.length) {
    calc_rate = path.length;
  } else if (calc_rate < 0) {
    calc_rate = 0;
  }

  const targetX = X_MAX - path.path.getPointAtLength(calc_rate).y * SVG_X_RATE;
  const targetY =
    Y_OFFSET + path.path.getPointAtLength(calc_rate).x * SVG_Y_RATE;
  const [left, right] = chase(
    targetX,
    targetY,
    pos.x,
    pos.y,
    pos.angle,
    path.back
  );

  if (
    rate >= path.length &&
    Math.sqrt(Math.pow(targetX - pos.x, 2) + Math.pow(targetY - pos.y, 2)) <
      GOAL_DISTANCE
  ) {
    setGoal();
  }

  cube.move(left, right, 100);
}

async function toio(
  id: number,
  index: number,
  orbit: OrbitData,
  scanner: NearScanner,
  onBattery: (id: number, value: number) => void,
  onPosition: (id: number, position: Position) => void
): Promise<ToioRef | null> {
  const position: Position = {
    x: 0,
    y: 0,
    angle: 0,
  };
  let rate = 0;
  let path_index = 0;
  let isSleep = false;
  let isGoal = false;
  let mainLoopRef: NodeJS.Timeout | null = null;
  let cubes: Cube[] | null = null;
  let sendCound = 0;

  const handlePosition = (info: PositionIdInfo) => {
    position.x = info.x;
    position.y = info.y;
    position.angle = info.angle;

    if (++sendCound > 100) {
      sendCound = 0;
      onPosition(id, position);
    }
  };

  const handleBattery = (info: { level: number }) => {
    onBattery(id, info.level);
  };

  const setMainLoop = () =>
    setInterval(async () => {
      if (!isSleep) {
        rate += MOVE_LENGTH;

        if (rate > orbitPath[path_index].length) {
          if (isGoal) {
            rate = 0;
            isGoal = false;
            isSleep = true;
            cubes[index].stop();

            if (++path_index >= orbitPath.length) {
              path_index = 0;
            }

            setTimeout(() => {
              isSleep = false;
            }, orbitPath[path_index].delayMs);
          } else {
            rate = orbitPath[path_index].length;
          }
        }

        movePathByRate(
          cubes[index],
          position,
          orbitPath[path_index],
          rate,
          () => {
            isGoal = true;
          }
        );
      }
    }, 50);

  const [red, green, blue] = hex2rgb(orbit.color);
  const orbitPath: PathData[] = orbit.paths.map((item) => {
    const path = new svgPathProperties(item.path);
    return {
      path,
      length: path.getTotalLength(),
      rate: path.getTotalLength() / MOVE_LENGTH,
      back: item.back,
      invert: item.invert,
      delayMs: item.delayMs,
    } as PathData;
  });

  cubes = (await scanner.start().catch(() => console.log('error'))) as Cube[];

  if (!cubes || cubes.length < 1) {
    console.log('cubes connot find!');
    return null;
  }

  const result = await cubes[index].connect();

  if (!result) {
    console.log('cube connot connect!');
    return null;
  }

  console.log('connected!');
  cubes[index].on('id:position-id', handlePosition);
  cubes[index].on('battery:battery', handleBattery);
  cubes[index].turnOnLight({ red, green, blue, durationMs: 0 });

  return {
    stop: () => clearInterval(mainLoopRef),
    start: () => {
      mainLoopRef = setMainLoop();
    },
    disconnect: async () => {
      await cubes[index].disconnect();
    },
    id,
  };
}

export default toio;
