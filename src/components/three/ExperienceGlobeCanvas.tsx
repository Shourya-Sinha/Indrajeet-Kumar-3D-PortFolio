"use client";

import React, { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { SafeCanvas } from "./SafeCanvas";

interface GlobeSceneProps {
  count: number;
  activeIndex: number;
  onSelectIndex: (idx: number) => void;
}

function KineticExperienceGlobe({
  count,
  activeIndex,
  onSelectIndex,
}: GlobeSceneProps) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const radius = 1.62;

  // Compute curved orbital milestone positions across the front/upper hemisphere
  const { nodePositions, arcTubeGeo, haloTubeGeo } = useMemo(() => {
    const safeCount = Math.max(count, 2);
    const pts: THREE.Vector3[] = [];
    const span = Math.PI * 0.92;
    const startAngle = -span * 0.5;

    for (let i = 0; i < safeCount; i++) {
      const t = safeCount === 1 ? 0.5 : i / (safeCount - 1);
      const lon = startAngle + t * span;
      const lat = -0.34 + t * 0.72 + Math.sin(t * Math.PI) * 0.14;
      const x = radius * Math.cos(lat) * Math.sin(lon);
      const y = radius * Math.sin(lat);
      const z = radius * Math.cos(lat) * Math.cos(lon);
      pts.push(new THREE.Vector3(x, y, z));
    }

    // Extend ends slightly for dramatic orbital tail
    const extendedPts = [
      new THREE.Vector3(
        pts[0].x * 1.05 - 0.32,
        pts[0].y - 0.25,
        pts[0].z * 0.85
      ),
      ...pts,
      new THREE.Vector3(
        pts[pts.length - 1].x * 1.05 + 0.3,
        pts[pts.length - 1].y + 0.22,
        pts[pts.length - 1].z * 0.85
      ),
    ];

    const curve = new THREE.CatmullRomCurve3(extendedPts);
    const tube = new THREE.TubeGeometry(curve, 96, 0.024, 12, false);
    const halo = new THREE.TubeGeometry(curve, 96, 0.052, 12, false);

    return { nodePositions: pts, arcTubeGeo: tube, haloTubeGeo: halo };
  }, [count]);

  const targetYaw = useMemo(() => {
    const safeCount = Math.max(count, 2);
    const t = safeCount === 1 ? 0.5 : activeIndex / (safeCount - 1);
    return (0.5 - t) * 0.72;
  }, [activeIndex, count]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        globeGroupRef.current.rotation.y,
        targetYaw + Math.sin(t * 0.35) * 0.08,
        Math.min(delta * 3.2, 0.14)
      );
      globeGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        globeGroupRef.current.rotation.x,
        0.14 + Math.cos(t * 0.3) * 0.04,
        Math.min(delta * 2.5, 0.12)
      );
    }

    if (pulseRingRef.current && activePos) {
      pulseRingRef.current.lookAt(0, 0, 0);
      const s = 1 + Math.sin(t * 3.2) * 0.16;
      pulseRingRef.current.scale.setScalar(s);
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= delta * 0.18;
    }
  });

  const activePos = nodePositions[activeIndex] || nodePositions[0];

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 5, 5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-3.5, 1.5, 4]} intensity={2.8} color="#f43f5e" distance={14} />
      <pointLight position={[3.5, -1.5, 3.5]} intensity={2.6} color="#00e5ff" distance={14} />
      <pointLight position={[0, 3, -3]} intensity={2.2} color="#9333ea" distance={14} />

      <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.18}>
        <group ref={globeGroupRef} rotation={[0.14, 0, 0]}>
          {/* Inner Obsidian Core Sphere */}
          <mesh>
            <sphereGeometry args={[radius * 0.94, 48, 36]} />
            <meshPhysicalMaterial
              color="#070912"
              metalness={0.9}
              roughness={0.28}
              clearcoat={0.8}
              transparent
              opacity={0.92}
            />
          </mesh>

          {/* Latitude / Longitude Rose-Violet Wireframe Lattice */}
          <mesh>
            <sphereGeometry args={[radius * 0.965, 24, 16]} />
            <meshStandardMaterial
              color="#f43f5e"
              emissive="#be123c"
              emissiveIntensity={0.85}
              wireframe
              transparent
              opacity={0.34}
            />
          </mesh>

          {/* Secondary Geodesic Cyan Wireframe Shell */}
          <mesh>
            <icosahedronGeometry args={[radius * 0.985, 2]} />
            <meshStandardMaterial
              color="#00e5ff"
              emissive="#00e5ff"
              emissiveIntensity={0.45}
              wireframe
              transparent
              opacity={0.18}
            />
          </mesh>

          {/* Outer Orbital Equator Ring */}
          <mesh ref={outerRingRef} rotation={[Math.PI * 0.42, 0.2, 0]}>
            <torusGeometry args={[radius * 1.24, 0.012, 14, 120]} />
            <meshStandardMaterial
              color="#9333ea"
              emissive="#9333ea"
              emissiveIntensity={1.2}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Glowing Orbital Milestone Arc */}
          <mesh geometry={arcTubeGeo}>
            <meshStandardMaterial
              color="#fb7185"
              emissive="#f43f5e"
              emissiveIntensity={1.7}
              metalness={0.5}
              roughness={0.2}
            />
          </mesh>
          <mesh geometry={haloTubeGeo}>
            <meshStandardMaterial
              color="#00e5ff"
              emissive="#00e5ff"
              emissiveIntensity={0.9}
              transparent
              opacity={0.22}
            />
          </mesh>

          {/* Clickable Milestone Nodes Along the Orbital Curve */}
          {nodePositions.map((pos, idx) => {
            const isActive = idx === activeIndex;
            const isHovered = idx === hoveredIdx;
            const scale = isActive ? 1.45 : isHovered ? 1.25 : 1;

            return (
              <group key={idx} position={[pos.x, pos.y, pos.z]}>
                <mesh
                  scale={scale}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIndex(idx);
                  }}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredIdx(idx);
                    document.body.style.cursor = "pointer";
                  }}
                  onPointerOut={() => {
                    setHoveredIdx(null);
                    document.body.style.cursor = "auto";
                  }}
                >
                  <sphereGeometry args={[0.105, 24, 24]} />
                  <meshStandardMaterial
                    color={isActive ? "#ffffff" : "#93c5fd"}
                    emissive={isActive ? "#f43f5e" : isHovered ? "#00e5ff" : "#3b82f6"}
                    emissiveIntensity={isActive ? 2.4 : isHovered ? 1.9 : 1.3}
                    metalness={0.6}
                    roughness={0.15}
                  />
                </mesh>

                {/* Subtle outer ring around inactive hovered or active node */}
                {(isActive || isHovered) && (
                  <mesh rotation={[Math.PI * 0.5, 0, 0]}>
                    <torusGeometry args={[0.17, 0.012, 12, 36]} />
                    <meshStandardMaterial
                      color={isActive ? "#00e5ff" : "#a855f7"}
                      emissive={isActive ? "#00e5ff" : "#a855f7"}
                      emissiveIntensity={2}
                    />
                  </mesh>
                )}
              </group>
            );
          })}

          {/* Animated Pulse Beacon on Active Milestone */}
          {activePos && (
            <mesh
              ref={pulseRingRef}
              position={[activePos.x, activePos.y, activePos.z]}
            >
              <torusGeometry args={[0.24, 0.01, 10, 48]} />
              <meshStandardMaterial
                color="#f43f5e"
                emissive="#f43f5e"
                emissiveIntensity={1.9}
                transparent
                opacity={0.75}
              />
            </mesh>
          )}
        </group>
      </Float>

      <Sparkles
        count={85}
        scale={[6, 5, 5]}
        size={1.5}
        speed={0.22}
        color="#f43f5e"
        opacity={0.5}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
      />
    </>
  );
}

export function ExperienceGlobeCanvas({
  count,
  activeIndex,
  onSelectIndex,
}: GlobeSceneProps) {
  return (
    <SafeCanvas
      fallbackImageUrl="/assets/visuals/section-experience.webp"
      fallbackAlt="3D interactive career experience globe"
      className="h-full w-full"
      cameraPosition={[0, 0.25, 4.75]}
      fov={42}
    >
      <KineticExperienceGlobe
        count={count}
        activeIndex={activeIndex}
        onSelectIndex={onSelectIndex}
      />
    </SafeCanvas>
  );
}
