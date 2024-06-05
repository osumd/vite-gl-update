

import * as THREE from 'three';
import { ShaderMaterial, SphereGeometry } from 'three';



class SphereSolid
{
        constructor(scene_context)
        {
            this.scene_context = scene_context;
        }
        
        generate_mesh()
        {
            // Number of vertices or number of sections.
            let n = 8;
            
            //Generate the buffer geometry.
            //let bufferGeometry = new THREE.BufferGeometry();

            // let vertices = new Float32Array((4*3*n*n));
            // let normals = new Float32Array((4*3*n*n));
            // let uvs = new Float32Array((2*4*n*n));
            // let elements = new Uint16Array((6*n*n));

            // let currentVertex = 0;
            // let j = 0;
            // let push_array = [0,0];
            
            // Define a sections array for the section areas and their neighbors.
            let sections = [];

            // Columns and rows.
            let current_row = 0;
            let current_column = 0;

            

            // Generate the sections
            for ( let i = 0; i < n ; i++)
            {
                // Find the x division
                let x = (i/n);
                let x1 = ((i+1)/n);
                let xn = ((i-1)/n);

                if ( xn < 0 ){ xn = 0 }

                for ( let j = 0; j < (n/2); j ++)
                {
                    let y = (j/n)*2;
                    let y1 = ((j+1)/n)*2;
                    let yn = ((j-1)/n)*2;    

                    if ( yn < 0 ){ yn = 0 }
                    // The section is defined as the bounds from x and x+1, and y and y+1

                    let area = [x,y,x1,y1];

                    //this.scene_context.eventSystem.add_event({object:this.scene_context.camera, duration:1},{attribute:"position", to:new THREE.Vector3(x+(1/(2*n)),y+(1/(2*n)),1)});

                    

                    //console.log("x: ", x);

                    this.scene_context.instanceMachine.add_open_cylinder(new THREE.Vector3(x,yn,0), new THREE.Vector3(x1,yn,0));

                    this.scene_context.instanceMachine.add_open_cylinder(new THREE.Vector3(x,yn,0), new THREE.Vector3(x,y1,0));

                    this.scene_context.instanceMachine.add_open_cylinder(new THREE.Vector3(x1,yn,0), new THREE.Vector3(x1,y1,0));

                    this.scene_context.instanceMachine.add_open_cylinder(new THREE.Vector3(x1,y1,0), new THREE.Vector3(x,y1,0));

                    


                    
   
                    

                    let neighbors = [];

                    if ( i > 0 )
                    {   
                        
                        let left = (current_column-1)*( n/2 ) + (current_row);
                        neighbors.push(left);

                        

                    }

                    if ( i < (n-1) )
                    {
                        let right = (current_column+1)*(n/2) + (current_row);
                        neighbors.push(right);
                    }

                    if ( j > 0 )
                    {
                        let top  = (current_column*(n/2)) + (current_row - 1);
                        neighbors.push(top);
                    }

                    if ( j < (n/2)-1 )
                    {
                        let bottom = (current_column*(n/2))+(current_row +1);
                        neighbors.push(bottom);
                    }

                    current_row++;
                }
                //Reset the column and row.
                current_row = 0;
                current_column++;
            }

            //this.scene_context.instanceMachine
            
            // bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            // bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
            // bufferGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

            // // Optional: Add indices to the geometry if you're using indexed geometry
            // bufferGeometry.setIndex(new THREE.BufferAttribute(elements, 1));


            // return bufferGeometry;

        }
    
}




export default SphereSolid;
