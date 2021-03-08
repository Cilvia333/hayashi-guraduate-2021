import { fromEvent } from 'file-selector';
import React, { useState, useEffect } from 'react';
import { useToggle, useEffectOnce } from 'react-use';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';

import Button from '~/components/share/button';

interface Props {
  id: number;
  allStart: boolean;
  onDelete: (id: number) => void;
}

type Indicator = 'full' | 'middle' | 'low';

const Info: React.FC<Props> = (props) => {
  const { id, allStart, onDelete } = props;

  const [active, toggleActive] = useToggle(false);
  const [run, toggleRun] = useToggle(false);
  const [battery, setBattery] = useState(100);
  const [name, setName] = useState('Taro');
  const [color, setColor] = useState('#ff0000');
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0, angle: 0 });
  const [orbit, setOrbit] = useState<OrbitData>();
  const [paths, setPaths] = useState<OrbitPath[]>([
    {
      path:
        'M1659.13,1590.51l135.25,133.71s154.55,243.73-18.55,348.68h0c-225.52,130.72-621.41-172.57-596.37-506.95-6.42-74-36.32-142.82-97-195',
      back: false,
      invert: true,
      delayMs: 1000,
    },
  ]);

  const [startOpen, toggleStartOpen] = useToggle(false);
  const [pathsOpen, togglePathsOpen] = useToggle(false);

  const init = async () => {
    const data = await window.api.GetOrbitById(id);
    if (data) {
      setOrbit(data);
      setColor(data.color);
      setName(data.name);
      setStartPos(data.startPos);
      setPaths(data.paths);
    }

    window.api.ToioBatteryUpdate((data) => {
      if (data.id === id) {
        setBattery(data.value);
      }
    });
  };

  const handleUpdateConfig = () => {
    init();
  };

  useEffectOnce(() => {
    init();
    window.api.UpdateConfig(handleUpdateConfig);
  });

  useEffect(() => {
    handleRun(id, allStart);
  }, [allStart]);

  const handleColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    window.api.UpdateColor(id, event.target.value);
    setColor(event.target.value);
  };

  const handleStartPos = (value: Position) => {
    window.api.UpdateStartPosition(id, value);
    setStartPos(value);
  };

  const handlePaths = (index: number, path: OrbitPath) => {
    const newPaths = paths.filter((_, i) => i !== index);
    newPaths.splice(index, 0, path);

    window.api.UpdatePaths(id, newPaths);
    setPaths(newPaths);
  };

  const handleAddPathClick = async () => {
    const pathData = await window.api.AddPath(id);
    if (pathData) {
      setPaths(pathData);
    }
  };

  const handleActive = async (id: number) => {
    if (!active) {
      console.log('connect');
      await window.api.ToioConnect(id);
      toggleActive(true);
      return;
    }

    if (active) {
      console.log('disconnect');
      await window.api.ToioDisconnect(id);
      toggleActive(false);
      return;
    }
  };

  const handleRun = async (id: number, status: boolean = run) => {
    if (!status) {
      console.log('connect');
      await window.api.ToioStart(id);
      toggleRun(true);
      return;
    }

    if (status) {
      console.log('disconnect');
      await window.api.ToioStop(id);
      toggleRun(false);
      return;
    }
  };

  const handleDeletePath = async (index: number) => {
    const result = await window.api.DeletePath(id, index);
    if (!result) {
      return;
    }
    const newPaths = paths.filter((_, i) => i !== index);
    setPaths(newPaths);
  };

  const handleSvgFile = async (event: any, index: number) => {
    const files: any = await fromEvent(event);
    if (!files || files.length < 1) {
      return;
    }

    const result = await window.api.ChangePath(id, index, files[0].path);

    if (!result) {
      return;
    }

    const currenPath = paths.filter((_, i) => i === index)[0];
    const newPaths = paths.filter((_, i) => i !== index);
    newPaths.splice(index, 0, { ...currenPath, path: result });

    setPaths(newPaths);
  };

  const handleDeleteOrbit = async () => {
    await window.api.DeleteOrbit(id);
    onDelete(id);
    return;
  };

  return (
    <>
      <Container>
        <Header>
          <Indicator battery={active ? battery : -1} />
          <Name>
            <NameInput value={name} type="text" />
            {`: ${id}`}
          </Name>
          {active ? (
            <Button
              onClick={() => {
                handleRun(id);
              }}
            >
              {run ? 'stop' : 'start'}
            </Button>
          ) : (
            ''
          )}
          <Button
            onClick={() => {
              handleActive(id);
            }}
          >
            {active ? 'disconnect' : 'connect'}
          </Button>
        </Header>
        <Body>
          <ItemWrapper>
            <SingleItem>
              <ItemTitle>色 :</ItemTitle>
              <ItemValue
                value={color}
                type="color"
                name="color"
                onChange={handleColor}
              />
            </SingleItem>
          </ItemWrapper>
          <ItemWrapper>
            <MultiItemTitle open={startOpen} onClick={toggleStartOpen}>
              スタート位置 :
            </MultiItemTitle>
            <MultiItems open={startOpen}>
              <Item>
                <ItemTitle>x :</ItemTitle>
                <ItemValue
                  value={startPos.x}
                  type="text"
                  name="x"
                  onChange={(e) =>
                    handleStartPos({ ...startPos, x: parseInt(e.target.value) })
                  }
                />
              </Item>
              <Item>
                <ItemTitle>y :</ItemTitle>
                <ItemValue
                  value={startPos.y}
                  type="text"
                  name="y"
                  onChange={(e) =>
                    handleStartPos({ ...startPos, y: parseInt(e.target.value) })
                  }
                />
              </Item>
              <Item>
                <ItemTitle>角度 :</ItemTitle>
                <ItemValue
                  value={startPos.angle}
                  type="text"
                  name="angle"
                  onChange={(e) =>
                    handleStartPos({
                      ...startPos,
                      angle: parseInt(e.target.value),
                    })
                  }
                />
              </Item>
            </MultiItems>
          </ItemWrapper>
          <ItemWrapper>
            <MultiItemTitle open={pathsOpen} onClick={togglePathsOpen}>
              パス一覧 :
            </MultiItemTitle>
            <MultiItems open={pathsOpen}>
              {paths.map((item, index) => (
                <ItemWrapper key={`paths_${index}`}>
                  <MultiItemTitle2>
                    {`path[${index}]:`}
                    <DeleteButton
                      onClick={() => {
                        handleDeletePath(index);
                      }}
                    >
                      削除
                    </DeleteButton>
                  </MultiItemTitle2>
                  <MultiItems open={true}>
                    <Item>
                      <ItemTitle>パス:</ItemTitle>
                    </Item>
                    <UpdatePathWrapper>
                      <ItemValue
                        value={item.path}
                        type="text"
                        name="path"
                        onChange={(e) =>
                          handlePaths(index, { ...item, path: e.target.value })
                        }
                      />
                      <UpdatePathArea
                        type="file"
                        onChange={(e: any) => {
                          handleSvgFile(e, index);
                        }}
                        accept=".svg"
                      />
                    </UpdatePathWrapper>
                    <Item>
                      <ItemTitle>バック走行:</ItemTitle>
                      <ItemValue
                        checked={item.back}
                        value={undefined}
                        type="checkbox"
                        name="back"
                        onChange={(e) =>
                          handlePaths(index, {
                            ...item,
                            back: e.target.checked,
                          })
                        }
                      />
                    </Item>
                    <Item>
                      <ItemTitle>パス向き反転:</ItemTitle>
                      <ItemValue
                        checked={item.invert}
                        type="checkbox"
                        name="invert"
                        onChange={(e) =>
                          handlePaths(index, {
                            ...item,
                            invert: e.target.checked,
                          })
                        }
                      />
                    </Item>
                    <Item>
                      <ItemTitle>遅れ時間[ms]:</ItemTitle>
                      <ItemValue
                        value={item.delayMs}
                        type="number"
                        name="delayMs"
                        onChange={(e) =>
                          handlePaths(index, {
                            ...item,
                            delayMs: parseInt(e.target.value),
                          })
                        }
                      />
                    </Item>
                  </MultiItems>
                </ItemWrapper>
              ))}
              <ActiveButton
                onClick={() => {
                  handleAddPathClick();
                }}
              >
                pathを追加
              </ActiveButton>
            </MultiItems>
            <ActiveButton
              onClick={() => {
                handleDeleteOrbit();
              }}
            >
              toioを削除
            </ActiveButton>
          </ItemWrapper>
        </Body>
      </Container>
    </>
  );
};

