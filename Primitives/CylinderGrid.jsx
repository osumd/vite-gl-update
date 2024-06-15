
import * as THREE from 'three';
import { ShaderMaterial, SphereGeometry } from 'three';
import React from 'react';
import { useRef } from 'react';


class ElementMesh
{
    constructor()
    {
        // Stores the actual arrays
        this.vertices = undefined;
        this.normals = undefined;
        this.uvs = undefined;
        this.elements = undefined;

        // Stores the indexes and two custom index pointers.
        this.vertices_index = 0;
        this.elements_index = 0;
        this.uvs_index = 0;
        this.normals_index = 0;

        // Stores the two custom index pointers
        this.index_slot1 = 0;
        this.index_slot2 = 0;
    }

    allocate_all(number_vertices)
    {
        this.allocate_vertices(number_vertices*3);
        this.allocate_normals(number_vertices*3);
        this.allocate_uvs(number_vertices*2);
        this.allocate_elements(number_vertices);
    }

    allocate_vertices(amount)
    {
        this.vertices = new Float32Array(amount);
    }
    allocate_elements(amount)   
    {
        this.elements = new Uint16Array(amount);
    }
    allocate_uvs(amount)
    {
        this.uvs = new Float32Array(amount);
    }
    allocate_normals(amount)
    {
        this.normals = new Float32Array(amount);
    }

    // Push a vertex
    push_vertex(x0, x1, x2)
    {
        if ( this.vertices == undefined )
        {
            console.log("Undefined");
            return;
        }

        this.vertices[this.vertices_index++] = x0;
        this.vertices[this.vertices_index++] = x1;
        this.vertices[this.vertices_index++] = x2;
    }
    // Push a normal
    push_normal(x0, x1, x2)
    {
        if ( this.normals == undefined )
        {
            console.log("Undefined");
            return;
        }

        this.normals[this.normals_index++] = x0;
        this.normals[this.normals_index++] = x1;
        this.normals[this.normals_index++] = x2;
    }
    // Push a uv
    push_uv(x0, x1)
    {
        if ( this.uvs == undefined )
        {
            console.log("Undefined");
            return;
        }

        this.uvs[this.uvs_index++] = x0;
        this.uvs[this.uvs_index++] = x1;
        
    }
    // Push a element
    push_element(x0)
    {
        if ( this.elements == undefined )
        {
            console.log("Undefined");
            return;
        }

        this.elements[this.elements_index++] = x0;
    }

}

class CylinderGrid {

