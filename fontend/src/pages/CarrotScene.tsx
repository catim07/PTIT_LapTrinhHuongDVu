'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { TweenMax, Power0, Sine } from 'gsap';

const internals = {
  randomIntFromInterval: (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1) + min),

  materials: {
    orange: new THREE.MeshPhongMaterial({ color: 0xb7513c, flatShading: true, shininess: 0 }),
    green: new THREE.MeshPhongMaterial({ color: 0x379351, flatShading: true, shininess: 0 }),
    brown: new THREE.MeshPhongMaterial({ color: 0x5c2c22, flatShading: true, shininess: 0 }),
    pink: new THREE.MeshPhongMaterial({ color: 0xb1325e, flatShading: true, shininess: 0 }),
    gray: new THREE.MeshPhongMaterial({ color: 0x333333, flatShading: true, shininess: 0 }), // mắt tối hơn, sắc nét
    clouds: new THREE.MeshPhongMaterial({ color: 0xeeeeee, flatShading: true, shininess: 0 }),
    rabbit: new THREE.MeshPhongMaterial({ color: 0xeeeeee, flatShading: true, shininess: 0 }), // trắng hơn
  } as const,
};

// =============== CLOUD ===============
const Cloud: React.FC<{ y?: number; z?: number; delay?: number }> = ({ y = 0, z = 0, delay = 0 }) => {
  const ref = useRef<THREE.Group>(null!);

  useEffect(() => {
    const group = ref.current;
    if (!group) return;
    TweenMax.to(group.position, 3.5, {
      x: -200,
      repeat: -1,
      delay,
      onRepeat: () => { group.position.y = internals.randomIntFromInterval(-10, 20); },
    });
  }, [delay]);

  return (
    <group ref={ref} position={[200, y, z]}>
      <mesh material={internals.materials.clouds}>
        <sphereGeometry args={[5, 4, 6]} />
      </mesh>
      <mesh material={internals.materials.clouds} position={[5, -1.5, 2]} scale={[0.55, 0.35, 1]}>
        <sphereGeometry args={[5, 4, 6]} />
      </mesh>
      <mesh material={internals.materials.clouds} position={[-5.5, -2, -1]} scale={[0.75, 0.5, 1]}>
        <sphereGeometry args={[5, 4, 6]} />
      </mesh>
    </group>
  );
};

