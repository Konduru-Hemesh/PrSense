import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PointLight, MeshStandardMaterial } from 'three';
import useMousePosition from '../../hooks/useMousePosition';

function Orb({ color, position, mouse }) {
  const ref = useRef();
  const materialRef = useRef();
  const base = useMemo(() => ({ x: position[0], y: position[1], z: position[2] }), [position]);
  const speed = useMemo(() => 0.35 + Math.random() * 0.35, []);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const time = clock.getElapsedTime();
    const driftX = Math.sin(time * speed + phase) * 0.55;
    const driftY = Math.cos(time * speed * 0.9 + phase) * 0.55;
    const targetX = base.x + driftX + Math.max(-0.5, Math.min(0.5, mouse.x * 0.5));
    const targetY = base.y + driftY + Math.max(-0.5, Math.min(0.5, mouse.y * 0.5));

    ref.current.position.x += (targetX - ref.current.position.x) * 0.02;
    ref.current.position.y += (targetY - ref.current.position.y) * 0.02;
    ref.current.rotation.x += 0.0015;
    ref.current.rotation.y += 0.001;

    if (materialRef.current instanceof MeshStandardMaterial) {
      materialRef.current.emissiveIntensity = 0.08 + Math.sin(time * 2 + phase) * 0.015;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[position[3], 20, 20]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#050508"
        emissive={color}
        emissiveIntensity={0.08}
        roughness={0}
        metalness={0.1}
        transparent
        opacity={0.08}
      />
    </mesh>
  );
}

export default function FloatingOrbs() {
  const mouse = useMousePosition();
  const pointLightPurple = useRef();
  const pointLightCyan = useRef();

  const orbs = useMemo(
    () => [
      { color: '#8b5cf6', position: [-8, 6, -20], size: 0.18 },
      { color: '#8b5cf6', position: [7, 4, -24], size: 0.14 },
      { color: '#8b5cf6', position: [-3, -2, -26], size: 0.1 },
      { color: '#06b6d4', position: [8, -5, -28], size: 0.16 },
      { color: '#06b6d4', position: [-7, -6, -30], size: 0.12 },
      { color: '#ec4899', position: [1, 5, -22], size: 0.09 },
    ],
    [],
  );

  useFrame(() => {
    if (pointLightPurple.current) {
      pointLightPurple.current.position.x += (mouse.x * 4 - pointLightPurple.current.position.x) * 0.02;
      pointLightPurple.current.position.y += (-mouse.y * 2 - pointLightPurple.current.position.y) * 0.02;
    }
    if (pointLightCyan.current) {
      pointLightCyan.current.position.x += (-mouse.x * 4 - pointLightCyan.current.position.x) * 0.02;
      pointLightCyan.current.position.y += (mouse.y * 2 - pointLightCyan.current.position.y) * 0.02;
    }
  });

  return (
    <group>
      <pointLight ref={pointLightPurple} color="#8b5cf6" intensity={0.18} distance={14} position={[-5, 4, 0]} />
      <pointLight ref={pointLightCyan} color="#06b6d4" intensity={0.18} distance={14} position={[5, -3, 0]} />
      {orbs.map((orb) => (
        <Orb key={`${orb.color}-${orb.position.join('-')}`} color={orb.color} position={[orb.position[0], orb.position[1], orb.position[2], orb.size]} mouse={mouse} />
      ))}
    </group>
  );
}
