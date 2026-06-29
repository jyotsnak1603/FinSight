"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

function NeuralGlobe() {
  const group = useRef();
  const { theme } = useTheme();
  
  // Decide colors based on theme
  const isDark = theme === "dark" || !theme;
  const sphereColor = isDark ? "#0d1526" : "#f8fafc";
  const lineColor = isDark ? "#10b981" : "#059669"; // Emerald
  const nodeColor = isDark ? "#3b82f6" : "#2563eb"; // Blue

  // Generate random points for the network
  const particlesCount = 150;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particlesCount);
      const theta = Math.sqrt(particlesCount * Math.PI) * phi;
      const r = 2.5; // Radius
      pos[i * 3] = r * Math.cos(theta) * Math.sin(phi);
      pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.cos(phi);
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
        if (p1.distanceTo(p2) < 1.2) {
          linePoints.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
      }
    }
    return new Float32Array(linePoints);
  }, [positions, particlesCount]);

  useFrame((state, delta) => {
    group.current.rotation.y += delta * 0.1;
    group.current.rotation.x += delta * 0.05;
  });

  return (
    <group ref={group}>
      {/* Central Globe */}
      <Sphere args={[2.4, 32, 32]}>
        <meshStandardMaterial color={sphereColor} transparent opacity={0.6} wireframe={isDark} />
      </Sphere>

      {/* Nodes */}
      <Points positions={positions}>
        <PointMaterial transparent color={nodeColor} size={0.08} sizeAttenuation={true} depthWrite={false} />
      </Points>

      {/* Connections */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={lines.length / 3}
            array={lines}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={lineColor} transparent opacity={0.2} />
      </lineSegments>
    </group>
  );
}

export default function Hero3D() {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <NeuralGlobe />
      </Canvas>
    </div>
  );
}
