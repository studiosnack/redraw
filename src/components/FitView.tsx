import * as React from "react";

import styled from "@emotion/styled";

const TitleBar = styled.div`
  -webkit-app-region: drag;
  background: var(--light-theme-titlebar-color);

  @media (prefers-color-scheme: dark) {
    background: var(--dark-theme-titlebar-color);
  }
`;
const CategoryHeader = styled.h3`
  font-weight: bold;
  font-size: 14px;
  margin-left: 1em;
`;
const CategoryBody = styled.div`
  background: var(--light-theme-body-color);
  flex: 1;

  @media (prefers-color-scheme: dark) {
    background: var(--dark-theme-body-color);
  }
`;

export function FitView() {
  return (
    <React.Fragment>
      <TitleBar>
        <CategoryHeader>&nbsp;</CategoryHeader>
      </TitleBar>
      <CategoryBody></CategoryBody>
    </React.Fragment>
  );
}
