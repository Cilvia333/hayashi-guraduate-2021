import React, { useState, useEffect } from 'react';
import { useEffectOnce, useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';

import VectorSvg from '~/assets/vector.svg';

const X_OFFSET = 34;
const Y_OFFSET = 35;
const X_MAX = 644;
const Y_MAX = 682;
const X_LENGTH = X_MAX - X_OFFSET;
const Y_LENGTH = Y_MAX - Y_OFFSET;
interface Props {
  id: number;
  orbit: OrbitData;
}

const Path: React.FC<Props> = (props) => {
  const { id, orbit } = props;

  const [position, setPosition] = useState<Position>({
    x: 0,
    y: 0,
    angle: 0,
  });
  const [calcPosition, setCalcPosition] = useState<Position>({
    x: 0,
    y: 0,
    angle: 0,
  });
  const [
    rectRef,
    { x, y, width, height, top, right, bottom, left },
  ] = useMeasure();

  const init = async () => {
    window.api.ToioPositionUpdate((data) => {
      if (data.id === id) {
        setPosition(data.position);
      }
    });
  };

  useEffectOnce(() => {
    init();

    setCalcPosition({
      x: (width / Y_LENGTH) * (position.y - Y_OFFSET),
      y: (height / X_LENGTH) * (X_MAX - position.x - X_OFFSET),
      angle: position.angle,
    });
  });

  useEffect(() => {
    if (!position) {
      return;
    }

    setCalcPosition({
      x: (width / Y_LENGTH) * (position.y - Y_OFFSET),
      y: (height / X_LENGTH) * (X_MAX - position.x - X_OFFSET),
      angle: position.angle,
    });
  }, [position, width, height]);

  return (
    <>
      <Container ref={rectRef}>
        <StyledSvg
          color={orbit.color}
          fill="transparent"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2525.67 2381.1"
        >
          {orbit.paths.map((path, index) => (
            <path d={path.path} key={`path_${index}`} />
          ))}
        </StyledSvg>
        <Marker position={calcPosition} color={orbit.color}>
          <StyledVector fill="transparent" color={orbit.color} />
        </Marker>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${tw`absolute inset-0 m-auto h-full w-full`}
`;

const Marker = styled.div<{ position: Position; color: string }>`
  ${tw`absolute top-0 left-0 m-0 w-12 h-12`}

  font-size: 24px;

  ${({ color }) => css`
    color: ${color};
  `}

  ${({ position }) => css`
    transform: translate(${position.x}px, ${position.y}px)
      rotate(${position.angle}deg);
  `}
`;

const StyledSvg = styled.svg<{ color: string }>`
  ${tw`stroke-current`}

  stroke-width: 4px;

  ${({ color }) => css`
    color: ${color};
  `}
`;

const StyledVector = styled(VectorSvg)<{ color: string }>`
  ${tw`stroke-current absolute inset-0 m-auto`}

  width: calc(100% - 12px);

  stroke-width: 70px;
  ${({ color }) => css`
    color: ${color};
  `}
`;
export default Path;
