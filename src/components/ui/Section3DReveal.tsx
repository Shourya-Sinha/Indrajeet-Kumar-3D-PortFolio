"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Section3DReveal({
  children,
  className = "",
  staggerSelector = "[data-3d-card]",
}: {
  children: React.ReactNode;
  className?: string;
  staggerSelector?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const headers = el.querySelectorAll("[data-3d-header]");
      if (headers.length > 0) {
        gsap.fromTo(
          headers,
          {
            opacity: 0,
            y: 38,
            z: -55,
            rotateX: 14,
            transformPerspective: 1400,
          },
          {
            opacity: 1,
            y: 0,
            z: 0,
            rotateX: 0,
            duration: 0.85,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: el,
              start: "top 82%",
              once: true,
            },
          }
        );
      }

      const cards = el.querySelectorAll(staggerSelector);
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 44,
            z: -65,
            rotateX: 15,
            rotateY: -5,
            scale: 0.94,
            transformPerspective: 1400,
          },
          {
            opacity: 1,
            y: 0,
            z: 0,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            stagger: 0.08,
            duration: 0.82,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: el,
              start: "top 78%",
              once: true,
            },
          }
        );
      }
    }, ref);

    return () => ctx.revert();
  }, [staggerSelector]);

  return (
    <div ref={ref} className={`perspective-1600 ${className}`}>
      {children}
    </div>
  );
}
