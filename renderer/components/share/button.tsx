import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';

interface Props {
  onClick?: () => void;
  className?: string;
}

const Button: React.FC<Props> = (props) => {
  const { onClick, className, children } = props;

  return (
    <>
      <ActiveButton className={className} onClick={onClick}>
        {children}
      </ActiveButton>
    </>
  );
};

const ActiveButton = styled.button`
  ${tw`px-2 py-1 border border-solid border-black rounded-md`}
`;
export default Button;
