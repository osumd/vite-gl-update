
import React,{useRef,useEffect} from 'react';
import * as THREE from 'three';

import { Dequeue } from '../DataStructures/Dequeue';
import { XYSphere } from '../../Primitives/PrimitiveSphere';

import { OpenCylinder } from '../../Primitives/PrimitiveCylinder';

import { Text } from '@react-three/drei';

class MeshNode {
    constructor(position, normal, uv, vertex_id){

        this.vertex_id = vertex_id;
        this.position = position;
        this.normal = normal;
        this.uv = uv;
        this.neighbors = new Array();
    }
}

//mesh graph
class MeshGraph extends React.Component {


    constructor(){
        super();

        ///nodes mesh node
        this.nodes = [];
        //hash array of mesh nodes
        this.nodes_list = {};
    }

    validate_no_duplicate_vertices()
    {
        let vertex_set = new Set();
        for(let node of this.nodes)
        {
            if(vertex_set.has(node.position.toArray().toString()))
            {
                console.log("duplicate vertex id");
                return false;
            }
            vertex_set.add(node.position.toArray().toString());
        }

        return true;
    }

    add_node(position, normal, uv, vertex_id)
    {

        if(this.nodes_list[vertex_id] != undefined)
        {
            console.log("duplicate");
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
            console.log("node not found");
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

    //mini algorithm which makes the mesh from the graph
    non_sharing_neighbor(in_triangulation, node, visited, Q, vertices, elements, normals, uvs, elementPack)
    {

        let nodal_neighbors = {};
        let nodal_neighbor_array = [];

        for(let neighbor of node.neighbors)
        {
            if(visited[neighbor.vertex_id] == undefined)
            {
                Q.push_front(neighbor);
                
            }

            nodal_neighbors[neighbor] = neighbor;

            nodal_neighbor_array.push(neighbor);

            
        }

       

        for(let neighbor of nodal_neighbor_array)
        {
            for(let adj_neighbor of neighbor.neighbors)
            {
                if(nodal_neighbors[adj_neighbor] != undefined)
                {
                    let p0 = node.position;
                    let p1 = neighbor.position;
                    let p2 = adj_neighbor.position;

                    let n = p1.clone().sub(p0).cross(p2.clone().sub(p0)).normalize();
                    let uv = [node.uv.x, node.uv.y, neighbor.uv.x, neighbor.uv.y, adj_neighbor.uv.x, adj_neighbor.uv.y];
                    this.insert_triangle(p0,p1,p2,n,uv,vertices, elements, normals, uvs, elementPack);
                
                    //in_triangulation[neighbor.vertex_id+adj_neighbor.vertex_id] = 1;
                }
            }
        }



    }


    choose_neighbors(in_triangulation, node, visited, Q, vertices, elements, normals, uvs, elementPack)
    {


        let p0 = node.position;

        //value for whether the correct index is found
        
        let neighbors_array = [];
        
        
        
        

        for(let neighbor of node.neighbors)
        {
            if(visited[neighbor.vertex_id] == undefined)
            {
                Q.push_front(neighbor);
                
            }  
            
            neighbors_array.push(neighbor);
        }



        let triangular_visited = {};
        let closest_index = 0;
        let closest_distance = 0;

        for(let i = 0 ; i < neighbors_array.length; i++)
        {
            let closest_distance = Math.pow(2,20);
            let closest_index = -1;

            for(let j = 0; j < neighbors_array.length; j++)
            {

                if(i != j && triangular_visited[j] == undefined)
                {

                    //distance to the neighbor
                    let distance_to_neighbor = neighbors_array[j].position.clone().sub(neighbors_array[i].position).length();
                    
                    if(distance_to_neighbor < closest_distance)
                    {
                        closest_index = j;
                        closest_distance = distance_to_neighbor;
                    }

                }

            }

            if(closest_index != -1)
            {
                
                let p0 = node.position.clone();

                let p1 = neighbors_array[i].position.clone();
                let p2 = neighbors_array[closest_index].position.clone();

                triangular_visited[closest_index] = 1;

                let n = (p1.clone().sub(p0)).cross(p2.clone().sub(p0));

                this.insert_triangle(p0, p1, p2, n, [0,0,1,0,1,1], vertices, elements, normals, uvs, elementPack);

                
            }

            //put the closest index into
            

        }



    }

    better_neighbors(in_triangulation, node, visited, Q, vertices, elements, normals, uvs, elementPack)
    {


        let p0 = node.position;

        //value for whether the correct index is found
        
        let neighbors_array = [];
        
        
        
        

        for(let neighbor of node.neighbors)
        {
            if(visited[neighbor.vertex_id] == undefined)
            {
                Q.push_front(neighbor);
                
            }  
            
            neighbors_array.push(neighbor);
        }



        let triangular_visited = {};

        for(let i = 0 ; i < neighbors_array.length; i++)
        {

            let prime = neighbors_array[i];
            let center_to_prime =   prime.position.clone().sub(node.position);

            for(let j = 0; j < neighbors_array.length; j++)
            {

                if(i != j && (triangular_visited[`{${i}+${j}}`] == undefined && triangular_visited[`{${j}+${i}}`] == undefined ))
                {
                    let subprime = neighbors_array[j];
                    let center_to_subprime = subprime.position.clone().sub(node.position);

                    //normal of our triangle should be simlar to the normals of the vertices.
                    let triangular_normal = center_to_prime.clone().cross(center_to_subprime);

                    let dot_normal_prime = triangular_normal.dot( node.normal );

                    let dot_prime_subprime = center_to_prime.dot(center_to_subprime);

                    if(dot_prime_subprime >= 0)
                    {
                        
                        let p0 = node.position.clone();

                        let p1 = neighbors_array[i].position.clone();
                        let p2 = neighbors_array[j].position.clone();

                        triangular_visited[`{${i}+${j}}`] = 1;

                        let n = (p1.clone().sub(p0)).cross(p2.clone().sub(p0));

                        this.insert_triangle(p0, p1, p2, n, [0,0,1,0,1,1], vertices, elements, normals, uvs, elementPack);

                        break;
                    }
                    





                



                }

            }


            //put the closest index into
            

        }



    }


    build_triangles(vertices, elements, normals, uvs, elementPack)
    {
        let Q = new Dequeue();

        let visited = {};
        Q.push_front(this.nodes[0]);

        let max_iter = 10000;
        let k = 0;

        //hash map for vertices already in triangulation
        let in_trianglulation = {};

        while(!Q.empty() && k < max_iter)
        {

            k++;
            let node = Q.pop_front();

            if(visited[node.vertex_id] != undefined)
            {
                continue;
            }

            visited[node.vertex_id] = true;


            let nodal_neighbors = {};
            let nodal_neighbor_array = [];

            //this.non_sharing_neighbor(in_trianglulation, node, visited, Q, vertices, elements, normals, uvs, elementPack);
            //this.choose_neighbors(in_trianglulation, node, visited, Q, vertices, elements, normals, uvs, elementPack);
            this.better_neighbors(in_trianglulation, node, visited, Q, vertices, elements, normals, uvs, elementPack);
            //this.non_sharing_neighbor(node, visited, Q, vertices, elements, normals, uvs, elementPack);



        }


        /* console.log("k: " + k.toString());
        console.log("num_tris: " + num_tris.toString()); */
    }


    generate_mesh_debug_geometry()
    {
        let debug_geometry = new XYSphere({radius:1, widthSegments: 10, heightSegments: 10  });
        let debug_cylinder = new OpenCylinder();

        let instance_debug = new THREE.InstancedMesh(debug_geometry, new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }), this.nodes.length);
        let instance_cylinder = new THREE.InstancedMesh(debug_cylinder, new THREE.MeshBasicMaterial({ color: 0xffAA00, side: THREE.DoubleSide }), this.nodes.length*10);

        let debug_visited = {}

        let edge_instance = 0;

        for(let i = 0; i < this.nodes.length; i++)
        {

            let node = this.nodes[i];
            let m = new THREE.Matrix4();
            m.setPosition(node.position);
            m.scale(new THREE.Vector3(0.05,0.05,0.05));
            instance_debug.setMatrixAt(i, m);

            for(let n = 0; n < node.neighbors.length; n++)
            {
                let neighbor = node.neighbors[n];
                let edge_desc = node.vertex_id + "-" + neighbor.vertex_id;

                if(debug_visited[edge_desc] == undefined)
                {
                    //debug_visited[edge_desc] = true;


                    let axis = neighbor.position.clone().sub(node.position);
                    let al = axis.length();
                    let axis_norm = axis.clone().cross(new THREE.Vector3(0,1,0)).normalize();
                    let angle = Math.acos(new THREE.Vector3(0,1,0).dot(axis)/al);
                    axis.normalize();

                    //how to compose my scale position and rotation? 
                    let quaternion = new THREE.Quaternion().setFromAxisAngle(axis_norm, -angle);
                    let mc = new THREE.Matrix4().compose(node.position, quaternion, new THREE.Vector3(1, al, 1));

                    //mc.scale(new THREE.Vector3(0.2,0.2,0.2));
                    instance_cylinder.setMatrixAt(edge_instance, mc);
                    edge_instance++;
                }


            }


        }

        instance_debug.instanceMatrix.needsUpdate = true;
        instance_cylinder.instanceMatrix.needsUpdate = true;

        return {points: instance_debug, edges: instance_cylinder};
    }

