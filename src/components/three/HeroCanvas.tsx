"use client";

import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SafeCanvas } from "./SafeCanvas";

interface HeroSceneProps {
  scrollProgressRef: React.MutableRefObject<number>;
  distortion?: number;
  particleCount?: number;
  rotationSpeed?: number;
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float dist = distance(uv, uPointer * 0.5 + 0.5);
    float waveA = sin(pos.x * 1.15 + uTime * 0.45) * cos(pos.y * 0.95 - uTime * 0.35) * 0.42;
    float waveB = sin((pos.x + pos.y) * 0.7 - uTime * 0.3) * 0.25;
    float ripple = exp(-dist * 3.8) * sin(dist * 14.0 - uTime * 2.2) * 0.28;

    pos.z += waveA + waveB + ripple;
    vElevation = pos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vec3 voidBlack = vec3(0.016, 0.020, 0.032);
    vec3 slateSilk = vec3(0.055, 0.075, 0.115);
    vec3 iceCyan = vec3(0.0, 0.78, 0.92);
    vec3 deepViolet = vec3(0.45, 0.18, 0.78);

    float ridge = smoothstep(-0.35, 0.58, vElevation);
    float contour = smoothstep(0.035, 0.0, abs(fract(vElevation * 4.5) - 0.5));

    vec3 col = mix(voidBlack, slateSilk, ridge * 0.75);
    col += iceCyan * contour * 0.14;
    col += deepViolet * pow(max(0.0, ridge), 2.5) * 0.14;

    // Soft radial vignette fade into void
    float radialFade = 1.0 - smoothstep(0.28, 0.74, length(vUv - vec2(0.58, 0.5)));
    float alpha = clamp(0.18 + ridge * 0.5, 0.0, 0.85) * radialFade;

    gl_FragColor = vec4(col, alpha);
  }
`;

function GLSLSilkTerrain() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    matRef.current.uniforms.uPointer.value.lerp(state.pointer, 0.06);
  });

  return (
    <mesh position={[0.9, -0.35, -3.2]} rotation={[-0.55, 0.12, -0.08]}>
      <planeGeometry args={[16, 10, 96, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function ArchitecturalGyroCore({
  scrollProgressRef,
  rotationSpeed = 0.24,
}: HeroSceneProps) {
  const { size } = useThree();
  const assemblyRef = useRef<THREE.Group>(null);
  const coreKnotRef = useRef<THREE.Mesh>(null);
  const innerReactorRef = useRef<THREE.Mesh>(null);
  const ringOuterRef = useRef<THREE.Mesh>(null);
  const ringMidRef = useRef<THREE.Mesh>(null);
  const ringInnerRef = useRef<THREE.Mesh>(null);

  const isDesktop = size.width >= 960;
  const targetX = isDesktop ? 1.85 : 0;
  const targetScale = isDesktop ? 1.02 : 0.72;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const scroll = scrollProgressRef.current || 0;

    if (assemblyRef.current) {
      assemblyRef.current.position.x = THREE.MathUtils.lerp(
        assemblyRef.current.position.x,
        targetX + state.pointer.x * 0.18,
        0.05
      );
      assemblyRef.current.position.y =
        Math.sin(t * 0.75) * 0.09 - scroll * 0.6 + state.pointer.y * 0.12;
      assemblyRef.current.scale.setScalar(
        THREE.MathUtils.lerp(assemblyRef.current.scale.x, targetScale, 0.08)
      );
    }

    if (coreKnotRef.current) {
      coreKnotRef.current.rotation.y += delta * rotationSpeed;
      coreKnotRef.current.rotation.x += delta * rotationSpeed * 0.42;
    }

    if (innerReactorRef.current) {
      innerReactorRef.current.rotation.y -= delta * 0.55;
      const pulse = 1 + Math.sin(t * 2.0) * 0.05;
      innerReactorRef.current.scale.setScalar(pulse);
    }

    if (ringOuterRef.current) {
      ringOuterRef.current.rotation.z += delta * 0.28;
      ringOuterRef.current.rotation.x = Math.PI * 0.34 + Math.sin(t * 0.35) * 0.08;
    }

    if (ringMidRef.current) {
      ringMidRef.current.rotation.z -= delta * 0.36;
      ringMidRef.current.rotation.y = Math.PI * 0.28 + Math.cos(t * 0.32) * 0.1;
    }

    if (ringInnerRef.current) {
      ringInnerRef.current.rotation.x += delta * 0.32;
    }
  });

  return (
    <>
      <ambientLight intensity={0.38} />
      <directionalLight position={[5, 6, 5]} intensity={2.4} color="#ffffff" />
      <pointLight position={[-3.5, 2.5, 4]} intensity={3.4} color="#00e5ff" distance={16} />
      <pointLight position={[4.5, -2.5, 3]} intensity={2.6} color="#9333ea" distance={16} />
      <pointLight position={[1.5, -2, -3]} intensity={2.2} color="#f43f5e" distance={14} />

      <GLSLSilkTerrain />

      <group ref={assemblyRef} position={[targetX, 0, 0]}>
        <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.18}>
          {/* Sculpted Obsidian-Iridescent Torus-Knot Core */}
          <mesh ref={coreKnotRef}>
            <torusKnotGeometry args={[0.92, 0.26, 200, 36, 2, 3]} />
            <meshPhysicalMaterial
              color="#141d30"
              metalness={0.96}
              roughness={0.07}
              clearcoat={1}
              clearcoatRoughness={0.05}
              iridescence={1}
              iridescenceIOR={1.8}
              iridescenceThicknessRange={[180, 720]}
              envMapIntensity={2.5}
            />
          </mesh>

          {/* Subtle Cyan Reactor Center */}
          <mesh ref={innerReactorRef}>
            <octahedronGeometry args={[0.38, 0]} />
            <meshStandardMaterial
              color="#7deeff"
              emissive="#00e5ff"
              emissiveIntensity={2.0}
              metalness={0.5}
              roughness={0.14}
            />
          </mesh>

          {/* Outer Precision Cyan Gimbal Ring */}
          <mesh ref={ringOuterRef} rotation={[Math.PI * 0.34, 0.25, 0]}>
            <torusGeometry args={[2.06, 0.028, 20, 128]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              emissive="#00e5ff"
              emissiveIntensity={1.35}
              metalness={0.9}
              roughness={0.14}
              iridescence={0.8}
            />
          </mesh>

          {/* Middle Violet Orbital Track */}
          <mesh ref={ringMidRef} rotation={[-Math.PI * 0.28, Math.PI * 0.28, 0]}>
            <torusGeometry args={[1.8, 0.02, 18, 128]} />
            <meshStandardMaterial
              color="#c084fc"
              emissive="#9333ea"
              emissiveIntensity={1.35}
              metalness={0.88}
              roughness={0.16}
            />
          </mesh>

          {/* Inner Rose-Crimson Rim Ring */}
          <mesh ref={ringInnerRef} rotation={[Math.PI * 0.5, -0.35, 0.2]}>
            <torusGeometry args={[1.62, 0.016, 16, 120]} />
            <meshStandardMaterial
              color="#fb7185"
              emissive="#f43f5e"
              emissiveIntensity={1.15}
              metalness={0.92}
              roughness={0.14}
            />
          </mesh>
        </Float>
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.55}
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
      fallbackAlt="Indrajeet Kumar (Shourya Sinha) full-bleed GLSL and 3D hero scene"
      className="h-full w-full"
      cameraPosition={[0, 0.2, 6.2]}
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
