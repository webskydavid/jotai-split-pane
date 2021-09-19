import { atom, Provider, useAtom } from "jotai";
import { useAtomValue } from "jotai/utils";
import React, {
  FC,
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useEventListener } from "../../hooks/useEventListener";
import Divider from "../Divider/Divider";

import classes from "./Group.module.css";

export enum Direction {
  Column = "COLUMN",
  Row = "ROW",
}

interface Props {
  children: ReactNode[];
  direction?: Direction;
  initSizes?: number[];
  minBoxHeights?: number[];
  minBoxWidths?: number[];
  scope: any;
}

interface Link {
  index: number;
  prev: HTMLElement;
  prevPercent: number;
  current: HTMLElement;
  currentPercent: number;
  parent: HTMLElement;
  divider: HTMLElement;
  dividerSize: number;
  start: number;
  end: number;
  size: number;
  fold: boolean;
}

const getInnerSize = (direction: Direction, element: HTMLElement) => {
  // Get style to calculate size
  // console.log(getComputedStyle(element));
  return direction === Direction.Column
    ? element.clientHeight
    : element.clientWidth;
};

const draggingAtom = atom(false);
const dividerIndexAtom = atom(-1);
const linksAtom = atom<Link[]>([]);

const generateLinksAtom = atom(null, (get, set, update: any) => {
  const { direction, children, dividers } = update;
  const parent = children[0].parentNode;

  let array: Link[] = [];

  children.forEach((child: HTMLElement, index: number) => {
    const prev = children[index - 1];
    const divider = dividers[index];
    const current = children[index];

    const dividerSize =
      direction === Direction.Column
        ? divider.getBoundingClientRect().height
        : divider.getBoundingClientRect().width;

    const end =
      direction === Direction.Column
        ? current.getBoundingClientRect().bottom
        : current.getBoundingClientRect().right;

    const start =
      direction === Direction.Column && prev
        ? prev?.getBoundingClientRect().top
        : prev?.getBoundingClientRect().left;

    const size =
      direction === Direction.Column && prev
        ? prev?.getBoundingClientRect().height +
          divider.getBoundingClientRect().height +
          current.getBoundingClientRect().height
        : prev?.getBoundingClientRect().width +
          divider.getBoundingClientRect().width +
          current.getBoundingClientRect().width;

    array.push({
      index: index,
      prev,
      prevPercent: 100 / children.length,
      current,
      currentPercent: 100 / children.length,
      parent,
      divider,
      dividerSize,
      start,
      end,
      size,
      fold: false,
    } as Link);
  });
  set(linksAtom, array);
});

const calculateSizesAtom = atom(null, (get, set, update: any) => {
  const { direction } = update;
  const links = get(linksAtom);
  const index = get(dividerIndexAtom);

  const link = links[index];
  const parentSize = getInnerSize(direction, link.parent);
  const dividerHeight = link.divider.clientHeight;

  let prevPercent;
  let currentPercent;

  if (direction === Direction.Column) {
    const prev = link.prev.getBoundingClientRect();
    const current = link.current.getBoundingClientRect();

    prevPercent = ((prev.height + dividerHeight) / parentSize) * 100;
    currentPercent = ((current.height + dividerHeight) / parentSize) * 100;

    link.prevPercent = prevPercent;
    link.currentPercent = currentPercent;

    link.start = prev.top;
    link.end = current.bottom;

    link.size = prev.height + dividerHeight * 2 + current.height;
  } else {
  }

  set(linksAtom, links);
});

