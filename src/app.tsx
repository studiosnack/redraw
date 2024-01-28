import { Provider } from "react-redux";
import styled from "@emotion/styled";
import { css, cx } from "@emotion/css";

import type { BaseStoreType } from "./reducer";

import { useAppSelector } from "./hooks";
import { CategorySidebar } from "./components/CategorySidebar";
import { CategoryView } from "./components/CategoryView";

const AppShell = styled.div`
  display: flex;
  height: 100%;
`;
const SidebarContainer = styled.div`
  width: 200px;
  padding: 1em;
  margin-top: 1em;
  -webkit-user-select: none;
`;
const MainContentContainer = styled.div`
  -webkit-app-region: drag;
  background: white;
  display: flex;
  justify-self: stretch;
  flex: 1;
`;

export const App = ({ reduxStore }: { reduxStore: BaseStoreType }) => {
  return (
    <Provider store={reduxStore}>
      <Application />
    </Provider>
  );
};

const Application = () => {
  return (
    <AppShell>
      <SidebarContainer>
        <CategorySidebar />
      </SidebarContainer>
      <MainContentContainer>
        <CategoryView />
      </MainContentContainer>
    </AppShell>
  );
};