    constructor(  )
    {
        this.volume_bottom = new THREE.Vector3(0,0,0);
        this.volume_top = new THREE.Vector3(0,0,0);

        this.xdiv = xDivision;
        this.ydiv = yDivisions;
        this.radius = radius;   

        // Generate element mesh
        this.element_mesh = new ElementMesh();
        
        // Generate buffer geometry
        this.buffer_geometry = new THREE.BufferGeometry();

        // Decompose the volume into its vertices
        //this.volume_back = new THREE.Vector3(this.volume_bottom.x, this.volume_bottom.y, this.volume_top.z);
        //this.volume_right = new THREE.Vector3(this.volume_top.x, this.volume_bottom.y, this.volume_top.z);
        //this.volume_ = new THREE.Vector3(this.volume_bottom.x, this.volume_bottom.y, this.volume_top.z);
        

        // Array of two unit vectors for each face of the cube
        this.volume_unit_vectors = [
            [new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0)],
            [new THREE.Vector3(0,0,-1), new THREE.Vector3(0,1,0)],
            [new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,-1)],

        ];

        // A map with specific face rendering options
        this.face_map = {
            "front" : { unit_vectors: this.volume_unit_vectors[0], origin: this.volume_bottom.clone() },
            "back" : { unit_vectors: this.volume_unit_vectors[0], origin: new THREE.Vector3(this.volume_bottom.x, this.volume_bottom.y, this.volume_top.z) },
            "left" : { unit_vectors: this.volume_unit_vectors[1], origin: new THREE.Vector3(this.volume_bottom.x, this.volume_bottom.y, this.volume_bottom.z) },
            "right" : { unit_vectors: this.volume_unit_vectors[1], origin: new THREE.Vector3(this.volume_top.y, this.volume_bottom.y, this.volume_bottom.z) },
            "bottom" : { unit_vectors: this.volume_unit_vectors[2], origin: this.volume_bottom.clone() },
            "top" : { unit_vectors: this.volume_unit_vectors[2], origin: new THREE.Vector3(this.volume_bottom.x, this.volume_top.y, this.volume_bottom.z) },
        }

        
        
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
        
        // Access selected faces to gridify
        // For each gridified face representation a binary digit represent front,back, left, right, bottom, top etc
        

        this.buffer_geometry.setAttribute('position', new THREE.BufferAttribute(this.element_mesh.vertices, 3));
        this.buffer_geometry.bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(this.element_mesh.normals, 3));
        this.buffer_geometry.bufferGeometry.setAttribute('uv', new THREE.BufferAttribute(this.element_mesh.uvs, 2));
        // Optional: Add indices to the geometry if you're using indexed geometry
        this.buffer_geometry.setIndex(new THREE.BufferAttribute(this.element_mesh.elements, 1));

        return new THREE.Mesh( this.buffer_geometry , new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }) );


    }

    push_cylinder_back(start, end, radius, division)
    {
        // Generate cylinder axis, and axis_norm.
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
            // First angle and second angle.
            var a0 = i*dr;
            var a1 = (i+1)*dr;
            
            // Rotate norm vector
            this.quaternion_axis_angle(axis_norm, axis, a0, temp);
            //console.log(temp);
            p0.x = start.x + temp.x*radius;
            p0.y = start.y + temp.y*radius;
            p0.z = start.z + temp.z*radius;

            p1.x = end.x + temp.x*radius;
            p1.y = end.y + temp.y*radius;
            p1.z = end.z + temp.z*radius;
            
            this.quaternion_axis_angle(axis_norm, axis, a1, temp);

            p2.x = end.x + temp.x;
            p2.y = end.y + temp.y;
            p2.z = end.z+ temp.z;
            
            p3.x = start.x + temp.x;
            p3.y = start.y + temp.y;
            p3.z = start.z+ temp.z;

            
            //console.log(axis_norm);

            //console.log(p0,p1,p2,p3);

            this.element_mesh.push_vertex(p0.x, p0.y, p0.z);
            this.element_mesh.push_vertex(p1.x, p1.y, p1.z);
            this.element_mesh.push_vertex(p2.x, p2.y, p2.z);
            this.element_mesh.push_vertex(p3.x, p3.y, p3.z);

            this.element_mesh.push_uv(0,0);
            this.element_mesh.push_uv(1,0);
            this.element_mesh.push_uv(1,1);
            this.element_mesh.push_uv(0,1);

            var n = p1.sub(p0).cross(p3.sub(p0)).normalize();

            this.element_mesh.push_normal(n.x, n.y, n.z);
            this.element_mesh.push_normal(n.x, n.y, n.z);
            this.element_mesh.push_normal(n.x, n.y, n.z);
            this.element_mesh.push_normal(n.x, n.y, n.z);

            this.elements_mesh.push_element(this.element_mesh.index_slot1);
            this.elements_mesh.push_element(this.element_mesh.index_slot1+1);
            this.elements_mesh.push_element(this.element_mesh.index_slot1+2);
            this.elements_mesh.push_element(this.element_mesh.index_slot1);
            this.elements_mesh.push_element(this.element_mesh.index_slot1+2);
            this.elements_mesh.push_element(this.element_mesh.index_slot1+3);

            this.element_mesh.index_slot1 += 4;
            
        }
        

    }

};




export default CylinderGrid;
