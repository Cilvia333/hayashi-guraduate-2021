import React, { useState, useEffect } from 'react';
import { useEffectOnce } from 'react-use';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';

import Path from './path';

const Map: React.FC = () => {
  const [orbits, setOrbits] = useState<OrbitData[]>([]);
  const [activeMaps, setActiveMaps] = useState<boolean[]>([]);

  const init = async () => {
    const data = await window.api.GetAllOrbits();
    if (data) {
      setOrbits(data);

      setActiveMaps(new Array<boolean>(data.length).fill(true));
    }
  };

  const handleUpdateStore = (newOrbits: OrbitData[]) => {
    setOrbits(newOrbits);
  };

  const handleUpdateConfig = () => {
    init();
  };

  const handleSelectCheck = () => {};

  useEffectOnce(() => {
    init();
    window.api.UpdateConfig(handleUpdateConfig);
    window.api.StoreUpdate(handleUpdateStore);
  });

  return (
    <>
      <Container>
        <PathInnerWrapper>
          <SvgContainer>
            <StyledSvg
              color="#444444"
              fill="transparent"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2525.67 2381.1"
            >
              <rect width="841.89" height="1190.55" />
              <rect y="1190.55" width="841.89" height="1190.55" />
              <rect x="841.89" width="841.89" height="1190.55" />
              <rect x="841.89" y="1190.55" width="841.89" height="1190.55" />
              <rect x="1683.78" width="841.89" height="1190.55" />
              <rect x="1683.78" y="1190.55" width="841.89" height="1190.55" />
            </StyledSvg>
          </SvgContainer>
          {orbits
            ? orbits.map((orbit, index) => {
                return activeMaps && activeMaps[index] ? (
                  <Path id={index} orbit={orbit} key={`path_${index}`} />
                ) : (
                  ''
                );
              })
            : ''}
        </PathInnerWrapper>
        <SelectContainer>
          <SelectTitle>表示設定</SelectTitle>
          {orbits.map((orbit, index) => (
            <SelectItem key={`select_${index}`}>
              <SelectItemTitle color={orbit.color}>
                {`${index}: ${orbit.name}`}
              </SelectItemTitle>
              <SelectInput
                type="checkbox"
                checked={activeMaps[index]}
                onChange={(e) => {
                  const newArray = [...activeMaps];
                  newArray[index] = e.target.checked;
                  setActiveMaps(newArray);
                }}
              />
            </SelectItem>
          ))}
        </SelectContainer>
      </Container>
    </>
  );
};

const SvgContainer = styled.div`
  ${tw`absolute inset-0 m-auto h-full w-full`}
`;

const StyledSvg = styled.svg<{ color: string }>`
  ${tw`stroke-current`}

  stroke-width: 1px;

  ${({ color }) => css`
    color: ${color};
  `}
`;

const Container = styled.div`
  ${tw`relative w-3/4 h-screen flex items-center justify-center`}
  max-height: 100vh;
`;

const PathInnerWrapper = styled.div`
  ${tw`relative w-3/4 border border-lightGray border-solid`}

  &::before {
    content: '';
    display: block;
    padding-top: 94.5%;
  }
`;

const SelectContainer = styled.section`
  ${tw`absolute w-40 right-0 bottom-0 mb-10 mr-10 bg-white border border-lightGray border-solid  p-4`}
`;

const SelectTitle = styled.h2`
  ${tw`m-0 mb-4 font-bold font-header text-base`}
`;

const SelectItem = styled.div`
  ${tw`flex justify-between items-center mb-2`}
`;

const SelectInput = styled.input``;
const SelectItemTitle = styled.h3<{ color: string }>`
  ${tw`m-0 text-sm`}

  ${({ color }) => css`
    color: ${color};
  `}
`;
export default Map;
