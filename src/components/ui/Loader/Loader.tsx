"use client";

import { useEffect, useRef } from "react";
import styles from "./Loader.module.scss";
import LoaderAnimate from "./animated";

export default function Loader() {
  const travelerRef = useRef<SVGCircleElement>(null);
  const pathRef__1 = useRef<SVGPathElement>(null);
  const pathRef__2 = useRef<SVGPathElement>(null);
  const pathRef__3 = useRef<SVGPathElement>(null);
  const pathRef__4 = useRef<SVGPathElement>(null);
  const checkpointPath__1 = useRef<SVGPathElement>(null);
  const checkpointPath__2 = useRef<SVGPathElement>(null);
  const checkpointPath__3 = useRef<SVGPathElement>(null);
  const checkpointPath__4 = useRef<SVGPathElement>(null);

  useEffect(() => {
    const animation = new LoaderAnimate(
      travelerRef,
      [pathRef__1, pathRef__2, pathRef__3, pathRef__4],
      [
        checkpointPath__1,
        checkpointPath__2,
        checkpointPath__3,
        checkpointPath__4,
      ]
    );
    const revert = animation.animate();

    return () => {
      revert();
    };
  }, []);

  return (
    <div className={styles.loader}>
      <svg
        className={styles.loader__svg}
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          ref={checkpointPath__4}
          d="M14 22.5C18.1421 22.5 21.5 25.8579 21.5 30C21.5 34.1421 18.1421 37.5 14 37.5C9.85786 37.5 6.5 34.1421 6.5 30C6.5 25.8579 9.85786 22.5 14 22.5Z"
          stroke="#D9D9D9"
        />
        <path
          ref={checkpointPath__3}
          d="M30 38.5C34.1421 38.5 37.5 41.8579 37.5 46C37.5 50.1421 34.1421 53.5 30 53.5C25.8579 53.5 22.5 50.1421 22.5 46C22.5 41.8579 25.8579 38.5 30 38.5Z"
          stroke="#D9D9D9"
        />
        <path
          ref={checkpointPath__2}
          d="M46 22.5C50.1421 22.5 53.5 25.8579 53.5 30C53.5 34.1421 50.1421 37.5 46 37.5C41.8579 37.5 38.5 34.1421 38.5 30C38.5 25.8579 41.8579 22.5 46 22.5Z"
          stroke="#D9D9D9"
        />
        <path
          ref={checkpointPath__1}
          d="M30 6.5C34.1421 6.5 37.5 9.85786 37.5 14C37.5 18.1421 34.1421 21.5 30 21.5C25.8579 21.5 22.5 18.1421 22.5 14C22.5 9.85786 25.8579 6.5 30 6.5Z"
          stroke="#D9D9D9"
        />
        <path ref={pathRef__1} d="M14 30L30 14" stroke="none" />
        <path ref={pathRef__2} d="M30 14L46 30" stroke="none" />
        <path ref={pathRef__3} d="M46 30L30 46" stroke="none" />
        <path ref={pathRef__4} d="M30 46L14 30" stroke="none" />
        <circle
          ref={travelerRef}
          cx="13.8125"
          cy="29.8125"
          r="7.8125"
          fill="#D9D9D9"
        />
      </svg>
    </div>
  );
}
