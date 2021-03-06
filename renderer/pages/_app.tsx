import { AppProps } from 'next/app';
import React from 'react';
import { createGlobalStyle } from 'styled-components';
import tw from 'twin.macro';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    position: relative;
    box-sizing: border-box;

    * {
    box-sizing: border-box;
    }

    ${tw`font-text`}
  }

  h1 {
    ${tw`font-header text-3xl font-semibold`}
  }

  button{
    background-color: transparent;
    border: none;
    cursor: pointer;
    outline: none;
    padding: 0;
    appearance: none;
    user-select: none;
  }

  input[type="number"] {
    appearance: none;
    --webkit-appearance: none;
    outline: none;
    padding: 0;
    background-color: transparent;
  }

  li {
    ${tw`list-none`}
  }

  a {
    ${tw`font-text text-black visited:text-black`}
    text-decoration: none;
  }
`;

export type Props = AppProps;
const App: React.FC<Props> = ({ Component, pageProps }) => {
  return (
    <>
      <GlobalStyle />
      <Component {...pageProps} />
    </>
  );
};

export default App;
