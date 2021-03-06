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

  useEffectOnce(() => {
    init();
  });

  return (
    <>
      <Container>
        {orbits
          ? orbits.map((_, index) => <Path id={index} key={`path_${index}`} />)
          : ''}
      </Container>
    </>
  );
};

const Container = styled.div`
  ${tw`relative w-3/4`}
`;
export default Map;
