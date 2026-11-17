"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function AmbientVolumetricDrift() {
  const { camera, pointer } = useThree();
  const cyanOrbRef = useRef<THREE.Mesh>(null);
  const violetOrbRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    const scrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

    const targetZ = 5.5 - scrollProgress * 6;
    const targetY = -scrollProgress * 1.1 + pointer.y * 0.2;
    const targetX = pointer.x * 0.28;

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.04);

    if (cyanOrbRef.current) {
      cyanOrbRef.current.position.y = Math.sin(t * 0.25) * 1.4;
      cyanOrbRef.current.position.x = -5.5 + Math.cos(t * 0.2) * 0.8;
    }
    if (violetOrbRef.current) {
      violetOrbRef.current.position.y = Math.cos(t * 0.22) * 1.6 - 1;
      violetOrbRef.current.position.x = 5.5 + Math.sin(t * 0.18) * 0.8;
    }
  });

  return (
    <group position={[0, 0, -12]}>
      <mesh ref={cyanOrbRef} position={[-5.5, 0.5, 0]}>
        <sphereGeometry args={[3.4, 24, 24]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.045} depthWrite={false} />
      </mesh>
      <mesh ref={violetOrbRef} position={[5.5, -1, -2]}>
        <sphereGeometry args={[4.2, 24, 24]} />
        <meshBasicMaterial color="#9333ea" transparent opacity={0.05} depthWrite={false} />
      </mesh>
    </group>
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
      className="pointer-events-none fixed inset-0 z-0 opacity-75"
    >
      <Canvas
        dpr={[1, 1.2]}
        camera={{ position: [0, 0, 5.5], fov: 48 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <AmbientVolumetricDrift />
      </Canvas>
    </div>
  );
}
