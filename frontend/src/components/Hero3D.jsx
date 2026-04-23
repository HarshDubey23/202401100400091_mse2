import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";

function Blob() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshDistortMaterial
          color="#6C63FF"
          distort={0.4}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div style={{ height: "300px" }}>
      <Canvas>
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 2, 2]} />
        <Blob />
      </Canvas>
    </div>
  );
}