    generate_mesh()
    {

        let num_tris = this.nodes.length*24;

        let vertices = new Float32Array(num_tris * 9);
        let elements = new Uint16Array(num_tris * 3);
        let normals = new Float32Array(num_tris * 9);
        let uvs = new Float32Array(num_tris * 6);

        let elementPack = [0,0];

        this.build_triangles(vertices, elements, normals, uvs, elementPack);
        
        let bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        bufferGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        bufferGeometry.setIndex(new THREE.BufferAttribute(elements, 1));

        let debug_geometry = this.generate_mesh_debug_geometry();
        

        return (
        <group ref={this.groupRef}>
            <mesh geometry={bufferGeometry} material={new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })} ></mesh>
            
            
            <primitive object={debug_geometry.points}></primitive>
            <primitive object={debug_geometry.edges}></primitive> 
            
            {this.text_debug}
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


function debugSpheres(graph) {

    let instanceCount = graph.nodes.length;
    const meshRef = useRef();


    let baseDebugGeometry = XYSphere({radius:1, widthSegments: 10, heightSegments: 10});
    
    useEffect(() => {   
        if(meshRef.current)
        {

            //console.log(graph, graph.nodes.length)
            
            for(let i = 0; i < graph.nodes.length; i++)
            {
                let matrix = new THREE.Matrix4();
                let node = graph.nodes[i];
                matrix.setPosition(node.position);
                
                //set scale of object
                matrix.scale(new THREE.Vector3(0.05,0.05,0.05));
                meshRef.current.setMatrixAt(i, matrix);
                //console.log(meshRef);
            }
    
            meshRef.current.instanceMatrix.needsUpdate = true;
    
        } 

    }, [graph.nodes]);
    

    return (
        <instancedMesh ref={meshRef} args={[baseDebugGeometry, new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }), instanceCount]}>
        </instancedMesh>
    );

}

export {MeshGraph};