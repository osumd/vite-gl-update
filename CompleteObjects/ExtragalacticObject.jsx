import { useFrame } from 'react-three-fiber';
import * as THREE from 'three';
import { ShaderMaterial, SphereGeometry } from 'three';
import React from 'react';
import { useRef } from 'react';

import { XYSphere } from '../Primitives/PrimitiveSphere';


import {OpenCylinder} from '../Primitives/PrimitiveCylinder';
import { ElementSphere } from '../Primitives/ElementSphere';

function ExtragalacticObject(){
    const ref = useRef();

    const createNoiseTexture = (size) => {
        
        const area = size*size;
        const texture_data = new Uint8Array(4*area);
        
        for (let i = 0; i < area; i++) {
            const stride = i * 4;
            texture_data[ stride ] = 0 + Math.random()*255*i;
            texture_data[ stride + 1 ] = 0 + Math.random()*100*i;
            texture_data[ stride + 2 ] = 0 + Math.random()*300*Math.sin(i);
            texture_data[ stride + 3 ] = 0 + Math.random()*255;
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
        uniform float time;
        void main() {
            vUv = uv;
            vNormal = normal;

            float surfaceOffset = 0.000001;
            vec2 normalUV = clamp(uv,0.2,0.9);
            vec4 noise = texture2D(noiseTexture, normal.xy*normal.xz);

            vec3 surface_vertex = position + clamp(0.0,0.2,dot(noise.xyz/2.0,noise.xyz/2.0))*normal;
            surface_vertex.x *= 4.0*clamp(0.0,1.0,dot(noise.xyz/2.0,noise.xyz/2.0));
            surface_vertex.y *= 1.0*smoothstep(0.0, 1.0, noise.x);


            gl_Position = projectionMatrix * modelViewMatrix * vec4(surface_vertex,1.0);
        }
    `;

    const fragmentShader = `
        uniform sampler2D noiseTexture;
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform float time;
        void main() {
            vec3 normal = normalize(vNormal);
            vec4 noise = texture2D(noiseTexture, vUv);
            vec4 noise2 = texture2D(noiseTexture, vUv*noise.xy);

            gl_FragColor = vec4(vUv.x,vUv.x,vUv.x, 1.0);
            gl_FragColor = vec4(normal.x, normal.y, normal.z, 1.0);
            //gl_FragColor = noise2;
        }
    `;

    const noiseTexture = createNoiseTexture(32);
    const material = new ShaderMaterial({
        uniforms: {
            noiseTexture: { value: noiseTexture },
            time: { value: 0},
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide
    });


    useFrame((state)=>{
        material.uniforms.time.value = state.clock.elapsedTime;
    });
    
    const sphere_geometry = new ElementSphere({radius: 1.0}).GenerateSphere();

    //console.log(sphere_geometry);
    return <mesh geometry={sphere_geometry} material={material}></mesh>
    //return <mesh ref={ref} material={material} geometry={geometry} ></mesh>

    
    
}

export default ExtragalacticObject;
