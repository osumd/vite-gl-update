import { useFrame } from 'react-three-fiber';
import * as THREE from 'three';
import { ShaderMaterial, SphereGeometry } from 'three';
import React from 'react';
import { useRef,useEffect } from 'react';
import { element } from 'three/examples/jsm/nodes/Nodes.js';




class ElementSphere{

    constructor({ radius} )
    {
        this.radius = radius;
        this.xdiv = 30;
        this.ydiv = 30;   

        this.geometry_mesh = undefined;
    }

    Material()
    {
        let vertexShader = `
                varying vec3 vNormal;
                varying vec2 vUv;

                void main() {
                    vNormal = normal;
                    vUv = uv;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * (vec4(position, 1.0) + vec4(normal*0.4,0.0));
                }
            `;
        let fragmentShader = `
            varying vec3 vNormal;
            varying vec2 vUv;

            // A single iteration of Bob Jenkins' One-At-A-Time hashing algorithm.
            uint hash( uint x ) {
                x += ( x << 10u );
                x ^= ( x >>  6u );
                x += ( x <<  3u );
                x ^= ( x >> 11u );
                x += ( x << 15u );
                return x;
            }

            // Compound versions of the hashing algorithm I whipped together.
            uint hash( uvec2 v ) { return hash( v.x ^ hash(v.y)                         ); }
            uint hash( uvec3 v ) { return hash( v.x ^ hash(v.y) ^ hash(v.z)             ); }
            uint hash( uvec4 v ) { return hash( v.x ^ hash(v.y) ^ hash(v.z) ^ hash(v.w) ); }

            // Construct a float with half-open range [0:1] using low 23 bits.
            // All zeroes yields 0.0, all ones yields the next smallest representable value below 1.0.
            float floatConstruct( uint m ) {
                const uint ieeeMantissa = 0x007FFFFFu; // binary32 mantissa bitmask
                const uint ieeeOne      = 0x3F800000u; // 1.0 in IEEE binary32

                m &= ieeeMantissa;                     // Keep only mantissa bits (fractional part)
                m |= ieeeOne;                          // Add fractional part to 1.0

                float  f = uintBitsToFloat( m );       // Range [1:2]
                return f - 1.0;                        // Range [0:1]
            }



            // Pseudo-random value in half-open range [0:1].
            float random( float x ) { return floatConstruct(hash(floatBitsToUint(x))); }
            float random( vec2  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
            float random( vec3  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
            float random( vec4  v ) { return floatConstruct(hash(floatBitsToUint(v))); }



            void main() {
                float r = random(sin(fract(23123.12314124)));
                gl_FragColor = vec4((vUv),0.0,1);
            }
        `;

        return new THREE.ShaderMaterial({vertexShader: vertexShader, fragmentShader: fragmentShader, side: THREE.DoubleSide})
    }

