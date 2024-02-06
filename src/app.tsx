import { Provider } from "react-redux";
import styled from "@emotion/styled";
import { css, cx } from "@emotion/css";

import type { BaseStoreType } from "./reducer";

import { useAppSelector } from "./hooks";
import { CategorySidebar } from "./components/CategorySidebar";
import { CategoryView } from "./components/CategoryView";
import { FitSidebar } from "./components/FitSidebar";
import { FitView } from "./components/FitView";

const AppShell = styled.div`
  display: flex;
  height: 100%;
`;
const SidebarContainer = styled.div`
  width: 200px;
  padding: 0em 0.75em 1em 1em;
  margin-top: 1.5em;
  -webkit-user-select: none;
  overflow: scroll;
`;
const MainContentContainer = styled.div`
  background: white;
  display: flex;
  flex: 1;
  flex-flow: column;
  justify-self: stretch;
  padding: 0;
  box-shadow: -1px 0 2px #ccc;

  @media (prefers-color-scheme: dark) {
    background: #444;
    box-shadow: -1px 0 2px #222;
  }
`;

export const App = ({ reduxStore }: { reduxStore: BaseStoreType }) => {
  return (
    <Provider store={reduxStore}>
      <Application />
    </Provider>
  );
};

const Application = () => {
  const appMode = useAppSelector((state) => state.application.currentView);

  return (
    <AppShell>
      <SidebarContainer>
        <CategorySidebar />
        <FitSidebar />
      </SidebarContainer>
      <MainContentContainer>
        {appMode === "category" && <CategoryView />}
        {appMode === "fit" && <FitView />}
      </MainContentContainer>
    </AppShell>
  );
};
