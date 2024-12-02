import S from "./App.module.css";
import { ComponentType, Suspense, lazy } from "react";

import { List, theme, ConfigProvider, Typography } from "antd";
import { Router, Route, Switch, Link } from "wouter";

interface Example {
  path: string;
  name: string;
  Component: ComponentType;
}
const examples: Example[] = [
  {
    path: "stream",
    name: "Stream",
    Component: lazy(() => import("@/pages/stream")),
  },
];

interface AppProps {
  ssrPath?: string;
}

function Index() {
  return (
    <div className={S.index}>
      <Typography>
        <Typography.Title>React concurrency examples</Typography.Title>
        <Typography.Paragraph>Choose the example:</Typography.Paragraph>
      </Typography>
      <List
        className={S.list}
        bordered
        dataSource={examples}
        renderItem={({ path, name }) => (
          <List.Item key={path}>
            <List.Item.Meta title={<Link to={path}>{name}</Link>} />
          </List.Item>
        )}
      />
    </div>
  );
}

function App({ ssrPath }: AppProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <Router ssrPath={ssrPath}>
        <Switch>
          {examples.map(({ path, Component }) => (
            <Route key={path} path={path}>
              <Suspense fallback="...">
                <Component />
              </Suspense>
            </Route>
          ))}
          <Route path="/">
            <Index />
          </Route>
        </Switch>
      </Router>
    </ConfigProvider>
  );
}

export default App;
