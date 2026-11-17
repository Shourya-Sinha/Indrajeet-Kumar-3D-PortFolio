"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { SafeCanvas } from "./SafeCanvas";

interface HeroSceneProps {
  scrollProgressRef: React.MutableRefObject<number>;
  distortion?: number;
  particleCount?: number;
  rotationSpeed?: number;
}

function ArchitecturalGyroCore({
  scrollProgressRef,
  particleCount = 140,
  rotationSpeed = 0.28,
}: HeroSceneProps) {
  const assemblyRef = useRef<THREE.Group>(null);
  const coreKnotRef = useRef<THREE.Mesh>(null);
  const innerReactorRef = useRef<THREE.Mesh>(null);
  const cageRef = useRef<THREE.Mesh>(null);
  const ringOuterRef = useRef<THREE.Group>(null);
  const ringMidRef = useRef<THREE.Group>(null);
  const ringInnerRef = useRef<THREE.Group>(null);

  const satelliteAngles = useMemo(() => [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2], []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const scroll = scrollProgressRef.current || 0;

    if (assemblyRef.current) {
      assemblyRef.current.position.y = Math.sin(t * 0.9) * 0.08 - scroll * 0.45;
    }

    if (coreKnotRef.current) {
      coreKnotRef.current.rotation.y += delta * rotationSpeed * 1.1;
      coreKnotRef.current.rotation.x += delta * rotationSpeed * 0.45;
    }

    if (innerReactorRef.current) {
      innerReactorRef.current.rotation.y -= delta * 0.65;
      const pulse = 1 + Math.sin(t * 2.2) * 0.06;
      innerReactorRef.current.scale.setScalar(pulse);
    }

    if (cageRef.current) {
      cageRef.current.rotation.y -= delta * 0.2;
      cageRef.current.rotation.z += delta * 0.12;
    }

    if (ringOuterRef.current) {
      ringOuterRef.current.rotation.z += delta * 0.32;
      ringOuterRef.current.rotation.x = Math.PI * 0.34 + Math.sin(t * 0.4) * 0.08;
    }

    if (ringMidRef.current) {
      ringMidRef.current.rotation.z -= delta * 0.42;
      ringMidRef.current.rotation.y = Math.PI * 0.28 + Math.cos(t * 0.35) * 0.12;
    }

    if (ringInnerRef.current) {
      ringInnerRef.current.rotation.x += delta * 0.38;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 6, 5]} intensity={2.6} color="#ffffff" />
      <pointLight position={[-4.5, 2.5, 4]} intensity={3.8} color="#00e5ff" distance={16} />
      <pointLight position={[4.2, -2.5, 3.2]} intensity={3.2} color="#a855f7" distance={16} />
      <pointLight position={[0, -1.8, -3.5]} intensity={3.0} color="#f43f5e" distance={14} />
      <pointLight position={[-2.5, -3.5, 2.5]} intensity={2.6} color="#2563eb" distance={14} />

      <group ref={assemblyRef} position={[0, 0, 0]}>
        <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.22}>
          {/* 1. Sculpted Glossy Obsidian-Iridescent Torus-Knot Core (Matches 3D Studio Palette) */}
          <mesh ref={coreKnotRef}>
            <torusKnotGeometry args={[0.92, 0.26, 200, 36, 2, 3]} />
            <meshPhysicalMaterial
              color="#141e33"
              metalness={0.95}
              roughness={0.06}
              clearcoat={1}
              clearcoatRoughness={0.04}
              iridescence={1}
              iridescenceIOR={1.8}
              iridescenceThicknessRange={[180, 720]}
              envMapIntensity={2.6}
            />
          </mesh>

          {/* 2. Glowing Cyan-Crimson Reactor Core Center */}
          <mesh ref={innerReactorRef}>
            <octahedronGeometry args={[0.42, 0]} />
            <meshStandardMaterial
              color="#7deeff"
              emissive="#00e5ff"
              emissiveIntensity={2.4}
              metalness={0.5}
              roughness={0.12}
            />
          </mesh>

          {/* 3. Precision Geodesic Wireframe Shield */}
          <mesh ref={cageRef}>
            <icosahedronGeometry args={[1.56, 1]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#00e5ff"
              emissiveIntensity={0.65}
              wireframe
              transparent
              opacity={0.28}
            />
          </mesh>

          {/* 4. Outer Iridescent Cyan Gimbal Ring + Orbital Satellite Nodes */}
          <group ref={ringOuterRef} rotation={[Math.PI * 0.34, 0.25, 0]}>
            <mesh>
              <torusGeometry args={[2.08, 0.036, 20, 128]} />
              <meshPhysicalMaterial
                color="#38bdf8"
                emissive="#00e5ff"
                emissiveIntensity={1.6}
                metalness={0.9}
                roughness={0.14}
                iridescence={0.8}
              />
            </mesh>
            {satelliteAngles.map((angle, idx) => (
              <mesh
                key={idx}
                position={[Math.cos(angle) * 2.08, Math.sin(angle) * 2.08, 0]}
              >
                <octahedronGeometry args={[0.115, 0]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive={
                    idx === 0
                      ? "#00e5ff"
                      : idx === 1
                        ? "#a855f7"
                        : idx === 2
                          ? "#f43f5e"
                          : "#2563eb"
                  }
                  emissiveIntensity={2.1}
                  metalness={0.9}
                  roughness={0.14}
                />
              </mesh>
            ))}
          </group>

          {/* 5. Middle Violet-Magenta Gimbal Ring */}
          <group ref={ringMidRef} rotation={[-Math.PI * 0.28, Math.PI * 0.28, 0]}>
            <mesh>
              <torusGeometry args={[1.82, 0.026, 18, 128]} />
              <meshStandardMaterial
                color="#c084fc"
                emissive="#a855f7"
                emissiveIntensity={1.65}
                metalness={0.88}
                roughness={0.16}
              />
            </mesh>
          </group>

          {/* 6. Inner Rose-Crimson / Brushed Titanium Gimbal Track */}
          <group ref={ringInnerRef} rotation={[Math.PI * 0.5, -0.35, 0.2]}>
            <mesh>
              <torusGeometry args={[1.64, 0.02, 16, 120]} />
              <meshStandardMaterial
                color="#fb7185"
                emissive="#f43f5e"
                emissiveIntensity={1.35}
                metalness={0.92}
                roughness={0.14}
              />
            </mesh>
          </group>
        </Float>
      </group>

      <Sparkles
        count={Math.min(110, Math.floor(particleCount * 0.45))}
        scale={[6.5, 5.5, 5]}
        size={1.7}
        speed={0.25}
        color="#00e5ff"
        opacity={0.6}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        autoRotate
        autoRotateSpeed={0.85}
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
      fallbackAlt="Indrajeet Kumar (Shourya Sinha) 3D hero gyroscope core"
      className="h-full w-full"
      cameraPosition={[0, 0.35, 5.8]}
      fov={42}
    >
      <ArchitecturalGyroCore
        scrollProgressRef={scrollProgressRef}
        distortion={distortion}
        particleCount={particleCount}
        rotationSpeed={rotationSpeed}
      />
    </SafeCanvas>
  );
}
