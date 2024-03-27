import { useFrame } from 'react-three-fiber';
import * as THREE from 'three';
import { ShaderMaterial, SphereGeometry } from 'three';
import React from 'react';
import { useRef } from 'react';




class CylinderGrid {

    constructor( bottomLeft, topRight, xDivision, yDivisions, radius )
    {
        this.bottomLeft = bottomLeft;
        this.topRight = topRight;
        this.xDivision = xDivision;
        this.yDivisions = yDivisions;
        this.radius = radius;   
    }

    quaternion_axis_angle(p_in, axis, angle, p_out)
    {

        console.log(angle);
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
        let p_conj = p_rotated.clone().conjugate();

        let thing = p_rotated.multiply(p).multiply(p_conj);
        

        p_out.x = thing.x;
        p_out.y = thing.y;
        p_out.z = thing.z;

    }

    GenerateGrid(){
        

        let start = new THREE.Vector3(0.0,0.0,0.0);
        let end = new THREE.Vector3(10.0,0.0,0.0);


        let axis = end.clone().sub(start).normalize();
        let axis_norm = axis.cross(new THREE.Vector3(axis.x + 0.1 , axis.y + 0.1, axis.z + 0.1)).normalize();
        
        let dr = (Math.PI*2)/12;

        let p0 = new THREE.Vector3(0,0,0);
        let p1 = new THREE.Vector3(0,0,0);
        let p2 = new THREE.Vector3(0,0,0);
        let p3 = new THREE.Vector3(0,0,0);
        
        let bufferGeometry = new THREE.BufferGeometry();

        let vertices = new Float32Array(2*(4*3*12));
        
        let normals = new Float32Array(2*(4*3*12));
        let uvs = new Float32Array(2*(2*4*12));
        let elements = new Uint16Array(2*(6*12));

        let temp = new THREE.Vector3(0,0,0);

        let currentVertex = 0;

        let j = 0;
        
        let push_array = [0,0];

        push_array = this.push_cylinder_back(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-10), 1.0, vertices, normals,uvs,elements, currentVertex, j, 12)
        currentVertex = push_array[0]; j = push_array[1];
        // push_array = this.push_cylinder_back(start, new THREE.Vector3(1,10,0), 1.0, vertices, normals,uvs,elements, currentVertex, j, 12)
        // currentVertex = push_array[0]; j = push_array[1];
        
        //currentVertex, j = this.push_cylinder_back(start, new THREE.Vector3(1,1,1), 1.0, vertices, normals,uvs,elements, currentVertex, j, 12)


        bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        bufferGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        // Optional: Add indices to the geometry if you're using indexed geometry
        bufferGeometry.setIndex(new THREE.BufferAttribute(elements, 1));

        return (
        <mesh geometry={bufferGeometry} material={new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })} />
        );


    }


    push_cylinder_back(start, end, radius, vertices, normals, uvs, elements, currentVertex, j, divisions)
    {

        let axis = end.clone().sub(start).normalize();
        let axis_norm = axis.clone().cross(new THREE.Vector3(axis.x + 0.1 , axis.y + 0.1, axis.z + 0.1)).normalize();
        
        let dr = (Math.PI*2)/divisions;

        let p0 = new THREE.Vector3(0,0,0);
        let p1 = new THREE.Vector3(0,0,0);
        let p2 = new THREE.Vector3(0,0,0);
        let p3 = new THREE.Vector3(0,0,0);
        
        let temp = new THREE.Vector3(0,0,0);


        for(var i = 0; i < divisions; i++)
        {
            var a0 = i*dr;
            var a1 = (i+1)*dr;
        
            this.quaternion_axis_angle(axis_norm, axis, a0, temp);
            //console.log(temp);
            p0.x = start.x + temp.x*radius;
            p0.y = start.y + temp.y*radius;
            p0.z = start.z + temp.z*radius;

            p1.x = end.x + temp.x*radius;
            p1.y = end.y + temp.y*radius;
            p1.z = end.z + temp.z*radius;
            
            this.quaternion_axis_angle(axis_norm, axis, a1, temp);
            //console.log(temp)
            
            p2.x = end.x + temp.x;
            p2.y = end.y + temp.y;
            p2.z = end.z+ temp.z;
            
            p3.x = start.x + temp.x;
            p3.y = start.y + temp.y;
            p3.z = start.z+ temp.z;

            
            //console.log(axis_norm);

            //console.log(p0,p1,p2,p3);

            vertices[(currentVertex*12)] = p0.x;
            vertices[(currentVertex*12)+1] = p0.y;
            vertices[(currentVertex*12)+2] = p0.z;

            vertices[(currentVertex*12)+3] = p1.x;
            vertices[(currentVertex*12)+4] = p1.y;
            vertices[(currentVertex*12)+5] = p1.z;

            vertices[(currentVertex*12)+6] = p2.x;
            vertices[(currentVertex*12)+7] = p2.y;
            vertices[(currentVertex*12)+8] = p2.z;

            vertices[(currentVertex*12)+9] = p3.x;
            vertices[(currentVertex*12)+10] = p3.y;
            vertices[(currentVertex*12)+11] = p3.z;

            uvs[(currentVertex*8)] = 0;
            uvs[(currentVertex*8)+1] = 0;
            
            uvs[(currentVertex*8)+2] = 1;
            uvs[(currentVertex*8)+3] = 0;

            uvs[(currentVertex*8)+4] = 1;
            uvs[(currentVertex*8)+5] = 1;

            uvs[(currentVertex*8)+6] = 0;
            uvs[(currentVertex*8)+7] = 1;

            var n = p1.sub(p0).cross(p3.sub(p0)).normalize();

            normals[(currentVertex*12)] = n.x;
            normals[(currentVertex*12)+1] = n.y;
            normals[(currentVertex*12)+2] = n.z;
            
            normals[(currentVertex*12)+3] = n.x;
            normals[(currentVertex*12)+4] = n.y;
            normals[(currentVertex*12)+5] = n.z;

            normals[(currentVertex*12)+6] = n.x;
            normals[(currentVertex*12)+7] = n.y;
            normals[(currentVertex*12)+8] = n.z;

            normals[(currentVertex*12)+9] = n.x;
            normals[(currentVertex*12)+10] = n.y;
            normals[(currentVertex*12)+11] = n.z;

            elements[(currentVertex*6)] = j;
            elements[(currentVertex*6)+1] = j+1;
            elements[(currentVertex*6)+2] = j+2;

            elements[(currentVertex*6)+3] = j;
            elements[(currentVertex*6)+4] = j+2;
            elements[(currentVertex*6)+5] = j+3

            currentVertex += 1;

            j+=4;

        }
        console.log(currentVertex,j)
        return [currentVertex,j];

    }

    
};




export {CylinderGrid};