// =============== PILOT (đã tinh chỉnh mắt, mũi, tai sắc nét hơn) ===============
const Pilot: React.FC = () => {
  const earPivotL = useRef<THREE.Group>(null!);
  const earPivotR = useRef<THREE.Group>(null!);
  const eyeL = useRef<THREE.Mesh>(null!);
  const eyeR = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    if (!earPivotL.current || !earPivotR.current) return;

    TweenMax.to(earPivotL.current.rotation, 0.1, { x: Math.sin(-Math.PI / 3), repeat: -1, yoyo: true });
    TweenMax.to(earPivotR.current.rotation, 0.1, { x: -Math.PI / 2.25, repeat: -1, yoyo: true });

    TweenMax.to(eyeL.current.scale, 0.5, { y: 0.1, repeat: -1, yoyo: true, delay: 5, repeatDelay: 3 });
    TweenMax.to(eyeR.current.scale, 0.5, { y: 0.1, repeat: -1, yoyo: true, delay: 5, repeatDelay: 3 });
  }, []);

  return (
    <group rotation={[1.5, 0, 0]} position={[0, 7, 5]}>
      {/* Thân thỏ trắng */}
      <mesh material={internals.materials.rabbit} position={[0, 1, 4]}>
        <boxGeometry args={[5, 5, 5]} />
      </mesh>

      {/* Ghế nâu */}
      <mesh material={internals.materials.brown} position={[0, -2.5, 0]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[6, 1, 6]} />
      </mesh>

      {/* Tai trái */}
      <group ref={earPivotL}>
        <group position={[-1.5, 3.2, 0]}>
          <mesh material={internals.materials.rabbit}>
            <boxGeometry args={[2, 7.5, 0.6]} />
          </mesh>
          <mesh material={internals.materials.pink} scale={[0.55, 0.75, 0.6]} position={[0, 0, 0.25]}>
            <boxGeometry args={[2, 7.5, 0.6]} />
          </mesh>
        </group>
      </group>

      {/* Tai phải */}
      <group ref={earPivotR}>
        <group position={[1.5, 3.2, 0]}>
          <mesh material={internals.materials.rabbit}>
            <boxGeometry args={[2, 7.5, 0.6]} />
          </mesh>
          <mesh material={internals.materials.pink} scale={[0.55, 0.75, 0.6]} position={[0, 0, 0.25]}>
            <boxGeometry args={[2, 7.5, 0.6]} />
          </mesh>
        </group>
      </group>

      {/* Mắt (sắc nét, to hơn) */}
      <mesh ref={eyeL} material={internals.materials.gray} position={[1.1, 1.1, 3.1]}>
        <boxGeometry args={[0.7, 1.1, 0.6]} />
      </mesh>
      <mesh ref={eyeR} material={internals.materials.gray} position={[-1.1, 1.1, 3.1]}>
        <boxGeometry args={[0.7, 1.1, 0.6]} />
      </mesh>

      {/* Mũi hồng */}
      <mesh material={internals.materials.pink} position={[0, 0.1, 3.3]}>
        <boxGeometry args={[0.7, 0.6, 0.7]} />
      </mesh>

      {/* Miệng */}
      <mesh material={internals.materials.gray} position={[0, -0.9, 3.1]}>
        <boxGeometry args={[0.4, 0.3, 0.5]} />
      </mesh>
    </group>
  );
};

// =============== CARROT ===============
const Carrot: React.FC = () => {
  const carrotRef = useRef<THREE.Group>(null!);
  const leafsRef = useRef<THREE.Group>(null!);

  useEffect(() => {
    if (!carrotRef.current || !leafsRef.current) return;

    TweenMax.to(carrotRef.current.position, 1, { x: -2, y: 4, repeat: -1, yoyo: true, ease: Sine.easeInOut });
    TweenMax.to(carrotRef.current.rotation, 1, { x: -1.7, repeat: -1, yoyo: true, ease: Sine.easeInOut });
    TweenMax.to(leafsRef.current.rotation, 0.1, { y: Math.PI, repeat: -1, ease: Power0.easeNone });
  }, []);

  return (
    <group ref={carrotRef} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
      <mesh material={internals.materials.orange}>
        <cylinderGeometry args={[5, 2.2, 26, 32]} />
      </mesh>

      <group>
        <mesh material={internals.materials.brown} position={[6.5, 3, 1]}>
          <boxGeometry args={[8, 7, 0.6]} />
        </mesh>
        <mesh material={internals.materials.brown} position={[-6.5, 3, 1]} rotation={[0, Math.PI, 0]}>
          <boxGeometry args={[8, 7, 0.6]} />
        </mesh>
      </group>

      <group ref={leafsRef}>
        <mesh material={internals.materials.green} position={[0, 17, 0]}>
          <cylinderGeometry args={[1.8, 1.2, 6, 4]} />
        </mesh>
        <mesh material={internals.materials.green} position={[-2, 15.5, 0]} rotation={[0, 0, 0.45]}>
          <cylinderGeometry args={[1.6, 1, 5.5, 4]} />
        </mesh>
        <mesh material={internals.materials.green} position={[2, 15.5, 0]} rotation={[0, 0, -0.45]}>
          <cylinderGeometry args={[1.6, 1, 5.5, 4]} />
        </mesh>
      </group>

      <Pilot />
    </group>
  );
};

