"use client";

import React, { useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

function SubtleStarfieldDepth() {
  const { camera, pointer } = useThree();

  useFrame(() => {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    const scrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

    const targetZ = 5.5 - scrollProgress * 12;
    const targetY = -scrollProgress * 1.4 + pointer.y * 0.25;
    const targetX = pointer.x * 0.35;

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.04);
  });

  return (
    <Sparkles
      count={110}
      scale={[20, 14, 22]}
      position={[0, 0, -6]}
      size={1.45}
      speed={0.18}
      opacity={0.38}
      color="#7deeff"
    />
  );
}

export function AmbientSpaceCanvas() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    try {
      const c = document.createElement("canvas");
      const gl =
        c.getContext("webgl2", { powerPreference: "high-performance" }) ||
        c.getContext("webgl");
      if (gl) setEnabled(true);
    } catch {
      setEnabled(false);
    }
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-60"
    >
      <Canvas
        dpr={[1, 1.2]}
        camera={{ position: [0, 0, 5.5], fov: 48 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <SubtleStarfieldDepth />
      </Canvas>
    </div>
  );
}
