"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Line, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { SafeCanvas } from "./SafeCanvas";

interface CategoryOrbitProps {
  categories: string[];
  activeCategory: string;
}

function ExpertiseOrbitalScene({ categories, activeCategory }: CategoryOrbitProps) {
  const rigRef = useRef<THREE.Group>(null);
  const activeIdx = Math.max(0, categories.indexOf(activeCategory));

  const nodePositions = useMemo(() => {
    const count = Math.max(1, categories.length);
    return categories.map((_, idx) => {
      const angle = (idx / count) * Math.PI * 2;
      const radius = 2.35;
      const y = Math.sin(angle * 2) * 0.45;
      return [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as [number, number, number];
    });
  }, [categories]);

  useFrame((_, delta) => {
    if (!rigRef.current) return;
    rigRef.current.rotation.y += delta * 0.14;
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 5, 4]} intensity={2.2} color="#ffffff" />
      <pointLight position={[0, 0, 0]} intensity={2.8} color="#00e5ff" distance={8} />

      <group ref={rigRef}>
        {/* Central Core */}
        <mesh>
          <icosahedronGeometry args={[0.72, 2]} />
          <meshPhysicalMaterial
            color="#d8e3f2"
            metalness={0.95}
            roughness={0.1}
            clearcoat={1}
          />
        </mesh>

        {/* Orbital Nodes */}
        {nodePositions.map((pos, idx) => {
          const isActive = idx === activeIdx;
          return (
            <group key={categories[idx]}>
              <Line
                points={[[0, 0, 0], pos]}
                color={isActive ? "#00e5ff" : "#2979ff"}
                lineWidth={isActive ? 2.4 : 0.8}
                transparent
                opacity={isActive ? 0.95 : 0.35}
              />
              <Float speed={1.6} floatIntensity={0.25}>
                <mesh position={pos} scale={isActive ? 1.35 : 0.9}>
                  <dodecahedronGeometry args={[0.26, 0]} />
                  <meshStandardMaterial
                    color={isActive ? "#00e5ff" : "#64748b"}
                    emissive={isActive ? "#00e5ff" : "#8b5cf6"}
                    emissiveIntensity={isActive ? 1.7 : 0.4}
                    metalness={0.88}
                    roughness={0.18}
                  />
                </mesh>
              </Float>
            </group>
          );
        })}
      </group>

      <Sparkles count={90} scale={[7, 5, 7]} size={1.6} speed={0.25} color="#00e5ff" />
    </>
  );
}

export function ExpertiseCanvas({
  categories,
  activeCategory,
}: {
  categories: string[];
  activeCategory: string;
}) {
  return (
    <SafeCanvas
      fallbackImageUrl="/assets/visuals/service-python-dev.webp"
      fallbackAlt="3D skill clusters orbital network"
      className="h-full w-full"
      cameraPosition={[0, 1.8, 6.2]}
      fov={42}
    >
      <ExpertiseOrbitalScene categories={categories} activeCategory={activeCategory} />
    </SafeCanvas>
  );
}
