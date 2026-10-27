"use client";

import { motion, useAnimation, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

export default function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.15,
  as = "div",
  ...motionProps
}) {
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount });
  const Component = motion[as] || motion.div;

  useEffect(() => {
    if (prefersReducedMotion) {
      controls.set("visible");
      return () => controls.stop();
    }

    if (isInView) {
      controls.start("visible");
    } else {
      controls.set("hidden");
    }
    return () => controls.stop();
  }, [controls, isInView, prefersReducedMotion]);

  return (
    <Component
      ref={ref}
      className={className}
      initial={false}
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      {...motionProps}
    >
      {children}
    </Component>
  );
}
