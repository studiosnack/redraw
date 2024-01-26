import { Provider } from "react-redux";
import styled from "@emotion/styled";
import { css, cx } from "@emotion/css";

import type { BaseStoreType } from "./reducer";

import { selectResolvedCategoryList } from "./slices/categories";
import { useAppSelector } from "./hooks";
import { Sidebar } from "./components/Sidebar";

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
  const categoryData = useAppSelector(selectResolvedCategoryList);

  return (
    <AppShell>
      <SidebarContainer>
        <Sidebar
          sections={[
            {
              title: "Categories",
              items: categoryData,
            },
          ]}
        />
      </SidebarContainer>
      <MainContentContainer />
    </AppShell>
  );
};
