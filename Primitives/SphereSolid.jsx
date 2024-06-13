

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

                // Reset xn if automatically out of bounds.
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

                    

                   //this.scene_context.eventSystem.add_event({object:this.scene_context.camera, duration:0.1},{attribute:"position", to:new THREE.Vector3(x,y,1)});
                    
                    // Add text
                    //this.scene_context.eventSystem.add_animation_group();
                    //this.scene_context.eventSystem.add_text({text: "o", duration: 0.1, size: 0.1, position: new THREE.Vector3(x+(1/(2*n)),y+(1/(n)),0)}, {attribute: "scale", from: new THREE.Vector3(0,0,0), to: new THREE.Vector3(1,1,1)});
                    //this.scene_context.eventSystem.dispose_animation_group();

                    let neighbors = [];

                    if ( i > 0 )
                    {   
                        
                        let left = (current_column-1)*( n/2 ) + (current_row);

                        //this.scene_context.eventSystem.add_event({object:this.scene_context.camera, duration:0.1},{attribute:"position", to:new THREE.Vector3(x+(1/(2*n)),y+(1/(2*n)),1)})
                        //this.scene_context.eventSystem.add_event({object:this.scene_context.camera, duration:0.1},{attribute:"position", to:new THREE.Vector3(xn+(1/(2*n)),y+(1/(2*n)),1)});
                        //this.scene_context.eventSystem.add_event({object:this.scene_context.camera, duration:1},{attribute:"position", to:new THREE.Vector3((x-1)+(1/(2*n)),y+(1/(2*n)),1)});
                        //this.scene_context.eventSystem.add_text({text: "l", duration: 1, position: new THREE.Vector3((xn)+(1/(2*n)),y+(1/(2*n)),1), });
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

                    // Push the section 
                    sections.push({area: area, neighbors: neighbors});

                    current_row++;
                }
                //Reset the column and row.
                current_row = 0;
                current_column++;
            }

            
            // Iterate through the sections and build faces by converting the a uv sphere to paramterized sphere which is
            for( let s = 0; s < sections.length; s ++ )
            {

                // Find u and v of the center section by talking a half step in both directions.
                let area = sections[s].area;
                let u = area[0] + (area[2]-area[0])/2;
                let v = area[1] + (area[3]-area[1])/2;

                this.scene_context.instanceMachine.add_xy_sphere(new THREE.Vector3(u,v,0), 0.03);

                // Visit the center section  uv
                this.scene_context.eventSystem.add_event({object:this.scene_context.camera, duration:1},{attribute:"position", to:new THREE.Vector3(u,v,1)});
                //this.scene_context.eventSystem.add_animation_group();

                for ( let n = 0; n < sections[s].neighbors.length; n++ )
                {
                    // Visit each neighbor to construct the desired face.
                    // Get area of the neighbor
                    let neighbor_index = sections[s].neighbors[n];
                    // Get the neighbor area
                    let neighbor_area = sections[neighbor_index].area;
                    // Get the uv of the neighbor area
                    let nu = neighbor_area[0] + ( neighbor_area[2] - neighbor_area[0] )/2;
                    let nv = neighbor_area[1] + ( neighbor_area[3] - neighbor_area[1] )/2;

                    //this.scene_context.eventSystem.add_event({object:this.scene_context.camera, duration:1},{attribute:"position", to:new THREE.Vector3(nu,nv,1)});
                    this.scene_context.eventSystem.add_text({text: neighbor_index.toString(), duration: 1, size: 0.1, position: new THREE.Vector3(nu,nv,0.1)}, {attribute: "scale", from: new THREE.Vector3(0,0,0), to: new THREE.Vector3(1,1,1)});
                    

                    //this.scene_context.eventSystem.add_event({object:this.scene_context.camera, duration:1},{attribute:"position", to:new THREE.Vector3(nu,nv,1)});
                    
                    
                    
                }
                //this.scene_context.eventSystem.dispose_animation_group();


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