const Group: FC<Props> = ({
  children,
  direction = Direction.Column,
  minBoxHeights = [],
  minBoxWidths = [],
  initSizes = [],
  scope: SCOPE,
}) => {
  const links = useAtomValue(linksAtom, SCOPE);
  const [dragging, setDragging] = useAtom(draggingAtom, SCOPE);
  const [dividerIndex, setDividerIndex] = useAtom(dividerIndexAtom, SCOPE);

  const [, generateLinks] = useAtom(generateLinksAtom, SCOPE);
  const [, calculateSizes] = useAtom(calculateSizesAtom, SCOPE);

  const childRef = useRef<HTMLElement[]>([]);
  const dividerRef = useRef<HTMLElement[]>([]);

  childRef.current = [];
  dividerRef.current = [];

  const init = useCallback(
    (
      direction: Direction,
      children: HTMLElement[],
      dividers: HTMLElement[],
      initSizes: number[]
    ) => {
      const sizes = direction === Direction.Column ? "height" : "width";
      const parent = children[0].parentNode;
      const parentSize = getInnerSize(direction, parent as HTMLElement);

      if (!parentSize) {
        throw new Error("Parent size undefined");
      }

      if (initSizes.length && initSizes.reduce((p, c) => p + c, 0) < 100) {
        throw new Error("Sum of initial sizes is less then 100");
      }

      children.forEach((child, index) => {
        const divider = dividers[index];
        const dividerSize = divider.getBoundingClientRect()[sizes];
        let calc = `calc(${100 / children.length}% - ${dividerSize}px)`;

        if (initSizes.length) {
          calc = `calc(${initSizes[index]}% - ${dividerSize}px)`;
        }

        if (direction === Direction.Column) {
          child.style.height = calc;
          child.style.width = "100%";
        } else {
          child.style.height = "100%";
          child.style.width = calc;
        }
      });
    },
    []
  );

  const startDrag = useCallback(
    (index: number) => {
      setDragging(true);
      setDividerIndex(index);
    },
    [setDividerIndex, setDragging]
  );

  const stopDrag = useCallback(() => {
    setDragging(false);
  }, [setDragging]);

  const drag = useCallback(
    (e: React.MouseEvent, direction: Direction, dividerIndex: number) => {
      const link = links[dividerIndex];
      const isColumn = direction === Direction.Column;

      const percent = link.prevPercent + link.currentPercent;
      const dividerSize = link.dividerSize;
      let offset = (isColumn ? e.clientY : e.clientX) - link.start;

      // MIN SIZES
      if (offset < dividerSize + 80) {
        offset = dividerSize + 80;
      }
      if (offset >= link.size - (dividerSize + 80)) {
        offset = link.size - (dividerSize + 80);
      }

      const prevPercent = (offset / link.size) * percent;
      const currentPercent = percent - prevPercent;

      if (direction === Direction.Column) {
        link.prev.style.height = `calc(${prevPercent}% - ${dividerSize}px)`;
        link.current.style.height = `calc(${currentPercent}% - ${dividerSize}px)`;
      } else {
        link.prev.style.width = `calc(${prevPercent}% - ${dividerSize}px)`;
        link.current.style.width = `calc(${currentPercent}% - ${dividerSize}px)`;
      }
    },
    [links]
  );

  const fold = useCallback(
    (e: React.MouseEvent, direction: Direction, dividerIndex: number) => {
      const link = links[dividerIndex];
      const isColumn = direction === Direction.Column;

      const percent = link.prevPercent + link.currentPercent;
      const dividerSize = link.dividerSize;

      if (!link.fold) {
        if (isColumn) {
          link.prev.style.height = `calc(${percent}% - ${dividerSize}px)`;
          link.current.style.height = `calc(0%)`;
        } else {
          link.current.style.width = `calc(0% - ${dividerSize}px)`;
        }
      } else {
      }

      console.log(links);
    },
    [links]
  );

  const handleDividerMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    if (index === 0) return;
    startDrag(index);
    calculateSizes({ direction });
  };

  const handleCollapse = (e: React.MouseEvent, index: number) => {
    console.log(e, index);
    e.preventDefault();
    fold(e, direction, index);
    calculateSizes({ direction });
  };

  useEventListener("mousemove", (e: React.MouseEvent) => {
    if (!dragging) return;
    drag(e, direction, dividerIndex);
  });

  useEventListener("mouseup", (e: React.MouseEvent) => {
    if (!dragging) return;
    stopDrag();
    calculateSizes({ direction });
  });

  useEffect(() => {
    init(direction, childRef.current, dividerRef.current, initSizes);
    generateLinks({
      direction,
      children: childRef.current,
      dividers: dividerRef.current,
    });
  }, []);

  const addRef = (
    refs: typeof childRef | typeof dividerRef,
    element: HTMLElement
  ) => {
    if (element && !refs.current.includes(element)) {
      refs.current.push(element);
    }
  };

  return (
    <Provider scope={SCOPE}>
      <div
        className={classes.root}
        style={{
          flexDirection: direction === Direction.Column ? "column" : "row",
        }}
      >
        {children.map((child, index) => {
          return (
            <Fragment key={index}>
              <Divider
                setRef={(el: HTMLDivElement) => addRef(dividerRef, el)}
                onMouseDown={(e: React.MouseEvent) =>
                  handleDividerMouseDown(e, index)
                }
                onFold={(e: React.MouseEvent) => handleCollapse(e, index)}
                drag={index > 0}
                direction={direction}
              />
              <div
                className={classes.wrapper}
                ref={(el: HTMLDivElement) => addRef(childRef, el)}
              >
                {child}
              </div>
            </Fragment>
          );
        })}
      </div>
    </Provider>
  );
};

export default Group;
