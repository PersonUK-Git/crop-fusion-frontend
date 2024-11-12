import "./Model.css";
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Sparkles } from '@react-three/drei';

//------------------------------------------------------------------

function Model(props) {
  const model = props.model;
  const ref = useRef();

  // Set initial position and scale
  model.scene.scale.set(1, 1, 1);
  model.scene.position.set(0, 1.1, 0); // Adjusted to center the model

  // Animation logic for rotation
  useFrame(() => {
    ref.current.rotation.y += 0.01; // Rotate around the Y-axis
  });

  return (
    <group ref={ref}>
      <primitive object={model.scene} />
    </group>
  );
}

//------------------------------------------------------------------

// Add Lights with Helper

const Light = () => {
  const ref = useRef();
  useFrame(() => {
    const time = window.performance.now();
    const radius = 4;
    const speed = 0.001;
    const x = radius * Math.cos(time * speed);
    ref.current.position.set(x, 4, 0);
  });

  return (
    <>
      <pointLight args={[0xf5f5f5, 1, 100]} position={[2, 4, 0]} ref={ref} />
    </>
  );
}

const FarmLight = () => {
  const ref = useRef();
  return (
    <>
      <pointLight args={[0xFFE1A8, 1, 100]} position={[-2, 1, 3]} ref={ref} />
    </>
  );
}

//------------------------------------------------------------------

const alpha = 0; // canvas background opacity

const ThreeApp = (props) => {
  return (
    <Canvas onCreated={state => state.gl.setClearAlpha(alpha)} >
      <PerspectiveCamera makeDefault position={[0, 4.5, 8.5]} />
      <Sparkles count={230} size={4} scale={12} position={[-3, 1, 4]} color={0xFFA500} />
      <Light />
      <FarmLight />
      <Model model={props.model} />
    </Canvas>
  );
}

const Background3D = (props) => {
  const CanvasSize = { height: "100vh", width: "100vw" };
  return (
    <div id="container" style={CanvasSize}>
      <ThreeApp model={props.model} />
    </div>
  );
}

export default Background3D;