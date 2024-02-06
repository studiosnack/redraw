import styled from "@emotion/styled";
import { css, cx } from "@emotion/css";

export const HStack = styled.div`
  display: flex;
  flex-flow: row;
  flex: 1;
`;
export const VStack = styled.div`
  display: flex;
  flex-flow: column;
  flex: 1;
`;

export const alignCenter = css`
  align-items: center;
`;

export const TitleBar = styled.div`
  -webkit-app-region: drag;
  background: var(--light-theme-titlebar-color);

  @media (prefers-color-scheme: dark) {
    background: var(--dark-theme-titlebar-color);
  }
`;
export const WindowHeader = styled.h3`
  font-weight: bold;
  font-size: 14px;
  margin-left: 1em;
`;

export const WindowBody = styled.div`
  background: var(--light-theme-body-color);
  display: flex;
  flex: 1;

  @media (prefers-color-scheme: dark) {
    background: var(--dark-theme-body-color);
  }
`;
