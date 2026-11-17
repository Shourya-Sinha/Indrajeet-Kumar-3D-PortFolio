"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { SafeCanvas } from "./SafeCanvas";

function PortalScene() {
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringA.current) ringA.current.rotation.z += delta * 0.28;
    if (ringB.current) ringB.current.rotation.z -= delta * 0.18;
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-3, 0, 3]} intensity={3} color="#00e5ff" distance={10} />
      <pointLight position={[3, 0, -2]} intensity={2.5} color="#8b5cf6" distance={10} />

      <Float speed={1.4} floatIntensity={0.3}>
        <mesh>
          <torusGeometry args={[1.45, 0.22, 32, 96]} />
          <MeshTransmissionMaterial
            samples={4}
            thickness={0.65}
            roughness={0.07}
            chromaticAberration={0.2}
            color="#a6f2ff"
          />
        </mesh>

        <mesh ref={ringA}>
          <torusGeometry args={[1.95, 0.025, 16, 96]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.6} />
        </mesh>

        <mesh ref={ringB} rotation={[0.45, 0.35, 0]}>
          <torusGeometry args={[2.28, 0.018, 16, 96]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1.4} />
        </mesh>
      </Float>

      <Sparkles count={90} scale={[6, 6, 4]} size={1.7} speed={0.3} color="#00e5ff" />
    </>
  );
}

export function ContactPortalCanvas() {
  return (
    <SafeCanvas
      fallbackImageUrl="/assets/visuals/section-contact.webp"
      fallbackAlt="3D glowing glass contact portal"
      className="h-full w-full"
      cameraPosition={[0, 0, 5.5]}
      fov={44}
    >
      <PortalScene />
    </SafeCanvas>
  );
}
