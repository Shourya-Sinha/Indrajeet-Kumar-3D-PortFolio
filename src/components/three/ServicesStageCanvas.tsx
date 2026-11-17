"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
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
  const outerRef = useRef<THREE.Mesh>(null);
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
      assemblyRef.current.rotation.x = Math.sin(p * Math.PI * 2) * 0.25;
    }

    if (coreRef.current) {
      coreRef.current.rotation.z += delta * 0.35;
      const targetScale = 1 + (activeIndex % 3) * 0.08;
      coreRef.current.scale.setScalar(
        THREE.MathUtils.lerp(coreRef.current.scale.x, targetScale, 0.08)
      );
    }

    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.42;
    }
    if (outerRef.current) {
      outerRef.current.rotation.y -= delta * 0.24;
    }
  });

  const shapeVariant = activeIndex % 4;

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 4]} intensity={2.3} color="#ffffff" />
      <pointLight position={[-3, 1, 3]} intensity={3.2} color={accentHex} distance={12} />
      <pointLight position={[3, -2, -2]} intensity={2.2} color="#8b5cf6" distance={12} />

      <group ref={assemblyRef}>
        <Float speed={1.7} rotationIntensity={0.3} floatIntensity={0.4}>
          <mesh ref={coreRef}>
            {shapeVariant === 0 && <torusKnotGeometry args={[0.92, 0.28, 128, 24]} />}
            {shapeVariant === 1 && <octahedronGeometry args={[1.28, 1]} />}
            {shapeVariant === 2 && <icosahedronGeometry args={[1.22, 1]} />}
            {shapeVariant === 3 && <dodecahedronGeometry args={[1.2, 0]} />}
            <meshPhysicalMaterial
              color="#dce7f7"
              metalness={0.94}
              roughness={0.12}
              clearcoat={1}
              clearcoatRoughness={0.08}
            />
          </mesh>

          <mesh ref={outerRef} scale={1.32}>
            <icosahedronGeometry args={[1.25, 1]} />
            <MeshTransmissionMaterial
              samples={4}
              thickness={0.35}
              roughness={0.1}
              chromaticAberration={0.15}
              color={accentHex}
              transparent
              opacity={0.4}
            />
          </mesh>

          <mesh ref={ringRef} rotation={[Math.PI * 0.38, 0.2, 0]}>
            <torusGeometry args={[2.25, 0.025, 16, 110]} />
            <meshStandardMaterial
              color={accentHex}
              emissive={accentHex}
              emissiveIntensity={1.6}
            />
          </mesh>
        </Float>
      </group>

      <Sparkles count={110} scale={[8, 6, 6]} size={1.9} speed={0.3} color={accentHex} />
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
      fallbackImageUrl={fallbackImageUrl || "/assets/visuals/service-web-dev.webp"}
      fallbackAlt="3D service showcase centerpiece"
      className="h-full w-full"
      cameraPosition={[0, 0, 5.8]}
      fov={42}
    >
      <ServicesMorphRig activeIndex={activeIndex} progressRef={progressRef} />
    </SafeCanvas>
  );
}
