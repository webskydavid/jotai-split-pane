import { FC } from "react";
import { Direction } from "../Group/Group";

import classes from "./Divider.module.css";

const Divider: FC<any> = ({
  children,
  setRef,
  onMouseDown,
  onFold,
  drag,
  direction,
}) => {
  return (
    <>
      {direction === Direction.Column ? (
        <div ref={setRef} className={classes.root}>
          <div className={classes.fold} onClick={onFold}>
            Fold
          </div>
          <div className={classes.title}>{children}</div>
          {drag ? (
            <div className={classes.drag} onMouseDown={onMouseDown}>
              Drag
            </div>
          ) : (
            <div className={classes.emptyDrag}></div>
          )}
        </div>
      ) : (
        <div
          ref={setRef}
          onMouseDown={onMouseDown}
          className={classes.rootVertical}
        ></div>
      )}
    </>
  );
};

export default Divider;
