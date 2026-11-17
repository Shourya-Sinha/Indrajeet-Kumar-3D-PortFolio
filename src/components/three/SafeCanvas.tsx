"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";

interface SafeCanvasProps {
  children: React.ReactNode;
  fallbackImageUrl?: string;
  fallbackAlt?: string;
  className?: string;
  cameraPosition?: [number, number, number];
  fov?: number;
}

export function SafeCanvas({
  children,
  fallbackImageUrl = "/assets/visuals/hero-environment.webp",
  fallbackAlt = "3D technological studio visual",
  className = "",
  cameraPosition = [0, 0, 6],
  fov = 45,
}: SafeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inView, setInView] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onMqChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onMqChange);

    setIsMobile(window.innerWidth < 768);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);

    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2", { powerPreference: "high-performance" }) ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      setWebglSupported(Boolean(gl));
    } catch {
      setWebglSupported(false);
    }

    return () => {
      mq.removeEventListener("change", onMqChange);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setInView(entries[0]?.isIntersecting ?? true);
      },
      { rootMargin: "160px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (webglSupported === false || reducedMotion) {
    return (
      <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
        <img
          src={fallbackImageUrl}
          alt={fallbackAlt}
          loading="lazy"
          className="h-full w-full object-cover opacity-85"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {webglSupported === true && (
        <Canvas
          dpr={isMobile ? [1, 1.25] : [1, 1.75]}
          frameloop={inView ? "always" : "never"}
          camera={{ position: cameraPosition, fov }}
          gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
        >
          <Environment resolution={128}>
            <group rotation={[-Math.PI / 3, 0, 1]}>
              <Lightformer
                form="rect"
                intensity={3.5}
                color="#ffffff"
                scale={[10, 3, 1]}
                position={[0, 5, -4]}
              />
              <Lightformer
                form="ring"
                intensity={2.6}
                color="#00e5ff"
                scale={[7, 7, 1]}
                position={[-5, 2, 3]}
              />
              <Lightformer
                form="rect"
                intensity={2.4}
                color="#8b5cf6"
                scale={[8, 2, 1]}
                position={[5, -2, 2]}
              />
              <Lightformer
                form="rect"
                intensity={1.5}
                color="#2979ff"
                scale={[6, 6, 1]}
                position={[0, -5, -2]}
              />
            </group>
          </Environment>
          {children}
        </Canvas>
      )}
    </div>
  );
}