const Container = styled.section`
  ${tw`py-4`}
`;

const Header = styled.header`
  ${tw`flex justify-start items-center border-0 border-b border-solid border-black pb-2`}
`;

const Indicator = styled.div<{ battery: number }>`
  ${tw`w-3 h-3 rounded-circle`}

  ${({ battery }) => {
    if (battery > 75) {
      return css`
        ${tw`bg-green-500`}
      `;
    } else if (battery > 35) {
      return css`
        ${tw`bg-yellow-500`}
      `;
    } else if (battery > 0) {
      return css`
        ${tw`bg-red-500`}
      `;
    } else {
      return css`
        ${tw`bg-black`}
      `;
    }
  }}
`;

const Name = styled.h2`
  ${tw`text-base font-header text-left mx-2 my-0 flex justify-start items-center`}
`;

const NameInput = styled.input`
  ${tw`text-base font-header font-bold outline-none border-0 border-solid border-blue-500 focus:border-2 w-20 mr-2`}
`;

const Body = styled.article`
  ${tw`pl-5 mb-6`}
`;

const ItemTitle = styled.h3`
  ${tw`text-base font-text font-bold m-0 whitespace-nowrap mt-2 flex justify-between items-center `}
`;

const MultiItemTitle2 = styled(ItemTitle)`
  ${tw`mt-4`}
`;

