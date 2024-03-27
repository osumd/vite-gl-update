
import React from 'react';
import * as THREE from 'three';

import { Dequeue } from '../DataStructures/Dequeue';

import { XYSphere } from '../Primitives/PrimitiveSphere';

class MeshNode {
    constructor(position, normal, uv, vertex_id){
        this.vertex_id = vertex_id;
        this.position = position;
        this.normal = normal;
        this.uv = uv;
        this.neighbors = [];
    }
}


class MeshGraph extends React.Component {


    constructor(){
        super();
        this.nodes = [];
        this.nodes_list = {};
    }


    add_node(position, normal, uv, vertex_id)
    {

        if(this.nodes_list[vertex_id] != undefined)
        {
            return;
        }

        let node = new MeshNode(position, normal, uv, vertex_id);
        this.nodes.push(node);
        this.nodes_list[vertex_id] = node;
    }

    add_edge(vertex_id_1, vertex_id_2)
    {
        let node1 = this.nodes_list[vertex_id_1];
        let node2 = this.nodes_list[vertex_id_2];

        if(node1 == undefined || node2 == undefined)
        {
            return;
        }

        node1.neighbors.push(node2);
        node2.neighbors.push(node1);
    }

    list_out()
    {
        return (
            <div>
                <p>MeshGraph</p>
                <h2>Vertices:</h2>
    
                <ul>
                    {this.nodes.map((node, index) => (
                        <li key={index}>{node.vertex_id}</li>
                    ))}
                </ul>
                
                <h2>Edges:</h2>
                <ul>
                    {this.nodes.map((node) => (
                        node.neighbors.map((neighbor, index) => (
                            <li key={index}>{node.vertex_id} - {neighbor.vertex_id}</li>
                        ))
                    ))}
                </ul>
            </div>
        );
    }

    insert_triangle(p0,p1,p2,n,uv,vertices, elements, normals, uvs, elementPack)
    {
        let current_vertex = elementPack[0];
        let j = elementPack[1];

        vertices[(current_vertex*9)] = p0.x;
        vertices[(current_vertex*9)+1] = p0.y;
        vertices[(current_vertex*9)+2] = p0.z;

        vertices[(current_vertex*9)+3] = p1.x;
        vertices[(current_vertex*9)+4] = p1.y;
        vertices[(current_vertex*9)+5] = p1.z;

        vertices[(current_vertex*9)+6] = p2.x;
        vertices[(current_vertex*9)+7] = p2.y;
        vertices[(current_vertex*9)+8] = p2.z;

        uvs[(current_vertex*6)] = uv[0];
        uvs[(current_vertex*6)+1] = uv[1];

        uvs[(current_vertex*6)+2] = uv[2];
        uvs[(current_vertex*6)+3] = uv[3];

        uvs[(current_vertex*6)+4] = uv[4];
        uvs[(current_vertex*6)+5] = uv[5];

        normals[(current_vertex*9)] = n.x;
        normals[(current_vertex*9)+1] = n.y;
        normals[(current_vertex*9)+2] = n.z;

        normals[(current_vertex*9)+3] = n.x;
        normals[(current_vertex*9)+4] = n.y;
        normals[(current_vertex*9)+5] = n.z;

        normals[(current_vertex*9)+6] = n.x;
        normals[(current_vertex*9)+7] = n.y;
        normals[(current_vertex*9)+8] = n.z;

        elements[(current_vertex*3)] = j;
        elements[(current_vertex*3)+1] = j+1;
        elements[(current_vertex*3)+2] = j+2;

        elementPack[0] = current_vertex + 1;
        elementPack[1] = j + 3;
    }

    build_triangles(vertices, elements, normals, uvs, elementPack)
    {
        
        console.log(this.nodes.length);
        let Q = new Dequeue();

        let visited = {};
        Q.push_front(this.nodes[0]);

        let max_iter = 10000;
        let k = 0;
        
        while(!Q.empty() && k < max_iter)
        {

            k++;
            let node = Q.pop_front();

            if(visited[node.vertex_id] != undefined)
            {
                continue;
            }

            visited[node.vertex_id] = true;

            let triangular_neighbors = [];

            for(let neighbor of node.neighbors)
            {
                if(visited[neighbor.vertex_id] == undefined)
                {
                    triangular_neighbors.push(neighbor);
                    
                    Q.push_front(neighbor);
                }
            }   
            
            if(triangular_neighbors.length >= 3)
            {
                let n0 = node;
                let n1 = triangular_neighbors[0];
                let n2 = triangular_neighbors[1];
                let n3 = triangular_neighbors[2];

                let v0 = n0.position;
                let v1 = n1.position;
                let v2 = n2.position;
                let v3 = n3.position;

                let n = v1.clone().sub(v0).cross(v2.clone().sub(v0)).normalize();
                
                this.insert_triangle(v0,v1,v2,n,[0,0,1,0,1,1],vertices, elements, normals, uvs, elementPack);
                this.insert_triangle(v0,v3,v2,n,[0,0,1,0,1,1],vertices, elements, normals, uvs, elementPack);     
            }

            // for(var i = 0; i+2 < triangular_neighbors.length; i+=2)
            // {
            //     let n0 = node;
            //     let n1 = triangular_neighbors[i];
            //     let n2 = triangular_neighbors[i+1];

            //     let v0 = n0.position;
            //     let v1 = n1.position;
            //     let v2 = n2.position;

            //     let n = v1.clone().sub(v0).cross(v2.clone().sub(v0)).normalize();
                
            //     this.insert_triangle(v0,v1,v2,n,[0,0,1,0,1,1],vertices, elements, normals, uvs, elementPack);

            // }

            


        }


        console.log("k: " + k.toString());
    }

    generate_mesh()
    {

        let num_tris = this.nodes.length - 2;

        let vertices = new Float32Array(num_tris * 9);
        let elements = new Uint16Array(num_tris * 3);
        let normals = new Float32Array(num_tris * 9);
        let uvs = new Float32Array(num_tris * 6);

        let elementPack = [0,0];

        this.build_triangles(vertices, elements, normals, uvs, elementPack);
        console.log(vertices);
        let bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        bufferGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        bufferGeometry.setIndex(new THREE.BufferAttribute(elements, 1));


        let baseDebugGeometry = XYSphere({radius:0.3, widthSegments: 10, heightSegments: 10});
        let instanceMesh = new THREE.InstancedMesh(baseDebugGeometry, new THREE.MeshBasicMaterial({color: 0xff0000}), this.nodes.length);
        let matrix = new THREE.Matrix4();

        for(let i = 0; i < this.nodes.length; i++)
        {
            let node = this.nodes[i];
            matrix.setPosition(node.position);
            instanceMesh.setMatrixAt(i, matrix);
        }

        return (
        <group>
            <mesh geometry={bufferGeometry} material={new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })} ></mesh>
            <primitive object={instanceMesh}></primitive>
        </group>
        );

    }

    render() {
    return (
        <div>
        </div>
    );
    }
}

export {MeshGraph};