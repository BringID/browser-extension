import styled from 'styled-components';

export const LogoWrapper = styled.div`
  width: 58px;
  min-height: 58px;
  border: 1px solid ${(props) => props.theme.secondaryBorderColor};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

export const Image = styled.img`
  min-width: 25px;
  max-width: 25px;
  height: 25px;
  display: block;
  object-fit: cover;
  object-position: center;
`;
