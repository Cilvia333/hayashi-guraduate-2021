import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';

import Sidebar from '~/components/sidebar/sidebar';

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Marshmallow Mobiles Controller</title>
      </Head>
      <Container>
        <Sidebar />
      </Container>
    </>
  );
};

const Container = styled.div`
  ${tw`w-screen relative flex`}

  * {
    box-sizing: border-box;
  }
`;

export default Home;
