import { useFrame } from 'react-three-fiber';
import * as THREE from 'three';
import { ShaderMaterial, SphereGeometry } from 'three';
import React from 'react';
import { useRef } from 'react';

import { XYSphere } from '../Primitives/PrimitiveSphere';



function ExtragalacticObject(){
    const ref = useRef();

    const createNoiseTexture = (size) => {
        
        const area = size*size;
        const texture_data = new Uint8Array(4*area);
        
        for (let i = 0; i < area; i++) {
            const stride = i * 4;
            texture_data[ stride ] = 0 + Math.random()*255;
            
            texture_data[ stride + 1 ] = 0 + Math.random()*255;
            texture_data[ stride + 2 ] = 0 + Math.random()*255;
            texture_data[ stride + 3 ] = 255;
        }   

        //https://threejs.org/docs/#api/en/textures/DataTexture
        const texture = new THREE.DataTexture(texture_data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
        texture.needsUpdate = true; //what does this do?
        return texture;

    }

    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform sampler2D noiseTexture;
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix*normal);

            float surfaceOffset = 0.000001;
            vec2 normalUV = clamp(uv,0.2,0.9);
            vec4 noise = texture2D(noiseTexture, normalUV);
            
            float noiseScore = (noise.x + noise.y + noise.z)/3.0;

            float height = noiseScore;


            vec3 surface_vertex = position + (normalize(normal) * height);
            //surface_vertex = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(surface_vertex,1.0);
        }
    `;

    const fragmentShader = `
        uniform sampler2D noiseTexture;
        varying vec2 vUv;
        void main() {
            vec4 noise = texture2D(noiseTexture, vUv);
            gl_FragColor = vec4(vUv.x,vUv.x,vUv.x, 1.0);
            //gl_FragColor = noise;
        }
    `;

    const noiseTexture = createNoiseTexture(64);
    const material = new ShaderMaterial({
        uniforms: {
            noiseTexture: { value: noiseTexture }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });





    
    useFrame((state,delta) => {
        //ref.current.rotation.x += 0.01;
        //ref.current.rotation.y += 0.01;
    });
    
    const geometry = new THREE.SphereGeometry(1.0, 128, 128);
    const sphere_geometry = XYSphere(1.0, 10, 10);
    return <mesh ref={ref} material={material} geometry={sphere_geometry} ></mesh>

    
}

export default ExtragalacticObject;
