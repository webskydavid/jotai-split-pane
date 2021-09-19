import { FC } from "react";

import classes from "./Box.module.css";

const Box: FC = ({ children }) => {
  return <div className={classes.root}>{children}</div>;
};

export default Box;