// =============== SCENE ===============
const Scene: React.FC = () => {
  const { scene } = useThree();

  useEffect(() => {
    const dir = new THREE.DirectionalLight(0xffffff, 1.3);
    dir.position.set(35, 28, 15);
    dir.castShadow = true;
    scene.add(new THREE.AmbientLight(0xc5f5f5, 0.95));
    scene.add(dir);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshBasicMaterial({ color: 0xe0dacd })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -100;
    scene.add(floor);

    scene.fog = new THREE.Fog(0xd5f8f8, 100, 300);
  }, [scene]);

  return (
    <>
      <Carrot />
      <Cloud y={-5} z={20} />
      <Cloud y={0} z={10} delay={1} />
      <Cloud y={15} z={-10} delay={0.5} />
      <Cloud y={-15} z={10} delay={2} />
    </>
  );
};

const CarrotScene: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#c5f5f5', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [40, 22, 105], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <Scene />
        <OrbitControls minDistance={45} maxDistance={260} />
      </Canvas>

      <div className="credits">
        <span>
          by &nbsp;
          <a href="https://twitter.com/pixelia_me" rel="noopener noreferrer" target="_blank" title="Noel Delgado">
            <svg height="12" viewBox="0 0 57 30">
              <path d="M28.1312,9.5341 C29.7966,9.5341 32.1025,10.627 34.248,12.368 C49.3297,11.5836 53.8793,-0.4796 55.5773,0.6783 C57.8326,3.2476 50.8638,16.3535 39.4,19.088 C39.8655,20.2628 40.1364,21.4786 40.1364,22.6983 C40.1364,25.9478 38.837,26.7409 36.7281,28.8974 L36.704,28.824 C36.4799,29.0276 36.208,29.2318 35.8945,29.4 C35.8945,29.4 36.1346,27.0065 34.9341,26.7672 C34.9341,26.7672 34.3739,27.4054 33.0133,27.2459 C32.8532,25.8896 32.293,25.4109 32.1329,25.3311 C31.4126,25.4109 30.9324,26.5278 30.132,26.5278 C29.8,26.1969 29.5184,25.5615 29.312,24.972 C29.0201,25.4221 28.6036,26.1128 28.2512,26.2885 C27.8796,26.2885 27.1476,25.2858 26.836,24.832 C26.6262,25.4581 26.3285,26.1707 25.9702,26.5278 C25.1699,26.5278 24.6896,25.4109 23.9694,25.3311 C23.8093,25.4109 23.249,25.8896 23.089,27.2459 C21.7284,27.4054 21.1681,26.7672 21.1681,26.7672 C19.9676,27.0065 20.2077,29.4 20.2077,29.4 C19.6122,29.0804 19.1739,28.6307 18.908,28.304 L18.8667,28.3947 C17.1544,26.3262 16.1259,25.5896 16.1259,22.6983 C16.1259,21.4938 16.3637,20.2895 16.784,19.128 C5.2094,16.4922 -1.8448,3.2615 0.4227,0.6783 C2.119,-0.4785 6.6627,11.5578 21.708,12.364 C23.8143,10.6244 26.1724,9.5341 28.1312,9.5341 Z M28.8514,20.3048 C28.8514,20.3048 30.4121,21.7409 32.213,21.7409 C34.0137,21.7409 35.3343,19.3474 35.3343,19.3474 L28.8514,20.3048 Z M20.6879,19.3474 C20.6879,19.3474 22.2486,21.7409 24.0494,21.7409 C25.8502,21.7409 27.1707,20.3048 27.1707,20.3048 L20.6879,19.3474 Z" fillRule="evenodd" />
            </svg>
          </a>
        </span>
      </div>

      <style>{`
        .credits {
          position: fixed; bottom: 1rem; right: 1rem;
          font-family: Open Sans, sans-serif; font-size: 0.55rem;
          color: #666; z-index: 100;
        }
        .credits > span { display: flex; align-items: center; justify-content: flex-end; padding-top: 0.5rem; }
      `}</style>
    </div>
  );
};

export default CarrotScene;