const MultiItemTitle = styled.h3<{ open: boolean }>`
  ${tw`text-base font-text font-bold relative m-0 mt-2 flex justify-between items-center`}

  &::before {
    ${tw`absolute -left-4 top-1 text-xs`}
    content: '▶︎';
  }

  ${({ open }) =>
    open &&
    css`
      &::before {
        content: '▼';
      }
    `}
`;

const ItemValue = styled.input`
  ${tw`text-base font-text border ml-2`}

  &[type='text'] {
    ${tw`border rounded-none focus:border-blue-500 focus:border-2 focus:outline-none w-full`}
    -webkit-appearance: none;
  }

  &[type='number'] {
    ${tw`w-24 text-right px-2`}

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
      -moz-appearance: textfield;
    }
  }
`;

const ItemWrapper = styled.div``;

const SingleItem = styled.div`
  ${tw`flex justify-start items-center mt-2`}
`;

const MultiItems = styled.ul<{ open: boolean }>`
  ${tw`pl-4 hidden m-0 mt-2`}

  ${({ open }) =>
    open &&
    css`
      ${tw`block`}
    `}
`;

const Item = styled.li`
  ${tw`flex justify-between items-center mt-2 `}
`;

const ActiveButton = styled(Button)`
  ${tw`mt-4`}
`;

const DeleteButton = styled(Button)`
  ${tw`text-sm`}
`;

const UpdateButton = styled(Button)`
  ${tw`text-sm mt-2`}
`;

const UpdatePathWrapper = styled.div`
  ${tw`justify-end items-center mt-1 text-right`}
`;

const UpdatePathArea = styled.input`
  ${tw`text-white text-base px-2 py-1 bg-gray border border-solid border-black text-right w-full mt-2`}
`;

export default Info;
