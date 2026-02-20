import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { RefObject } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(MotionPathPlugin);
}

export default class LoaderAnimate {
  private pathsTimeline: gsap.core.Timeline;
  private ctx: gsap.Context;
  private paths: RefObject<SVGPathElement | null>[] = [];
  private traveler: RefObject<SVGCircleElement | null>;
  private checkpoints: RefObject<SVGPathElement | null>[];

  constructor(
    traveler: RefObject<SVGCircleElement | null>,
    paths: RefObject<SVGPathElement | null>[] = [],
    checkpoints: RefObject<SVGPathElement | null>[] = []
  ) {
    this.ctx = gsap.context(() => {});
    this.paths = paths;
    this.traveler = traveler;
    this.checkpoints = checkpoints;
    this.pathsTimeline = gsap.timeline({
      repeat: -1,
      repeatDelay: 0,
      paused: true,
      repeatRefresh: false
    });
  }
  animate = (): (() => void) => {
    if (
      this.paths.length === 0 ||
      this.checkpoints.length === 0 ||
      !this.traveler.current
    ) {
      return () => {};
    }

    // this.pathsTimeline.clear();

    this.paths.forEach((path, index) => {
      const checkpointRef = this.checkpoints[index];
      if (!path.current) return;
      this.pathsTimeline.to(
        this.traveler.current,
        {
          duration: 1,
          ease: "none",
          motionPath: {
            path: path.current,
            align: path.current,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
          },
        },
        "+=0"
      );
      this.pathsTimeline.to(checkpointRef.current, {
        ease: "power1.inOut",
        duration: 0,
        strokeWidth: 2,
      });
    });
    this.pathsTimeline.play();
    return () => {
      this.pathsTimeline.kill();
      this.ctx.revert();
    };
  };
}
