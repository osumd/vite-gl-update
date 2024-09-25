

import * as THREE from 'three';
import { ShaderMaterial, SphereGeometry } from 'three';



function OpenCylinder()
{
        //console.log(bottom,top,divisions);

        let start = new THREE.Vector3(0.0,0.0,0.0);
        let end = new THREE.Vector3(0.0,1.0,0.0);
        
        let bufferGeometry = new THREE.BufferGeometry();


        let divisions = 12;

        let vertices = new Float32Array(( 4*3*12 + (3*3*divisions*2)));
        let normals = new Float32Array((4*3*12 + (3*3*divisions*2)));
        let uvs = new Float32Array((2*4*12 + (2*3*divisions*2)));
        let elements = new Uint16Array((6*12 + (3*divisions*2)));

        let currentVertex = 0;
        let j = 0;
        let push_array = [0,0];

        push_array = push_cylinder_back(start, end, 1, vertices, normals,uvs,elements, currentVertex, j, divisions);

        currentVertex = push_array[0]; j = push_array[1];

        //push_array = close_caps(start, end, 1, vertices, normals,uvs,elements, currentVertex, j, divisions );

        
        
        bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        bufferGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        // Optional: Add indices to the geometry if you're using indexed geometry
        bufferGeometry.setIndex(new THREE.BufferAttribute(elements, 1));


        return bufferGeometry;

        function push_cylinder_back(start, end, radius, vertices, normals, uvs, elements, currentVertex, j, divisions)
        {
    
            let axis = end.clone().sub(start).normalize();
            let axis_norm = axis.clone().cross(new THREE.Vector3(axis.x + 0.1 , axis.y + 0.1, axis.z + 0.1)).normalize();
            
            //console.log(axis)
            //console.log(axis_norm);

            let dr = (Math.PI*2)/divisions;
    
            let p0 = new THREE.Vector3(0,0,0);
            let p1 = new THREE.Vector3(0,0,0);
            let p2 = new THREE.Vector3(0,0,0);
            let p3 = new THREE.Vector3(0,0,0);
            
            let temp = new THREE.Vector3(0,0,0);
    

            for(var i = 0; i <= divisions; i++)
            {
                var a0 = i*dr;
                var a1 = (i+1)*dr;
            
                quaternion_axis_angle(axis_norm, axis, a0, temp);
                //console.log(temp);
                p0.x = start.x + temp.x*radius;
                p0.y = start.y + temp.y*radius;
                p0.z = start.z + temp.z*radius;
    
                p1.x = end.x + temp.x*radius;
                p1.y = end.y + temp.y*radius;
                p1.z = end.z + temp.z*radius;
                
                quaternion_axis_angle(axis_norm, axis, a1, temp);
                //console.log(temp)
                
                p2.x = end.x + temp.x*radius;
                p2.y = end.y + temp.y*radius;
                p2.z = end.z+ temp.z*radius;
                
                p3.x = start.x + temp.x*radius;
                p3.y = start.y + temp.y*radius;
                p3.z = start.z+ temp.z*radius;
    
                
                //console.log(axis_norm);
    
                //console.log(p0,p1,p2,p3);
    
                vertices[(currentVertex*6)] = p0.x;
                vertices[(currentVertex*6)+1] = p0.y;
                vertices[(currentVertex*6)+2] = p0.z;
    
                vertices[(currentVertex*6)+3] = p1.x;
                vertices[(currentVertex*6)+4] = p1.y;
                vertices[(currentVertex*6)+5] = p1.z;
    
                // vertices[(currentVertex*12)+6] = p2.x;
                // vertices[(currentVertex*12)+7] = p2.y;
                // vertices[(currentVertex*12)+8] = p2.z;
    
                // vertices[(currentVertex*12)+9] = p3.x;
                // vertices[(currentVertex*12)+10] = p3.y;
                // vertices[(currentVertex*12)+11] = p3.z;
    
                uvs[(currentVertex*4)] = 0;
                uvs[(currentVertex*4)+1] = 0;
                
                uvs[(currentVertex*4)+2] = 1;
                uvs[(currentVertex*4)+3] = 0;
    
                // uvs[(currentVertex*8)+4] = 1;
                // uvs[(currentVertex*8)+5] = 1;
    
                // uvs[(currentVertex*8)+6] = 0;
                // uvs[(currentVertex*8)+7] = 1;
    
                var n = p1.sub(p0).cross(p3.sub(p0)).normalize();
    
                normals[(currentVertex*6)] = n.x;
                normals[(currentVertex*6)+1] = n.y;
                normals[(currentVertex*6)+2] = n.z;
                
                normals[(currentVertex*6)+3] = n.x;
                normals[(currentVertex*6)+4] = n.y;
                normals[(currentVertex*6)+5] = n.z;
    
                // normals[(currentVertex*12)+6] = n.x;
                // normals[(currentVertex*12)+7] = n.y;
                // normals[(currentVertex*12)+8] = n.z;
    
                // normals[(currentVertex*12)+9] = n.x;
                // normals[(currentVertex*12)+10] = n.y;
                // normals[(currentVertex*12)+11] = n.z;
    
                if ( i == 0 )
                {
                    elements[(currentVertex*6)] = j;
                    elements[(currentVertex*6)+1] = j+1;
                    elements[(currentVertex*6)+2] = j+2;

                    elements[(currentVertex*6)+3] = j;
                    elements[(currentVertex*6)+4] = j+3;
                    elements[(currentVertex*6)+5] = j+2;
                    
                }else
                {
                    elements[(currentVertex*6)] = j-2;
                    elements[(currentVertex*6)+1] = j-1;
                    elements[(currentVertex*6)+2] = j+1;

                    elements[(currentVertex*6)+3] = j-2;
                    elements[(currentVertex*6)+4] = j+1;
                    elements[(currentVertex*6)+5] = j;
                }
                


                
    
                // elements[(currentVertex*6)+3] = j;
                // elements[(currentVertex*6)+4] = j+2;
                // elements[(currentVertex*6)+5] = j+3
    
                currentVertex += 1;
    
                j+=2;
    
            }
    
            return [currentVertex,j];
    
        }
    
        function close_caps( start, end, radius, vertices, normals, uvs, elements, currentVertex, j, divisions )
        {

            // Set the last _buffer
            let last = currentVertex;
            currentVertex = 0;

            let axis = end.clone().sub(start).normalize();
            let axis_norm = axis.clone().cross(new THREE.Vector3(axis.x + 0.1 , axis.y + 0.1, axis.z + 0.1)).normalize();
            
            //console.log(axis)
            //console.log(axis_norm);

            let dr = (Math.PI*2)/divisions;
    
            let p0 = new THREE.Vector3(0,0,0);
            let p1 = new THREE.Vector3(0,0,0);
            let p2 = new THREE.Vector3(0,0,0);
            
            let temp = new THREE.Vector3(0,0,0);
    
    
            for(var i = 0; i < divisions; i++)
            {
                var a0 = i*dr;
                var a1 = (i+1)*dr;
            
                quaternion_axis_angle(axis_norm, axis, a0, temp);

                //console.log(temp);
                p0.x = start.x;
                p0.y = start.y;
                p0.z = start.z;
    
                p1.x = start.x + temp.x*radius;
                p1.y = start.y + temp.y*radius;
                p1.z = start.z + temp.z*radius;
                
                quaternion_axis_angle(axis_norm, axis, a1, temp);
                //console.log(temp)
                
                p2.x = start.x + temp.x*radius;
                p2.y = start.y + temp.y*radius;
                p2.z = start.z + temp.z*radius;
                
                vertices[(last*12)+ (currentVertex*9)] = p0.x;
                vertices[(last*12)+(currentVertex*9)+1] = p0.y;
                vertices[(last*12)+(currentVertex*9)+2] = p0.z;
    
                vertices[(last*12)+(currentVertex*9)+3] = p1.x;
                vertices[(last*12)+(currentVertex*9)+4] = p1.y;
                vertices[(last*12)+(currentVertex*9)+5] = p1.z;
    
                vertices[(last*12)+(currentVertex*9)+6] = p2.x;
                vertices[(last*12)+(currentVertex*9)+7] = p2.y;
                vertices[(last*12)+(currentVertex*9)+8] = p2.z;
    
                uvs[(last*8)+(currentVertex*6)] = 0;
                uvs[(last*8)+(currentVertex*6)+1] = 0;
                
                uvs[(last*8)+(currentVertex*6)+2] = 1;
                uvs[(last*8)+(currentVertex*6)+3] = 0;
    
                uvs[(last*8)+(currentVertex*6)+4] = 1;
                uvs[(last*8)+(currentVertex*6)+5] = 1;
    
                var n = p1.sub(p0).cross(p2.sub(p0));
    
                normals[(last*12)+(currentVertex*9)] = n.x;
                normals[(last*12)+(currentVertex*9)+1] = n.y;
                normals[(last*12)+(currentVertex*9)+2] = n.z;
                
                normals[(last*12)+(currentVertex*9)+3] = n.x;
                normals[(last*12)+(currentVertex*9)+4] = n.y;
                normals[(last*12)+(currentVertex*9)+5] = n.z;
    
                normals[(last*12)+(currentVertex*9)+6] = n.x;
                normals[(last*12)+(currentVertex*9)+7] = n.y;
                normals[(last*12)+(currentVertex*9)+8] = n.z;
    

                elements[(last*6)+(currentVertex*3)] = j;
                elements[(last*6)+(currentVertex*3)+1] = j+1;
                elements[(last*6)+(currentVertex*3)+2] = j+2;
    
                currentVertex += 1;
    
                j+=3;


                quaternion_axis_angle(axis_norm, axis, a0, temp);

                //console.log(temp);
                p0.x = end.x;
                p0.y = end.y;
                p0.z = end.z;
    
                p1.x = end.x + temp.x*radius;
                p1.y = end.y + temp.y*radius;
                p1.z = end.z + temp.z*radius;
                
                quaternion_axis_angle(axis_norm, axis, a1, temp);
                //console.log(temp)
                
                p2.x = end.x + temp.x*radius;
                p2.y = end.y + temp.y*radius;
                p2.z = end.z + temp.z*radius;
                
                vertices[(last*12)+ (currentVertex*9)] = p0.x;
                vertices[(last*12)+(currentVertex*9)+1] = p0.y;
                vertices[(last*12)+(currentVertex*9)+2] = p0.z;
    
                vertices[(last*12)+(currentVertex*9)+3] = p1.x;
                vertices[(last*12)+(currentVertex*9)+4] = p1.y;
                vertices[(last*12)+(currentVertex*9)+5] = p1.z;
    
                vertices[(last*12)+(currentVertex*9)+6] = p2.x;
                vertices[(last*12)+(currentVertex*9)+7] = p2.y;
                vertices[(last*12)+(currentVertex*9)+8] = p2.z;
    
                uvs[(last*8)+(currentVertex*6)] = 0;
                uvs[(last*8)+(currentVertex*6)+1] = 0;
                
                uvs[(last*8)+(currentVertex*6)+2] = 1;
                uvs[(last*8)+(currentVertex*6)+3] = 0;
    
                uvs[(last*8)+(currentVertex*6)+4] = 1;
                uvs[(last*8)+(currentVertex*6)+5] = 1;
    
                var n = p1.sub(p0).cross(p2.sub(p0)).multiplyScalar(-1);
    
                normals[(last*12)+(currentVertex*9)] = n.x;
                normals[(last*12)+(currentVertex*9)+1] = n.y;
                normals[(last*12)+(currentVertex*9)+2] = n.z;
                
                normals[(last*12)+(currentVertex*9)+3] = n.x;
                normals[(last*12)+(currentVertex*9)+4] = n.y;
                normals[(last*12)+(currentVertex*9)+5] = n.z;
    
                normals[(last*12)+(currentVertex*9)+6] = n.x;
                normals[(last*12)+(currentVertex*9)+7] = n.y;
                normals[(last*12)+(currentVertex*9)+8] = n.z;
    

                elements[(last*6)+(currentVertex*3)] = j;
                elements[(last*6)+(currentVertex*3)+1] = j+2;
                elements[(last*6)+(currentVertex*3)+2] = j+1;
    


                currentVertex += 1;
    
                j+=3;
    
            }
    
            return [currentVertex,j];

        }
    
        function quaternion_axis_angle(p_in, axis, angle, p_out)
        {
    
           // console.log(angle);
            let q = new THREE.Vector4();
    
            let s = Math.sin(angle/2);
            q.w = Math.cos(angle/2);
            q.x = axis.x * s;
            q.y = axis.y * s;
            q.z = axis.z * s;
            
            // //normalize the quaternion
    
            let x = p_in.x*((q.w*q.w)+(q.x*q.x) - (q.y*q.y) - (q.z*q.z)) + p_in.y*((2*q.x*q.y) - (2*q.w*q.z)) + p_in.z*((2*q.x*q.z) + (2*q.w*q.y) );
            let y = p_in.x*((2*q.x*q.y) + (2*q.w*q.z)) + p_in.y*((q.w*q.w)-(q.x*q.x) + (q.y*q.y)-(q.z*q.z)) + p_in.z*((2*q.y*q.z) - (2*q.w*q.x)); 
            let z = p_in.x*((2*q.x*q.z) - (2*q.w*q.y)) + p_in.y*((2*q.y*q.y) + (2*q.w*q.x)) + p_in.z*((q.w*q.w)-(q.x*q.x)+(q.y*q.y)+(q.z*q.z));
            // let result = new THREE.Vector3();
    
            let norm = Math.sqrt(q.w*q.w + q.x*q.x + q.y*q.y + q.z*q.z);
            let qw = q.w / norm;
            let qx = q.x / norm;
            let qy = q.y / norm;
            let qz = q.z / norm;
    
            // Calculate the rotated point
            //let x = p_in.x * (1 - 2*qy*qy - 2*qz*qz) + p_in.y * (2*qx*qy - 2*qw*qz) + p_in.z * (2*qx*qz + 2*qw*qy);
            //let y = p_in.x * (2*qx*qy + 2*qw*qz) + p_in.y * (1 - 2*qx*qx - 2*qz*qz) + p_in.z * (2*qy*qz - 2*qw*qx);
            //let z = p_in.x * (2*qx*qz - 2*qw*qy) + p_in.y * (2*qy*qz + 2*qw*qx) + p_in.z * (1 - 2*qx*qx - 2*qy*qy);
    
    
            // Apply quaternion rotation to the input vector
            //let p_rotated = p_in.clone().applyQuaternion(q);
    
            //generate quaternion from axis and and an angle
    
    
            let p_rotated = new THREE.Quaternion().setFromAxisAngle(axis,angle);
            let p = new THREE.Quaternion(0,p_in.x, p_in.y, p_in.z);
            let p_conj = p_rotated.conjugate();
    
            let thing = p_rotated.multiply(p).multiply(p_conj);
            let mag = Math.sqrt(thing.x*thing.x + thing.y*thing.y + thing.z*thing.z);
            
    
            // p_out.x = thing.x/mag;
            // p_out.y = thing.y/mag;
            // p_out.z = thing.w/mag;
          
            p_out.x = thing.y;
            p_out.y = thing.z;
            p_out.z = thing.w;

        }

        

}




export {OpenCylinder};
