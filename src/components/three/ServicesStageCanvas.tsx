"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SafeCanvas } from "./SafeCanvas";

const THEME_COLORS = [
  "#00E5FF",
  "#2979FF",
  "#8B5CF6",
  "#38BDF8",
  "#22D3EE",
  "#A855F7",
  "#10B981",
  "#0EA5E9",
  "#6366F1",
  "#06B6D4",
  "#3B82F6",
  "#14B8A6",
  "#818CF8",
  "#F43F5E",
  "#F59E0B",
  "#8B5CF6",
  "#00E5FF",
];

function ServicesMorphRig({
  activeIndex,
  progressRef,
}: {
  activeIndex: number;
  progressRef: React.MutableRefObject<number>;
}) {
  const assemblyRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringAltRef = useRef<THREE.Mesh>(null);
  const accentHex = THEME_COLORS[activeIndex % THEME_COLORS.length];

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = progressRef.current || 0;

    if (assemblyRef.current) {
      assemblyRef.current.rotation.y = THREE.MathUtils.lerp(
        assemblyRef.current.rotation.y,
        p * Math.PI * 3.5 + t * 0.16,
        0.08
      );
      assemblyRef.current.rotation.x = Math.sin(p * Math.PI * 2) * 0.2;
    }

    if (coreRef.current) {
      coreRef.current.rotation.z += delta * 0.35;
      coreRef.current.rotation.y += delta * 0.22;
      const targetScale = 1 + (activeIndex % 3) * 0.06;
      coreRef.current.scale.setScalar(
        THREE.MathUtils.lerp(coreRef.current.scale.x, targetScale, 0.08)
      );
    }

    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.42;
    }
    if (ringAltRef.current) {
      ringAltRef.current.rotation.y -= delta * 0.28;
    }
  });

  const shapeVariant = activeIndex % 4;

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 5, 4]} intensity={2.4} color="#ffffff" />
      <pointLight position={[-3, 1, 3]} intensity={3.4} color={accentHex} distance={14} />
      <pointLight position={[3, -2, -2]} intensity={2.6} color="#9333ea" distance={14} />

      <group ref={assemblyRef}>
        <Float speed={1.5} rotationIntensity={0.22} floatIntensity={0.3}>
          <mesh ref={coreRef}>
            {shapeVariant === 0 && <torusKnotGeometry args={[0.9, 0.27, 180, 32]} />}
            {shapeVariant === 1 && <octahedronGeometry args={[1.22, 0]} />}
            {shapeVariant === 2 && <icosahedronGeometry args={[1.18, 0]} />}
            {shapeVariant === 3 && <dodecahedronGeometry args={[1.15, 0]} />}
            <meshPhysicalMaterial
              color="#19243b"
              metalness={0.95}
              roughness={0.07}
              clearcoat={1}
              clearcoatRoughness={0.05}
              iridescence={1}
              iridescenceIOR={1.75}
              iridescenceThicknessRange={[150, 680]}
              envMapIntensity={2.4}
            />
          </mesh>

          <mesh ref={ringRef} rotation={[Math.PI * 0.38, 0.2, 0]}>
            <torusGeometry args={[2.1, 0.032, 18, 120]} />
            <meshStandardMaterial
              color={accentHex}
              emissive={accentHex}
              emissiveIntensity={1.65}
              metalness={0.85}
              roughness={0.18}
            />
          </mesh>

          <mesh ref={ringAltRef} rotation={[-Math.PI * 0.3, 0.5, 0.2]}>
            <torusGeometry args={[1.76, 0.02, 16, 110]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#9333ea"
              emissiveIntensity={1.35}
              metalness={0.85}
              roughness={0.18}
            />
          </mesh>
        </Float>
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        autoRotate
        autoRotateSpeed={0.65}
      />
    </>
  );
}

export function ServicesStageCanvas({
  activeIndex,
  progressRef,
  fallbackImageUrl,
}: {
  activeIndex: number;
  progressRef: React.MutableRefObject<number>;
  fallbackImageUrl?: string;
}) {
  return (
    <SafeCanvas
      fallbackImageUrl={fallbackImageUrl}
      fallbackAlt="3D interactive solutions stage"
      className="h-full w-full"
      cameraPosition={[0, 0.25, 5.8]}
      fov={44}
    >
      <ServicesMorphRig activeIndex={activeIndex} progressRef={progressRef} />
    </SafeCanvas>
  );
}