    GenerateSphere()
    {
        
        let memoryDataBack = 0;
        let elementDataBack = 0;
        let bufferGeometry = new THREE.BufferGeometry();
        let mesh_data = new Float32Array(60*(this.ydiv*this.xdiv));
        let elements = new Uint16Array(60 * (this.ydiv)*(this.xdiv));
        
        let p0 = new THREE.Vector3();
        let p1 = new THREE.Vector3();
        let p2 = new THREE.Vector3();
        let p3 = new THREE.Vector3();

        let dtheta = (2*Math.PI)/this.xdiv;
        let dphi = (Math.PI)/this.ydiv;

        let last_index = 1;

        mesh_data[memoryDataBack] = Math.cos(0)*Math.sin(0);
        mesh_data[memoryDataBack+1] = Math.sin(0)*Math.sin(0);
        mesh_data[memoryDataBack+2] = Math.cos(0);
        mesh_data[memoryDataBack+3] = 0;
        mesh_data[memoryDataBack+4] = 0;
        mesh_data[memoryDataBack+5] = 1;
        mesh_data[memoryDataBack+6] = (0%2);
        mesh_data[memoryDataBack+7] = (0%2);

        memoryDataBack += 8;

        let current_vertex = 1;

        for(let ph = 1; ph < this.ydiv; ph++ )
        {
            
            let phi = dphi*ph;
            let phip = dphi*(ph+1);

            for(let dh = 0; dh < this.xdiv+1; dh ++)
            {

                let theta = dtheta*dh;
                let thetap = dtheta*(dh+1);
            
                p0.x = Math.cos(theta)*Math.sin(phi);
                p0.y = Math.sin(theta)*Math.sin(phi);
                p0.z = Math.cos(phi);

                let norm = Math.sqrt(p0.x*p0.x + p0.y*p0.y + p0.z*p0.z);
                if(!isNaN(norm))
                {
                    //p0.divideScalar(norm);
                }

                p1.x = Math.cos(thetap)*Math.sin(phi);
                p1.y = Math.sin(thetap)*Math.sin(phi);
                p1.z = Math.cos(phi);

                p2.x = Math.cos(thetap)*Math.sin(phip);
                p2.y = Math.sin(thetap)*Math.sin(phip);
                p2.z = Math.cos(phip);

                p3.x = Math.cos(theta)*Math.sin(phip);
                p3.y = Math.sin(theta)*Math.sin(phip);
                p3.z = Math.cos(phip);
                
                let n = p3.clone().sub(p0).cross(p1.clone().sub(p0));
                
                n.normalize();

                mesh_data[memoryDataBack] = p0.x;
                mesh_data[memoryDataBack+1] = p0.y;
                mesh_data[memoryDataBack+2] = p0.z;
                
                mesh_data[memoryDataBack+3] = n.x;
                mesh_data[memoryDataBack+4] = n.y;
                mesh_data[memoryDataBack+5] = n.z;

                mesh_data[memoryDataBack+6] = (dh%2);
                mesh_data[memoryDataBack+7] = (ph%2);

                memoryDataBack += 8;

                if(ph == 1)
                {

                    if(dh < this.xdiv)
                    {
                        elements[elementDataBack] = 0;
                        elements[elementDataBack+1] = current_vertex;
                        elements[elementDataBack+2] = current_vertex+1;
                        elementDataBack+=3;
                    }
                    
                
                }else
                {
                    
                    elements[elementDataBack] = (current_vertex - this.xdiv)-1;
                    elements[elementDataBack+1] = (current_vertex - this.xdiv);
                    elements[elementDataBack+2] = current_vertex;

                    elements[elementDataBack+3] = (current_vertex-this.xdiv-1);
                    elements[elementDataBack+4] = current_vertex;
                    elements[elementDataBack+5] = current_vertex-1; 
                    elementDataBack+=6;  
                }
                current_vertex += 1;

            }

        }

         mesh_data[memoryDataBack] = Math.cos(Math.PI*2)*Math.sin(Math.PI);
        mesh_data[memoryDataBack+1] = Math.cos(Math.PI*2)*Math.sin(Math.PI);;
        mesh_data[memoryDataBack+2] = -1;
        mesh_data[memoryDataBack+3] = 0;
        mesh_data[memoryDataBack+4] = 0;
        mesh_data[memoryDataBack+5] = -1;

        mesh_data[memoryDataBack+6] = (0%2);
        mesh_data[memoryDataBack+7] = (0%2);

        let lx = current_vertex;

        for(let dh = 0; dh < this.xdiv; dh ++)
        {
            elements[elementDataBack] = current_vertex-(this.xdiv)-1;
            elements[elementDataBack+1] = current_vertex-(this.xdiv);
            elements[elementDataBack+2] = lx;
            elementDataBack+=3;
            current_vertex++;
        } 

        // Define interleaved buffer
        let interleavedBuffer = new THREE.InterleavedBuffer(mesh_data, 8); // 8 is the stride

        // Define interleaved buffer attributes
        let positionAttribute = new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0); // 3 is the size, 0 is the offset
        let normalAttribute = new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 3); // 3 is the size, 3 is the offset
        let uvAttribute = new THREE.InterleavedBufferAttribute(interleavedBuffer, 2, 6); // 2 is the size, 6 is the offset

        bufferGeometry.setAttribute('position', positionAttribute);
        bufferGeometry.setAttribute('normal', normalAttribute); // Offset 3 for normals
        bufferGeometry.setAttribute('uv', uvAttribute); // Offset 3 for normals
       
        bufferGeometry.setIndex(new THREE.BufferAttribute(elements, 1));

        const customMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        
        return bufferGeometry;
    }


    render()
    {
        return this.GenerateSphere();
    }




    
};




export {ElementSphere};
