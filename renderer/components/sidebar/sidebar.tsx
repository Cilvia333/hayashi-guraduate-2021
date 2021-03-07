import React, { useState, useEffect } from 'react';
import { useEffectOnce } from 'react-use';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';

import Header from './header';
import Info from './info';

import Button from '~/components/share/button';

const Sidebar: React.FC = () => {
  const [orbits, setOrbits] = useState<OrbitData[]>(null);

  const init = async () => {
    const orbits = await window.api.GetAllOrbits();
    if (orbits) {
      console.log(orbits);
      setOrbits(orbits);
    }
  };

  const handleAddClick = async () => {
    const orbitData = await window.api.CreateOrbit();
    if (orbits) {
      setOrbits([...orbits, orbitData.orbit]);
    } else {
      setOrbits([orbitData.orbit]);
    }
  };

  const handleDeleteOrbit = (id: number) => {
    init();
  };

  useEffectOnce(() => {
    init();
  });

  return (
    <>
      <Container>
        <Header />
        <List>
          {orbits
            ? orbits.map((orbit, index) => (
                <Info
                  id={index}
                  key={`orbit_${index}`}
                  onDelete={handleDeleteOrbit}
                />
              ))
            : ''}
          <Button
            onClick={() => {
              handleAddClick();
            }}
          >
            toioを追加する
          </Button>
        </List>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${tw`w-1/4 h-screen border-0 border-r border-solid border-black relative `}

  max-height: 100vh;
`;

const List = styled.section`
  ${tw`px-4 relative overflow-y-scroll`}
`;

export default Sidebar;
