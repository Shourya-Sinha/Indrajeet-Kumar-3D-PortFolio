"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { SafeCanvas } from "./SafeCanvas";

export interface GraphNodeSpec {
  id: string;
  label: string;
  pos: [number, number, number];
  critical: boolean;
  risk: number;
}

const NODES: GraphNodeSpec[] = [
  { id: "internet", label: "External Internet", pos: [-3.1, 0.6, 0.8], critical: true, risk: 0.92 },
  { id: "cdn", label: "Edge WAF / CDN", pos: [-1.8, 1.35, -0.3], critical: false, risk: 0.35 },
  { id: "api", label: "API Gateway", pos: [-1.35, -0.15, 0.65], critical: true, risk: 0.78 },
  { id: "auth", label: "JWT / Auth Service", pos: [0.05, 0.45, -0.15], critical: true, risk: 0.84 },
  { id: "worker", label: "CI / Build Runner", pos: [0.3, -1.15, 0.9], critical: false, risk: 0.48 },
  { id: "k8s", label: "Internal Cluster", pos: [1.45, 0.95, 0.45], critical: false, risk: 0.62 },
  { id: "iam", label: "Privileged Admin Role", pos: [1.65, -0.25, -0.3], critical: true, risk: 0.89 },
  { id: "db", label: "Crown Jewel DB", pos: [3.1, 0.35, 0.15], critical: true, risk: 0.98 },
];

const ALL_EDGES: Array<[number, number, boolean]> = [
  [0, 1, false],
  [1, 3, false],
  [3, 5, false],
  [5, 7, false],
  [2, 4, false],
  [4, 6, false],
  [0, 2, true],
  [2, 3, true],
  [3, 6, true],
  [6, 7, true],
];

function AttackGraphScene({ highlightCritical }: { highlightCritical: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  const criticalWaypoints = useMemo(
    () => [NODES[0].pos, NODES[2].pos, NODES[3].pos, NODES[6].pos, NODES[7].pos].map(
      (p) => new THREE.Vector3(...p)
    ),
    []
  );

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.28) * 0.22;
    }
    if (pulseRef.current && highlightCritical) {
      const cycle = (state.clock.elapsedTime * 0.45) % 1;
      const segFloat = cycle * (criticalWaypoints.length - 1);
      const idx = Math.min(criticalWaypoints.length - 2, Math.floor(segFloat));
      const frac = segFloat - idx;
      pulseRef.current.position.lerpVectors(
        criticalWaypoints[idx],
        criticalWaypoints[idx + 1],
        frac
      );
      pulseRef.current.rotation.x += delta * 3;
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 4]} intensity={2.1} color="#ffffff" />
      <pointLight position={[-3, 1, 3]} intensity={2.8} color="#00e5ff" distance={12} />
      <pointLight position={[3, 0, -2]} intensity={2.5} color="#8b5cf6" distance={12} />

      <group ref={groupRef}>
        {ALL_EDGES.map(([a, b, isCrit], idx) => (
          <Line
            key={idx}
            points={[NODES[a].pos, NODES[b].pos]}
            color={isCrit && highlightCritical ? "#00e5ff" : "#334155"}
            lineWidth={isCrit && highlightCritical ? 3 : 1}
            transparent
            opacity={isCrit && highlightCritical ? 0.95 : 0.45}
          />
        ))}

        {NODES.map((node) => {
          const active = node.critical && highlightCritical;
          const isDb = node.id === "db";
          return (
            <group key={node.id} position={node.pos}>
              <mesh>
                {isDb ? (
                  <boxGeometry args={[0.48, 0.48, 0.48]} />
                ) : (
                  <sphereGeometry args={[active ? 0.26 : 0.19, 24, 24]} />
                )}
                <meshStandardMaterial
                  color={isDb ? "#f43f5e" : active ? "#00e5ff" : "#64748b"}
                  emissive={isDb ? "#f43f5e" : active ? "#00e5ff" : "#8b5cf6"}
                  emissiveIntensity={active ? 1.45 : 0.3}
                  metalness={0.85}
                  roughness={0.2}
                />
              </mesh>
              {active && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.32, 0.36, 32]} />
                  <meshBasicMaterial
                    color={isDb ? "#f43f5e" : "#00e5ff"}
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.75}
                  />
                </mesh>
              )}
            </group>
          );
        })}

        {highlightCritical && (
          <mesh ref={pulseRef}>
            <octahedronGeometry args={[0.13, 0]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        )}
      </group>

      <Sparkles count={70} scale={[8, 4, 4]} size={1.5} speed={0.25} color="#00e5ff" />
    </>
  );
}

export function AttackGraph3DCanvas({
  highlightCritical = true,
}: {
  highlightCritical?: boolean;
}) {
  return (
    <SafeCanvas
      fallbackImageUrl="/assets/visuals/project-attack-path.webp"
      fallbackAlt="3D Attack Path Discovery critical lateral movement graph"
      className="h-full w-full"
      cameraPosition={[0, 0.5, 6.2]}
      fov={42}
    >
      <AttackGraphScene highlightCritical={highlightCritical} />
    </SafeCanvas>
  );
}
