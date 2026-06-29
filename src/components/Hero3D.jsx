"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

function FullScreenNetwork() {
  const group = useRef();
  const { theme, resolvedTheme } = useTheme();
  
  const isDark = resolvedTheme === "dark" || (!resolvedTheme && theme !== "light");
  const fogColor = isDark ? "#060b18" : "#f4f6fa";
  const lineColor = isDark ? "#10b981" : "#94a3b8"; // Emerald or muted slate
  const nodeColor = isDark ? "#3b82f6" : "#64748b"; // Blue or muted blue

  // Generate random points in a wide area
  const particlesCount = 450;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      // spread them widely across x and y, but keep z somewhat tight so they stay in view
      pos[i * 3] = (Math.random() - 0.5) * 22;     // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12; // z
    }
    return pos;
  }, [particlesCount]);

  // Connect close points with lines
  const lines = useMemo(() => {
    const linePoints = [];
    for (let i = 0; i < particlesCount; i++) {
      for (let j = i + 1; j < particlesCount; j++) {
        const p1 = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        const p2 = new THREE.Vector3(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
        if (p1.distanceTo(p2) < 2.0) {
          linePoints.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
      }
    }
    return new Float32Array(linePoints);
  }, [positions, particlesCount]);

  useFrame((state, delta) => {
    // slow rotation
    group.current.rotation.y += delta * 0.05;
    group.current.rotation.x += delta * 0.02;
    // gentle floating
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
  });

  return (
    <>
      <fog attach="fog" args={[fogColor, 5, 16]} />
      <group ref={group}>
        <Points positions={positions}>
          <PointMaterial transparent color={nodeColor} size={0.06} sizeAttenuation={true} depthWrite={false} />
        </Points>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={lines.length / 3}
              array={lines}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={lineColor} transparent opacity={isDark ? 0.25 : 0.3} />
        </lineSegments>
      </group>
    </>
  );
}

export default function Hero3D() {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
        <FullScreenNetwork />
      </Canvas>
    </div>
  );
}
