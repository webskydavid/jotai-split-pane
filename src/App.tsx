import React from "react";
import Box from "./components/Box/Box";
import Group, { Direction } from "./components/Group/Group";
import Left from "./components/Left";
import "./styles.css";

const App = () => {
  const list = (length: number) => {
    return Array(length)
      .fill("Item")
      .map((i, key) => (
        <div key={key}>
          {i} {key}
        </div>
      ));
  };
  return (
    <>
      <Group direction={Direction.Row} scope="1">
        <Box>
          <Group direction={Direction.Column} scope="2">
            <Box>{list(60)}</Box>
            <Box>{list(60)}</Box>
            <Box>{list(60)}</Box>
            <Box>{list(60)}</Box>
          </Group>
        </Box>
        <Box>
          <Group direction={Direction.Column} scope="3">
            <Box>{list(60)}</Box>
            <Box>{list(60)}</Box>
          </Group>
        </Box>
      </Group>

      {/* <Left /> */}
    </>
  );
};

export default App;
