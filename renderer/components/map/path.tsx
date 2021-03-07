import React, { useState, useEffect } from 'react';
import { useEffectOnce, useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';

interface Props {
  id: number;
  orbit: OrbitData;
}

const Path: React.FC<Props> = (props) => {
  const { id, orbit } = props;

  const [position, setPosition] = useState<Position>({ x: 0, y: 0, angle: 0 });
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
        setPosition(data.value);
      }
    });
  };

  useEffectOnce(() => {
    init();
  });

  useEffect(() => {}, [position]);

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
        <Marker position={calcPosition} color={orbit.color} />
      </Container>
    </>
  );
};

const Container = styled.div`
  ${tw`absolute inset-0 m-auto h-full w-full`}
`;

const Marker = styled.div<{ position: Position; color: string }>`
  ${tw`absolute top-0 left-0 m-0 w-12 h-12`}

  ${({ color }) => css`
    color: ${color};
  `}

  ${({ position }) => css`
    transform: translate(${position.x}px, ${position.y}px)
      rotate(${position.angle}deg);
  `}
`;

const StyledSvg = styled.svg<{ color: string }>`
  ${tw`stroke-current stroke-2`}

  ${({ color }) => css`
    color: ${color};
  `}
`;
export default Path;
