import React, { useState, useEffect } from 'react';
import { useEffectOnce, useToggle } from 'react-use';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';

import Header from './header';
import Info from './info';

import Button from '~/components/share/button';

const Sidebar: React.FC = () => {
  const [orbits, setOrbits] = useState<OrbitData[]>(null);
  const [allStart, setAllStart] = useState<boolean>(false);
  const [units, setUnits] = useState(1);
  const [activeUnits, setActiveUnits] = useToggle(true);

  const init = async () => {
    const orbits = await window.api.GetAllOrbits();
    const units = await window.api.GetUnits();

    if (orbits) {
      setOrbits(orbits);
    }

    if (units) {
      setUnits(units);
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

  const handleDeleteOrbit = () => {
    init();
  };

  const handleUpdateConfig = () => {
    init();
  };
  const handleDisableUnits = () => {
    setActiveUnits(false);
  };

  const handleUpdateUnits = (num: number) => {
    if (!num) {
      return;
    }

    if (orbits.length < num || num < 0) {
      return;
    }

    window.api.UpdateUnits(num);
    setUnits(num);
  };

  useEffectOnce(() => {
    init();
    window.api.UpdateConfig(handleUpdateConfig);
    window.api.DisableUnits(handleDisableUnits);
  });

  return (
    <>
      <Container>
        <Header />
        <ConfigContainer>
          <ConfigHeading>設定</ConfigHeading>
          <ConfigItem>
            <ConfigTitle>制御台数</ConfigTitle>
            <ConfigUnits
              type="number"
              value={units}
              name="units"
              disabled={!activeUnits}
              onChange={(e) => {
                handleUpdateUnits(parseInt(e.target.value));
              }}
            />
          </ConfigItem>
          <ConfigItem>
            <ConfigTitle>一括制御</ConfigTitle>
            <ConfigButton
              onClick={() => {
                setAllStart(true);
              }}
            >
              全て動かす
            </ConfigButton>
            <ConfigButton
              onClick={() => {
                setAllStart(false);
              }}
            >
              全て止める
            </ConfigButton>
          </ConfigItem>
          <ConfigItem>
            <ConfigTitle>設定ファイル</ConfigTitle>
            <ConfigButton
              onClick={() => {
                window.api.ExportConfig();
              }}
            >
              Export
            </ConfigButton>
            <ConfigButton
              onClick={() => {
                window.api.ImportConfig();
              }}
            >
              Import
            </ConfigButton>
          </ConfigItem>
        </ConfigContainer>
        <List>
          {orbits
            ? orbits.map((orbit, index) => (
                <Info
                  id={index}
                  key={`orbit_${index}`}
                  allStart={allStart}
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
  ${tw`w-1/4 border-0 border-r border-solid border-black relative `}

  height: 100vh;
  max-height: 100vh;
  overflow-y: scroll;
`;

const List = styled.section`
  ${tw`px-6 relative overflow-y-scroll mb-12`}
`;

const ConfigHeading = styled.div`
  ${tw`font-header font-bold text-xl`}
`;

const ConfigItem = styled.div`
  ${tw`mb-4`}

  &:nth-child(2) {
    ${tw`mt-4`}
  }
`;

const ConfigTitle = styled.div`
  ${tw`font-header font-bold text-base`}
`;

const ConfigContainer = styled.section`
  ${tw`w-full border-0 border-b border-solid border-black px-4 py-4`}
`;

const ConfigButton = styled(Button)`
  ${tw`mr-2 mt-2`}
`;

const ConfigUnits = styled.input`
  ${tw`text-base font-text border m-0 w-24 text-right pr-2`}
`;

export default Sidebar;
