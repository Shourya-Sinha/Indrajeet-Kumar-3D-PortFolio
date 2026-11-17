"use client";

import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { SafeCanvas } from "./SafeCanvas";

interface HeroSceneProps {
  scrollProgressRef: React.MutableRefObject<number>;
  distortion?: number;
  particleCount?: number;
  rotationSpeed?: number;
}

function LiquidChromeAssembly({
  scrollProgressRef,
  distortion = 0.35,
  particleCount = 260,
  rotationSpeed = 0.25,
}: HeroSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const { pointer, camera } = useThree();

  const geo = useMemo(() => new THREE.IcosahedronGeometry(1.38, 32), []);
  const basePositions = useMemo(() => {
    const pos = geo.attributes.position;
    return new Float32Array(pos.array);
  }, [geo]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const scroll = scrollProgressRef.current || 0;

    // Gentle vertex displacement on liquid chrome sphere
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const amp = 0.085 * (0.6 + distortion);
    for (let i = 0; i < arr.length; i += 3) {
      const bx = basePositions[i];
      const by = basePositions[i + 1];
      const bz = basePositions[i + 2];
      const n =
        Math.sin(bx * 2.4 + t * 1.1) *
        Math.cos(by * 2.1 - t * 0.9) *
        Math.sin(bz * 2.3 + t * 0.7);
      const scale = 1 + n * amp;
      arr[i] = bx * scale;
      arr[i + 1] = by * scale;
      arr[i + 2] = bz * scale;
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * rotationSpeed * 0.8;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.22;
      ring1Ref.current.rotation.x = Math.PI * 0.36 + Math.sin(t * 0.35) * 0.08;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.17;
      ring2Ref.current.rotation.y = Math.cos(t * 0.28) * 0.25;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y += delta * 0.14;
    }

    if (groupRef.current) {
      groupRef.current.position.y = -scroll * 1.1;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        pointer.x * 0.35,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -pointer.y * 0.2,
        0.05
      );
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.65, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.4 - scroll * 0.6, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 6.2 - scroll * 1.4, 0.04);
    camera.lookAt(0, -scroll * 0.35, 0);
  });

  const satellites = useMemo(
    () => [
      { pos: [2.75, 0.95, -0.6] as [number, number, number], r: 0.18, color: "#00e5ff" },
      { pos: [-2.6, -0.8, 0.7] as [number, number, number], r: 0.14, color: "#8b5cf6" },
      { pos: [1.9, -1.6, 1.1] as [number, number, number], r: 0.12, color: "#2979ff" },
      { pos: [-2.1, 1.45, -0.9] as [number, number, number], r: 0.16, color: "#00e5ff" },
    ],
    []
  );

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 6, 4]} intensity={2.4} color="#e2f4ff" />
      <pointLight position={[-4, -2, 3]} intensity={3.2} color="#00e5ff" distance={14} />
      <pointLight position={[4, 2, -2]} intensity={2.8} color="#8b5cf6" distance={14} />

      <group ref={groupRef} position={[0.9, 0.05, 0]}>
        <Float speed={1.5} rotationIntensity={0.25} floatIntensity={0.45}>
          {/* Central Liquid Chrome Core */}
          <mesh ref={coreRef} geometry={geo}>
            <meshPhysicalMaterial
              color="#dce6f5"
              metalness={0.98}
              roughness={0.07}
              clearcoat={1}
              clearcoatRoughness={0.06}
              envMapIntensity={2.1}
            />
          </mesh>

          {/* Outer Glass Shell Halo */}
          <mesh scale={1.14}>
            <sphereGeometry args={[1.4, 36, 36]} />
            <MeshTransmissionMaterial
              backside
              samples={4}
              thickness={0.4}
              chromaticAberration={0.18}
              anisotropy={0.2}
              distortion={0.15}
              temporalDistortion={0.1}
              roughness={0.08}
              color="#9beeff"
              transparent
              opacity={0.45}
            />
          </mesh>

          {/* Holographic Orbital Rings */}
          <mesh ref={ring1Ref} rotation={[Math.PI * 0.36, 0.2, 0]}>
            <torusGeometry args={[2.15, 0.022, 16, 120]} />
            <meshStandardMaterial
              color="#00e5ff"
              emissive="#00e5ff"
              emissiveIntensity={1.6}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          <mesh ref={ring2Ref} rotation={[-Math.PI * 0.28, 0.65, 0.4]}>
            <torusGeometry args={[2.55, 0.016, 16, 120]} />
            <meshStandardMaterial
              color="#8b5cf6"
              emissive="#8b5cf6"
              emissiveIntensity={1.45}
              metalness={0.85}
              roughness={0.2}
            />
          </mesh>

          <mesh ref={ring3Ref} rotation={[Math.PI * 0.48, -0.4, 0.2]}>
            <torusGeometry args={[2.95, 0.01, 12, 120]} />
            <meshStandardMaterial
              color="#2979ff"
              emissive="#2979ff"
              emissiveIntensity={1.2}
            />
          </mesh>

          {/* Floating Technology Satellite Nodes */}
          {satellites.map((sat, idx) => (
            <mesh key={idx} position={sat.pos}>
              <octahedronGeometry args={[sat.r, 1]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive={sat.color}
                emissiveIntensity={1.5}
                metalness={0.9}
                roughness={0.15}
              />
            </mesh>
          ))}
        </Float>
      </group>

      <Sparkles
        count={Math.min(240, particleCount)}
        scale={[12, 8, 6]}
        size={1.8}
        speed={0.35}
        color="#00e5ff"
        opacity={0.65}
      />
      <Sparkles
        count={Math.min(120, Math.floor(particleCount * 0.5))}
        scale={[10, 7, 5]}
        size={2.1}
        speed={0.25}
        color="#8b5cf6"
        opacity={0.55}
      />
    </>
  );
}

export function HeroCanvas({
  scrollProgressRef,
  fallbackImageUrl,
  distortion,
  particleCount,
  rotationSpeed,
}: {
  scrollProgressRef: React.MutableRefObject<number>;
  fallbackImageUrl?: string;
  distortion?: number;
  particleCount?: number;
  rotationSpeed?: number;
}) {
  return (
    <SafeCanvas
      fallbackImageUrl={fallbackImageUrl}
      fallbackAlt="Shourya Sinha 3D hero liquid chrome sphere"
      className="h-full w-full"
      cameraPosition={[0, 0, 6.2]}
      fov={44}
    >
      <LiquidChromeAssembly
        scrollProgressRef={scrollProgressRef}
        distortion={distortion}
        particleCount={particleCount}
        rotationSpeed={rotationSpeed}
      />
    </SafeCanvas>
  );
}
