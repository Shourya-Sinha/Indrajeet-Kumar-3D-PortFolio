"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

function ScrollDriven3DSpace() {
  const clusterRef = useRef<THREE.Group>(null);
  const { camera, pointer } = useThree();

  const shards = useMemo(
    () => [
      { pos: [-5.5, 2.2, -4] as [number, number, number], scale: 0.75, speed: 0.22, kind: 0, color: "#00e5ff" },
      { pos: [5.8, -1.8, -7] as [number, number, number], scale: 0.9, speed: -0.18, kind: 1, color: "#8b5cf6" },
      { pos: [-4.8, -4.6, -11] as [number, number, number], scale: 0.65, speed: 0.25, kind: 2, color: "#2979ff" },
      { pos: [4.9, 4.4, -14] as [number, number, number], scale: 0.85, speed: -0.2, kind: 0, color: "#00e5ff" },
      { pos: [-6.0, 1.5, -18] as [number, number, number], scale: 0.72, speed: 0.19, kind: 1, color: "#8b5cf6" },
      { pos: [6.2, -2.5, -22] as [number, number, number], scale: 0.88, speed: -0.16, kind: 2, color: "#00e5ff" },
    ],
    []
  );

  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    const scrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

    // Smooth camera travel forward along Z as visitor scrolls through sections
    const targetZ = 5.5 - scrollProgress * 18;
    const targetY = -scrollProgress * 2.2 + pointer.y * 0.45;
    const targetX = pointer.x * 0.65;

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.rotation.z = THREE.MathUtils.lerp(
      camera.rotation.z,
      -pointer.x * 0.04 + Math.sin(scrollProgress * Math.PI * 2) * 0.03,
      0.04
    );

    if (clusterRef.current) {
      clusterRef.current.rotation.y = Math.sin(t * 0.08) * 0.06;
    }

    meshRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const spec = shards[idx];
      mesh.rotation.x += delta * spec.speed;
      mesh.rotation.y += delta * spec.speed * 1.25;
      mesh.position.y += Math.sin(t * 0.6 + idx * 1.3) * 0.0015;
    });
  });

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 4, 4]} intensity={1.8} color="#00e5ff" distance={26} />
      <pointLight position={[-4, -4, -10]} intensity={1.6} color="#8b5cf6" distance={26} />

      <group ref={clusterRef}>
        {shards.map((s, idx) => (
          <mesh
            key={idx}
            ref={(el) => {
              meshRefs.current[idx] = el;
            }}
            position={s.pos}
            scale={s.scale}
          >
            {s.kind === 0 && <icosahedronGeometry args={[1, 0]} />}
            {s.kind === 1 && <octahedronGeometry args={[1, 0]} />}
            {s.kind === 2 && <torusGeometry args={[0.9, 0.14, 12, 36]} />}
            <meshStandardMaterial
              color={s.color}
              emissive={s.color}
              emissiveIntensity={0.45}
              wireframe
              transparent
              opacity={0.26}
            />
          </mesh>
        ))}

        <Sparkles
          count={140}
          scale={[18, 14, 28]}
          position={[0, 0, -9]}
          size={1.7}
          speed={0.22}
          opacity={0.45}
          color="#7deeff"
        />
      </group>
    </>
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
      className="pointer-events-none fixed inset-0 z-0 opacity-70"
    >
      <Canvas
        dpr={[1, 1.25]}
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <ScrollDriven3DSpace />
      </Canvas>
    </div>
  );
}
