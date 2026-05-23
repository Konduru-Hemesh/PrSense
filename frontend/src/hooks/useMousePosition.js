import { useEffect, useState } from 'react';

export default function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (event) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      setPosition({
        x: (event.clientX / width) * 2 - 1,
        y: (event.clientY / height) * 2 - 1,
      });
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return position;
}
