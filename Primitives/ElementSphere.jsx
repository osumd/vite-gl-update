
import * as THREE from 'three';



function ElementSphere ( radius_ )
{
    let radius = radius_;
    let xdiv = 10;
    let ydiv = 10;   

    function GenerateSphere()
    {
        
        let memoryDataBack = 0;
        let elementDataBack = 0;
        let bufferGeometry = new THREE.BufferGeometry();
        let mesh_data = new Float32Array(60*(ydiv*xdiv));
        let elements = new Uint16Array(60 * (ydiv)*(xdiv));
        
        let p0 = new THREE.Vector3();
        let p1 = new THREE.Vector3();
        let p2 = new THREE.Vector3();
        let p3 = new THREE.Vector3();

        let dtheta = (2*Math.PI)/xdiv;
        let dphi = (Math.PI)/ydiv;

        let last_index = 1;

        mesh_data[memoryDataBack] = radius*Math.cos(0)*Math.sin(0);
        mesh_data[memoryDataBack+1] = radius*Math.sin(0)*Math.sin(0);
        mesh_data[memoryDataBack+2] = radius*Math.cos(0);

        mesh_data[memoryDataBack+3] = 0;
        mesh_data[memoryDataBack+4] = 0;
        mesh_data[memoryDataBack+5] = 1;
        
        mesh_data[memoryDataBack+6] = 0;
        mesh_data[memoryDataBack+7] = 0;

        memoryDataBack += 8;

        let current_vertex = 1;

        for(let ph = 1; ph < ydiv+1; ph++ )
        {
            
            let phi = dphi*ph;
            let phip = dphi*(ph+1);

            for(let dh = 0; dh < xdiv+1; dh ++)
            {

                let theta = dtheta*dh;
                let thetap = dtheta*(dh+1);
            
                p0.x = radius*Math.cos(theta)*Math.sin(phi);
                p0.y = radius*Math.sin(theta)*Math.sin(phi);
                p0.z = radius*Math.cos(phi);

                let norm = Math.sqrt(p0.x*p0.x + p0.y*p0.y + p0.z*p0.z);
                if(!isNaN(norm))
                {
                    //p0.divideScalar(norm);
                }

                p1.x = radius*Math.cos(theta)*Math.sin(phip);
                p1.y = radius*Math.sin(theta)*Math.sin(phip);
                p1.z = radius*Math.cos(phip);

                p2.x = radius*Math.cos(thetap)*Math.sin(phip);
                p2.y = radius*Math.sin(thetap)*Math.sin(phip);
                p2.z = radius*Math.cos(phip);

                p3.x = radius*Math.cos(thetap)*Math.sin(phi);
                p3.y = radius*Math.sin(thetap)*Math.sin(phi);
                p3.z = radius*Math.cos(phi);

                // p1.x = Math.cos(thetap)*Math.sin(phi);
                // p1.y = Math.sin(thetap)*Math.sin(phi);
                // p1.z = Math.cos(phi);

                // p2.x = Math.cos(thetap)*Math.sin(phip);
                // p2.y = Math.sin(thetap)*Math.sin(phip);
                // p2.z = Math.cos(phip);

                // p3.x = Math.cos(theta)*Math.sin(phip);
                // p3.y = Math.sin(theta)*Math.sin(phip);
                // p3.z = Math.cos(phip);
                
                let n = p3.clone().sub(p0).cross(p1.clone().sub(p0));
                
                n.normalize();

                mesh_data[memoryDataBack] = p0.x;
                mesh_data[memoryDataBack+1] = p0.y;
                mesh_data[memoryDataBack+2] = p0.z;
                
                mesh_data[memoryDataBack+3] = -n.x;
                mesh_data[memoryDataBack+4] = -n.y;
                mesh_data[memoryDataBack+5] = -n.z;

                mesh_data[memoryDataBack+6] = (dh%2);
                mesh_data[memoryDataBack+7] = (ph%2);

                //mesh_data[memoryDataBack+6] = (dh/(xdiv+1));
                //mesh_data[memoryDataBack+7] = (ph/(ydiv+1));

                memoryDataBack += 8;

                if(ph == 1)
                {

                    if(dh < xdiv)
                    {
                        elements[elementDataBack] = 0;
                        elements[elementDataBack+1] = current_vertex;
                        elements[elementDataBack+2] = current_vertex+1;
                        elementDataBack+=3;
                    }
                    
                
                }else
                {
                    
                    // elements[elementDataBack] = (current_vertex - xdiv)-1;
                    // elements[elementDataBack+1] = (current_vertex - xdiv);
                    // elements[elementDataBack+2] = current_vertex;

                    // elements[elementDataBack+3] = (current_vertex-xdiv-1);
                    // elements[elementDataBack+4] = current_vertex;
                    // elements[elementDataBack+5] = current_vertex-1; 
                    // elementDataBack+=6;

                    elements[elementDataBack] = (current_vertex - xdiv)-1;
                    elements[elementDataBack+1] = current_vertex-1;
                    elements[elementDataBack+2] = current_vertex;

                    elements[elementDataBack+3] = (current_vertex-xdiv-1);
                    elements[elementDataBack+4] = current_vertex;
                    elements[elementDataBack+5] = (current_vertex - xdiv); 
                    elementDataBack+=6;

                }
                current_vertex += 1;

            }

        }

        mesh_data[memoryDataBack] = radius*Math.cos(Math.PI*2)*Math.sin(Math.PI);
        mesh_data[memoryDataBack+1] = radius*Math.cos(Math.PI*2)*Math.sin(Math.PI);;
        mesh_data[memoryDataBack+2] = -radius;

        
        mesh_data[memoryDataBack+3] = 0;
        mesh_data[memoryDataBack+4] = 0;
        mesh_data[memoryDataBack+5] = 1;

        mesh_data[memoryDataBack+6] = (0%2);
        mesh_data[memoryDataBack+7] = (0%2);

        let lx = current_vertex;

        for(let dh = 0; dh < xdiv; dh ++)
        {
            elements[elementDataBack] = current_vertex-(xdiv)-1;
            elements[elementDataBack+1] = current_vertex-(xdiv);
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


    return GenerateSphere();


}








export {ElementSphere};
