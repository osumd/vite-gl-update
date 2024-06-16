import * as THREE from 'three';

// Uses fragment geometry generation pipeline



export default class FibbonaciMap
{

    constructor()
    {
        
    }

    test_writing_to_texture( scene )
    {
        const fragmentShader = `
            
            uniform uimage2D tex;

            void main() {

                imageStore(tex, ivec2(0,0), vec4(1,1,1,1), 0);

                gl_FragColor = vec4(1,1,1,1);
            }

        `;

        const texture = new THREE.DataArrayTexture(null, 100, 100, 1);
        
        texture.format = THREE.RGBAFormat;
        texture.type = THREE.FloatType;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;

        

        const material = new THREE.ShaderMaterial({
            vertexShader: `
                
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: fragmentShader,
            uniforms: {

                tex: { value: texture } // Placeholder for the texture
            }
        });

        let vertices = new Float32Array([
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,

            -1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, 1.0, 0.0
        ]);


        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        
        const quad = new THREE.Mesh(geometry, material);
        
        scene.add(quad);

    }


};