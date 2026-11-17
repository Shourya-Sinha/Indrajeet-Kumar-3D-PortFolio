"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { SafeCanvas } from "./SafeCanvas";

function PortalScene() {
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringA.current) ringA.current.rotation.z += delta * 0.32;
    if (ringB.current) ringB.current.rotation.z -= delta * 0.22;
    if (core.current) core.current.rotation.y += delta * 0.4;
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} color="#ffffff" />
      <pointLight position={[-3, 0, 3]} intensity={3.2} color="#00e5ff" distance={10} />
      <pointLight position={[3, 0, -2]} intensity={2.6} color="#8b5cf6" distance={10} />

      <Float speed={1.3} floatIntensity={0.25}>
        <mesh>
          <torusGeometry args={[1.38, 0.24, 32, 108]} />
          <meshPhysicalMaterial
            color="#d8ebff"
            metalness={0.95}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={2.1}
          />
        </mesh>

        <mesh ref={core}>
          <octahedronGeometry args={[0.52, 0]} />
          <meshStandardMaterial
            color="#7deeff"
            emissive="#00e5ff"
            emissiveIntensity={1.8}
            metalness={0.6}
            roughness={0.15}
          />
        </mesh>

        <mesh ref={ringA}>
          <torusGeometry args={[1.92, 0.026, 16, 96]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.6} />
        </mesh>

        <mesh ref={ringB} rotation={[0.45, 0.35, 0]}>
          <torusGeometry args={[2.22, 0.02, 16, 96]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1.4} />
        </mesh>
      </Float>

      <Sparkles count={70} scale={[6, 6, 4]} size={1.6} speed={0.25} color="#00e5ff" />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        autoRotate
        autoRotateSpeed={0.75}
      />
    </>
  );
}

export function ContactPortalCanvas() {
  return (
    <SafeCanvas
      fallbackImageUrl="/assets/visuals/section-contact.webp"
      fallbackAlt="3D glowing glass contact portal"
      className="h-full w-full"
      cameraPosition={[0, 0, 5.6]}
      fov={44}
    >
      <PortalScene />
    </SafeCanvas>
  );
}
