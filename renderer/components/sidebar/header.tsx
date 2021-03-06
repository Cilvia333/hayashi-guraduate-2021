import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';

const SideHeader: React.FC = () => {
  return (
    <>
      <Container>
        <Title>Marshmallow Mobiles Controller</Title>
        <Version>ver0.9.0</Version>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${tw`w-full border-0 border-b border-solid border-black text-left relative px-4 py-4`}
`;

const Title = styled.h1`
  ${tw`text-xl font-bold font-header w-full relative m-0`}
`;

const Version = styled.h3`
  ${tw`text-base font-header m-0 mt-2`}
`;

export default SideHeader;
