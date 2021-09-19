import { atom, useAtom } from "jotai";
import {
  atomFamily,
  selectAtom,
  useAtomValue,
  useUpdateAtom,
} from "jotai/utils";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEventListener } from "../hooks/useEventListener";

import "./../styles.css";

const containerHeightAtom = atom(0);
const configAtom = atom({
  one: { minHeight: 70, height: 200, collapse: false },
  two: { minHeight: 70, height: 200, collapse: false },
  three: { minHeight: 70, height: 200, collapse: false },
  splitTwo: { dragging: false, position: 0 },
  splitThree: { dragging: false, position: 0 },
});
const oneAtom = selectAtom(configAtom, (config) => config.one);
const twoAtom = selectAtom(configAtom, (config) => config.two);
const threeAtom = selectAtom(configAtom, (config) => config.three);
const splitTwoAtom = selectAtom(configAtom, (config) => config.splitTwo);
const splitThreeAtom = selectAtom(configAtom, (config) => config.splitThree);

const Left = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useAtom(containerHeightAtom);
  const one = useAtomValue(oneAtom);
  const two = useAtomValue(twoAtom);
  const three = useAtomValue(threeAtom);
  const splitTwo = useAtomValue(splitTwoAtom);
  const splitThree = useAtomValue(splitThreeAtom);
  const setConfig = useUpdateAtom(configAtom);

  const onMove = useMemo(
    () => (clientY: number) => {
      if (ref.current) {
        if (splitTwo.dragging) {
          const moved = clientY - splitTwo.position;
          const heightOne = one.height + moved;
          const heightTwo = two.height - moved;
          const heightThree = containerHeight - two.height - one.height;

          if (heightOne < one.minHeight) {
            setConfig((p) => ({
              ...p,
              one: { ...p.one, height: p.one.minHeight },
            }));
            return;
          }

          if (heightTwo < two.minHeight) {
            setConfig((p) => ({
              ...p,
              two: { ...p.two, height: p.two.minHeight },
            }));
            return;
          }

          setConfig((p) => ({
            ...p,
            one: { ...p.one, height: heightOne },
            two: { ...p.two, height: heightTwo },
            three: { ...p.three, height: heightThree },
          }));
        }

        if (splitThree.dragging) {
          const moved = clientY - splitThree.position;
          const heightTwo = two.height + moved;
          const heightThree = three.height - moved;

          if (heightTwo < two.minHeight) {
            setConfig((p) => ({
              ...p,
              two: { ...p.two, height: two.minHeight },
            }));
            return;
          }

          if (heightThree < three.minHeight) {
            setConfig((p) => ({
              ...p,
              three: { ...p.three, height: three.minHeight },
            }));
            return;
          }

          setConfig((p) => ({
            ...p,
            one: { ...p.one },
            two: {
              ...p.two,
              height: heightTwo,
            },
            three: {
              ...p.three,
              height: heightThree,
            },
          }));
        }
      }
    },
    [splitTwo.dragging, splitThree.dragging]
  );

  const handleMouseUp = (e: MouseEvent) => {
    setConfig((p) => ({
      ...p,
      splitTwo: { ...p.splitTwo, dragging: false },
      splitThree: { ...p.splitThree, dragging: false },
    }));
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();

    onMove(e.clientY);
  };

  const handleCollapse = (e: React.MouseEvent, type: string) => {
    e.stopPropagation();
    e.preventDefault();
    switch (type) {
      case "one":
        setConfig((p) => ({
          ...p,
          one: {
            ...p.one,
            height: !one.collapse ? 0 : one.minHeight,
            collapse: !one.collapse,
          },
        }));
        break;
      case "two":
        setConfig((p) => ({
          ...p,
          two: {
            ...p.two,
            height: !two.collapse ? 0 : two.minHeight,
            collapse: !two.collapse,
          },
        }));
        break;
    }
    if (ref.current) {
      const h = ref.current.clientHeight;
      setConfig((p) => ({
        ...p,
        three: {
          ...p.three,
          height: h - p.one.height - p.two.height,
        },
      }));
    }
  };

  const handleDragDivider = (e: React.MouseEvent, drag: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (drag === "two" && !one.collapse && !two.collapse) {
      setConfig((p) => ({
        ...p,
        splitTwo: { ...p.splitTwo, dragging: true, position: e.clientY },
        splitThree: { ...p.splitThree, dragging: false },
      }));
    }
    if (drag === "three" && !two.collapse) {
      setConfig((p) => ({
        ...p,
        splitTwo: { ...p.splitTwo, dragging: false },
        splitThree: { ...p.splitThree, dragging: true, position: e.clientY },
      }));
    }
  };

  const handleResize = () => {
    if (ref.current) {
      setContainerHeight(ref.current.clientHeight);
    }
  };

  useEventListener("mousemove", handleMouseMove, [
    splitTwo.dragging,
    splitThree.dragging,
  ]);

  useEventListener("mouseup", handleMouseMove, [
    splitTwo.dragging,
    splitThree.dragging,
  ]);

  useEffect(() => {
    if (ref.current) {
      const containerH = ref.current.clientHeight;
      const height = containerHeight / 3;
      setConfig((p) => ({
        ...p,
        one: { ...p.one, height },
        two: {
          ...p.two,
          height,
        },
        three: {
          ...p.three,
          height,
        },
      }));
      setContainerHeight(containerH);
      document.addEventListener("resize", handleResize);

      return () => {
        document.removeEventListener("resize", handleResize);
      };
    }
  }, [ref.current]);

  return (
    <div ref={ref} className="App">
      <>
        {/* ONE */}
        <div style={{ top: 12 }} className="divider">
          <span onClick={(e) => handleCollapse(e, "one")}>
            {one.collapse ? <span>&#8615;</span> : <span>&#8613;</span>}
          </span>
          {`ONE p:0 h:${one.height.toFixed()}`}
          <span></span>
        </div>

        <div style={{ height: one.height }} className="one">
          <ul>
            {Array(30)
              .fill("Node")
              .map((i, index) => (
                <li key={index}>
                  {i} {index}
                </li>
              ))}
          </ul>
        </div>
        {/* ONE END */}
      </>
      <>
        {/* TWO */}
        <div
          style={{ top: one.height }}
          className={splitTwo.dragging ? "divider divider-dragging" : "divider"}
        >
          <span onClick={(e) => handleCollapse(e, "two")}>
            {two.collapse ? <span>&#8615;</span> : <span>&#8613;</span>}
          </span>
          {`TWO p:${splitTwo.position} h:${two.height.toFixed()}`}
          <span
            onMouseDown={(e) => handleDragDivider(e, "two")}
            className="drag-button"
          >
            &#61;
          </span>
        </div>

        <div style={{ height: two.height }} className="two">
          <ul>
            {Array(30)
              .fill("Node")
              .map((i, index) => (
                <li key={index}>
                  {i} {index}
                </li>
              ))}
          </ul>
        </div>
        {/* TWO END */}
      </>

      <>
        {/* THREE */}
        <div
          style={{ top: one.height + two.height }}
          className={
            splitThree.dragging ? "divider divider-dragging" : "divider"
          }
        >
          <div></div>
          {`THREE p:${splitThree.position} h:${three.height.toFixed()}`}
          <span
            onMouseDown={(e) => handleDragDivider(e, "three")}
            className="drag-button"
          >
            &#61;
          </span>
        </div>

        <div style={{ height: three.height }} className="three">
          <ul>
            {Array(30)
              .fill("Node")
              .map((i, index) => (
                <li key={index}>
                  {i} {index}
                </li>
              ))}
          </ul>
        </div>
        {/* THREE END */}
      </>
    </div>
  );
};

export default Left;
