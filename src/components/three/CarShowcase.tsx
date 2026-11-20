
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";

function DemoCar() {
  return (
    <group position={[0, 0.15, 0]}>
      {/* Кузов машины */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[2.6, 0.45, 1.25]} />
        <meshStandardMaterial
          color="#ff6500"
          metalness={0.65}
          roughness={0.25}
        />
      </mesh>

      {/* Кабина */}
      <mesh position={[-0.25, 0.85, 0]}>
        <boxGeometry args={[1.25, 0.45, 1.05]} />
        <meshStandardMaterial
          color="#181818"
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>

      {/* Четыре колеса */}
      {[-0.85, 0.85].map((x) =>
        [-0.7, 0.7].map((z) => (
          <mesh
            key={`${x}-${z}`}
            position={[x, 0.2, z]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.35, 0.35, 0.22, 32]} />
            <meshStandardMaterial
              color="#101010"
              roughness={0.85}
            />
          </mesh>
        ))
      )}
    </group>
  );
}

export default function CarShowcase() {
  return (
    <div className="h-[420px] w-full md:h-[560px]">
      <Canvas
        camera={{ position: [4, 2.8, 5], fov: 40 }}
        dpr={[1, 1.75]}
      >
        <color attach="background" args={["#080808"]} />

        <ambientLight intensity={1.2} />

        <directionalLight
          position={[4, 7, 5]}
          intensity={3}
        />

        <pointLight
          position={[-4, 3, -2]}
          intensity={35}
          color="#ff6500"
        />

        <DemoCar />

        <ContactShadows
          position={[0, -0.05, 0]}
          opacity={0.5}
          scale={8}
          blur={2.5}
          far={4}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}
