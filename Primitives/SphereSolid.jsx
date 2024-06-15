

import * as THREE from 'three';
import { ShaderMaterial, SphereGeometry } from 'three';


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

class SphereSolid
{
        constructor(scene_context)
        {
            this.scene_context = scene_context;

            // Create an element mesh
            this.element_mesh = new ElementMesh();

            //Create the buffer geometry item.
            this.buffer_geometry = new THREE.BufferGeometry();
        }
        
        sample_uv_sphere(u,v)
        {
            return [(2*u)/(1+(u*u)+(v*v)), (2*v)/(1+(v*v)+(u*u)), (1-(u*u)-(v*v))/(1+(u*u)+(v*v))];
        }

        get_uv_neighbor(neighbor)
        {
            if ( neighbor == undefined)
            {
                console.log("undefined");
                return [0,0];
            }
            let neighbor_area = neighbor.area;

            // Get the uv of the neighbor area
            let nu = neighbor_area[0] + ( neighbor_area[2] - neighbor_area[0] )/2;
            let nv = neighbor_area[1] + ( neighbor_area[3] - neighbor_area[1] )/2;

            return  [nu,nv];
        }

        add_face(uv0, uv1, uv2)
        {
            let [x0,y0,z0] = this.sample_uv_sphere(uv0[0], uv0[1]);
            let [x1,y1,z1] = this.sample_uv_sphere(uv1[0], uv1[1]);
            let [x2,y2,z2] = this.sample_uv_sphere(uv2[0], uv2[1]);

            this.element_mesh.push_vertex( x0, y0, z0  );
            this.element_mesh.push_vertex( x1, y1, z1  );
            this.element_mesh.push_vertex( x2, y2, z2  );

            let nalpha = [(y0*z1 - y1*z0), -1*(x0*z1 - x1*z0), (x0*y1 - x1*y0)];
            
            this.element_mesh.push_normal( nalpha[0], nalpha[1], nalpha[2]);
            this.element_mesh.push_normal( nalpha[0], nalpha[1], nalpha[2]);
            this.element_mesh.push_normal( nalpha[0], nalpha[1], nalpha[2]);

            this.element_mesh.push_uv(0,0);
            this.element_mesh.push_uv(1,0);
            this.element_mesh.push_uv(1,1);

            this.element_mesh.push_element( this.element_mesh.elements_index );
            this.element_mesh.push_element( this.element_mesh.elements_index );
            this.element_mesh.push_element( this.element_mesh.elements_index );

        }

        generate_mesh()
        {
            // Number of vertices or number of sections.
            let n = 3;
            // Define a sections array for the section areas and their neighbors.
            let sections = [];

            //Allocate the element mesh
            this.element_mesh.allocate_all( (n)*(n/2)*(12) );

            // Columns and rows.
            let current_row = 0;
            let current_column = 0;

            // Generate the sections
            for ( let i = 0; i < (n) ; i++)
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

                //this.scene_context.instanceMachine.add_xy_sphere(new THREE.Vector3(u,v,0), 0.03);

                // Visit the center section  uv
                //this.scene_context.eventSystem.add_event({object:this.scene_context.camera, duration:1},{attribute:"position", to:new THREE.Vector3(u,v,1)});
                //this.scene_context.eventSystem.add_animation_group();

                

                // case for each length of neighbors
                // case 1 four, we just want square fan
                // case 2 three, we are on either edge rtb ltb
                // case 3 two, we are in a corner

                if ( sections[s].neighbors.length == 4 )
                {

                    //this.scene_context.eventSystem.add_animation_group();

                    let l_n = sections[sections[s].neighbors[0]];
                    let r_n = sections[sections[s].neighbors[1]];
                    let t_n = sections[sections[s].neighbors[2]];
                    let b_n = sections[sections[s].neighbors[3]];

                    let l_uv = this.get_uv_neighbor(l_n);
                    let r_uv = this.get_uv_neighbor(r_n);
                    let t_uv = this.get_uv_neighbor(t_n);
                    let b_uv = this.get_uv_neighbor(b_n);

                    //let [lx,ly,lz] = this.sample_uv_sphere(l_uv[0], l_uv[1]);

                    //this.scene_context.instanceMachine.add_xy_sphere(new THREE.Vector3(l_uv[0], l_uv[1]), 0.01);

                    //this.scene_context.instanceMachine.add_xy_sphere(new THREE.Vector3(lx, ly, lz), 0.01);

                    

                    //this.scene_context.eventSystem.add_text({text:`[${l_uv[0]},${l_uv[1]}]`, duration: 2, size: 1, position:new THREE.Vector3(lx,ly,lz) }, {attribute:"scale", from: new THREE.Vector3(0,0,0), to: new THREE.Vector3(1,1,1)});

                    //this.scene_context.eventSystem.add_event({object: this.scene_context.camera, duration: 2, start: "last"}, {attribute: "position", to: new THREE.Vector3(lx,ly, lz)});
                    this.add_face([u,v], r_uv, t_uv);
                    this.add_face([u,v], l_uv, t_uv);
                    this.add_face([u,v], l_uv, b_uv);
                    this.add_face([u,v], b_uv, r_uv);

                    //this.scene_context.eventSystem.dispose_animation_group();

                }

                if ( sections[s].neighbors.length == 3 )
                {
                    let adj_n = sections[sections[s].neighbors[0]];
                    let t_n = sections[sections[s].neighbors[1]];
                    let b_n = sections[sections[s].neighbors[2]];

                    let adj_uv = this.get_uv_neighbor(adj_n);
                    let t_uv = this.get_uv_neighbor(t_n);
                    let b_uv = this.get_uv_neighbor(b_n);


                    this.add_face([u,v], adj_uv, t_uv);
                    this.add_face([u,v], adj_uv, b_uv);

                }

                if ( sections[s].neighbors.length == 2 )
                {

                    let adj_n = sections[sections[s].neighbors[0]];
                    let vert_n = sections[sections[s].neighbors[1]];


                    let adj_uv = this.get_uv_neighbor(adj_n);
                    let vert_uv = this.get_uv_neighbor(vert_n);

                    this.add_face([u,v], adj_uv, vert_uv);

                }

            }

            
            
            this.buffer_geometry.setAttribute('position', new THREE.BufferAttribute(this.element_mesh.vertices, 3));
            this.buffer_geometry.setAttribute('normal', new THREE.BufferAttribute(this.element_mesh.normals, 3));
            this.buffer_geometry.setAttribute('uv', new THREE.BufferAttribute(this.element_mesh.uvs, 2));

            // // Optional: Add indices to the geometry if you're using indexed geometry
            this.buffer_geometry.setIndex(new THREE.BufferAttribute(this.element_mesh.elements, 1));


            return this.buffer_geometry;

        }
    
}




export default SphereSolid;
