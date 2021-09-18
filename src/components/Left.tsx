import { atom, useAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import React, { useEffect, useRef, useState } from "react";

import "./../styles.css";

const configAtom = atom({
  dragging: false,
  moved: 0,
  one: 0,
  two: 0,
  three: 0,
  splitOne: 0,
  splitTwo: 0
});
const draggingAtom = selectAtom(configAtom, (config) => config.dragging);
const dividerOneAtom = atom(0);
const oneAtom = atom(200);
const twoAtom = atom(200);

const Left = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useAtom(draggingAtom);
  const [dividerOne, setDividerOne] = useAtom(dividerOneAtom);
  const [one, setOne] = useAtom(oneAtom);
  const [two, setTwo] = useAtom(twoAtom);

  const onMove = (clientY) => {
    console.log("onMove", dragging);

    if (dragging && ref.current) {
      const moved = clientY - dividerOne;
      const newMove = one + moved;
      console.log(one);
      if (newMove < 40) {
        setOne(40);
        return;
      }

      setOne(moved + one);
      setTwo(two - moved);
      // setSize((s) => ({
      //   ...s,
      //   y: moved,
      //   one: moved + size.one,
      //   two: size.two - moved
      // }));
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    setDividerOne(e.clientY);
    setDragging(true);
  };

  const handleMouseUp = (e: MouseEvent) => {
    console.log(dragging, dividerOne, one, two);

    setDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    onMove(e.clientY);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    <div ref={ref} className="App">
      <div style={{ height: one }} className="one">
        1
      </div>
      <div
        style={{ top: one }}
        onMouseDown={handleMouseDown}
        className={dragging ? "divider-dragging" : "divider"}
      ></div>
      <div style={{ height: two }} className="two">
        2
      </div>

      <div style={{ height: 200 }} className="three">
        3
      </div>
    </div>
  );
};

export default Left;
