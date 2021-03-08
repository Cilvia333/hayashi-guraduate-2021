import React, { useState, useEffect } from 'react';
import { useEffectOnce } from 'react-use';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';

import Path from './path';

const Map: React.FC = () => {
  const [orbits, setOrbits] = useState<OrbitData[]>();

  const init = async () => {
    const data = await window.api.GetAllOrbits();
    if (data) {
      setOrbits(data);
    }
  };

  const handleUpdateStore = (newOrbits: OrbitData[]) => {
    setOrbits(newOrbits);
  };

  const handleUpdateConfig = () => {
    init();
  };

  useEffectOnce(() => {
    init();
    window.api.UpdateConfig(handleUpdateConfig);
    window.api.StoreUpdate(handleUpdateStore);
  });

  return (
    <>
      <Container>
        <PathInnerWrapper>
          {orbits
            ? orbits.map((orbit, index) => (
                <Path id={index} orbit={orbit} key={`path_${index}`} />
              ))
            : ''}
        </PathInnerWrapper>
      </Container>
    </>
  );
};

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
export default Map;
