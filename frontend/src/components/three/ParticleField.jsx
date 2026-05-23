import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Points, PointsMaterial } from 'three';
import useMousePosition from '../../hooks/useMousePosition';

function supportsWebGL() {
  if (typeof window === 'undefined') {
    return true;
  }

  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch (error) {
    return false;
  }
}

function buildGeometry() {
  const count = 1400;
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const positionOffset = index * 3;
    positions[positionOffset] = (Math.random() - 0.5) * 40;
    positions[positionOffset + 1] = (Math.random() - 0.5) * 40;
    positions[positionOffset + 2] = (Math.random() - 0.5) * 18 - 20;
    velocities[positionOffset] = (Math.random() - 0.5) * 0.004;
    velocities[positionOffset + 1] = (Math.random() - 0.5) * 0.004;
    velocities[positionOffset + 2] = (Math.random() - 0.5) * 0.0015;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new BufferAttribute(velocities, 3));
  return geometry;
}

function ParticleCloud() {
  const pointsRef = useRef();
  const mouse = useMousePosition();
  const geometry = useMemo(() => buildGeometry(), []);

  useFrame(() => {
    if (!pointsRef.current) {
      return;
    }

    const points = pointsRef.current;
    const positionAttribute = points.geometry.getAttribute('position');
    const velocityAttribute = points.geometry.getAttribute('velocity');
    const positions = positionAttribute.array;
    const velocities = velocityAttribute.array;

    for (let index = 0; index < positions.length; index += 3) {
      positions[index] += velocities[index];
      positions[index + 1] += velocities[index + 1];
      positions[index + 2] += velocities[index + 2];

      if (positions[index] > 20 || positions[index] < -20) velocities[index] *= -1;
      if (positions[index + 1] > 20 || positions[index + 1] < -20) velocities[index + 1] *= -1;
      if (positions[index + 2] > 10 || positions[index + 2] < -20) velocities[index + 2] *= -1;
    }

    positionAttribute.needsUpdate = true;
    points.rotation.y += 0.00008;
    points.rotation.x += (mouse.y * 0.2 - points.rotation.x) * 0.01;
    points.rotation.y += (mouse.x * 0.15 - points.rotation.y) * 0.01;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        color="#8b5cf6"
        transparent
        opacity={0.25}
        sizeAttenuation
      />
    </points>
  );
}

export default function ParticleField() {
  if (!supportsWebGL()) {
    return null;
  }

  return <ParticleCloud />;
}
