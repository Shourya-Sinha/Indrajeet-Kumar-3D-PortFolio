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
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 6, 5]} intensity={2.6} color="#ffffff" />
      <pointLight position={[-4, 2, 4]} intensity={3.2} color="#00e5ff" distance={15} />
      <pointLight position={[4, -2, -3]} intensity={2.6} color="#8b5cf6" distance={15} />

      <group ref={assemblyRef} position={[0, 0, 0]}>
        <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.22}>
          {/* 1. Sculpted Metallic Chrome Torus-Knot Core */}
          <mesh ref={coreKnotRef}>
            <torusKnotGeometry args={[0.88, 0.24, 180, 32, 2, 3]} />
            <meshPhysicalMaterial
              color="#e6effb"
              metalness={0.96}
              roughness={0.08}
              clearcoat={1}
              clearcoatRoughness={0.05}
              envMapIntensity={2.2}
            />
          </mesh>

          {/* 2. Glowing Cyan Energy Core Center */}
          <mesh ref={innerReactorRef}>
            <octahedronGeometry args={[0.42, 0]} />
            <meshStandardMaterial
              color="#7deeff"
              emissive="#00e5ff"
              emissiveIntensity={2.2}
              metalness={0.5}
              roughness={0.15}
            />
          </mesh>

          {/* 3. Precision Geodesic Wireframe Shield */}
          <mesh ref={cageRef}>
            <icosahedronGeometry args={[1.56, 1]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#00e5ff"
              emissiveIntensity={0.6}
              wireframe
              transparent
              opacity={0.26}
            />
          </mesh>

          {/* 4. Outer Precision Gimbal Ring + Orbital Satellite Nodes */}
          <group ref={ringOuterRef} rotation={[Math.PI * 0.34, 0.25, 0]}>
            <mesh>
              <torusGeometry args={[2.08, 0.032, 20, 128]} />
              <meshStandardMaterial
                color="#00e5ff"
                emissive="#00e5ff"
                emissiveIntensity={1.55}
                metalness={0.85}
                roughness={0.18}
              />
            </mesh>
            {satelliteAngles.map((angle, idx) => (
              <mesh
                key={idx}
                position={[Math.cos(angle) * 2.08, Math.sin(angle) * 2.08, 0]}
              >
                <octahedronGeometry args={[0.11, 0]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive={idx % 2 === 0 ? "#00e5ff" : "#8b5cf6"}
                  emissiveIntensity={1.8}
                  metalness={0.9}
                  roughness={0.15}
                />
              </mesh>
            ))}
          </group>

          {/* 5. Middle Violet Gimbal Ring */}
          <group ref={ringMidRef} rotation={[-Math.PI * 0.28, Math.PI * 0.28, 0]}>
            <mesh>
              <torusGeometry args={[1.82, 0.024, 18, 128]} />
              <meshStandardMaterial
                color="#a78bfa"
                emissive="#8b5cf6"
                emissiveIntensity={1.5}
                metalness={0.88}
                roughness={0.18}
              />
            </mesh>
          </group>

          {/* 6. Inner Brushed Titanium Gimbal Track */}
          <group ref={ringInnerRef} rotation={[Math.PI * 0.5, -0.35, 0.2]}>
            <mesh>
              <torusGeometry args={[1.64, 0.018, 16, 120]} />
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.95}
                roughness={0.12}
                clearcoat={1}
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
