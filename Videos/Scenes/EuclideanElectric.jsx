
import ElementMesh from '../../Primitives/ElementMesh';

import * as THREE from 'three';

function max_e(a,b)
{
    if ( a > b )
    {
        return a;
    }
    if ( b > a )
    {
        return b;
    }

    return a;
}

// Euclidean algorithm for greatest common divisor.
function euclidean_algorithm(a,b)
{
    if ( a == b )
    {
        return a;
    }
    if ( a == 0 )
    {
        return b;
    }
    if ( b == 0 )
    {
        
        return a;
    }

    if ( a > b )
    {
        let r = a % b;
        
        return euclidean_algorithm(b, r);
    }
    if ( b > a )
    {
        let r = b % a;
        
        return euclidean_algorithm(a, r);
    }

    
        

}

// CPU Edition
function gcd(a,b)
{
    
    let x = euclidean_algorithm(a[0], b[0]);
    
    let y = euclidean_algorithm(a[1], b[1]);
    let z = euclidean_algorithm(a[2], b[2]);
    
    return new THREE.Vector3(x,y,z);

}

// Euclidean algorithm which returns all the constitutes of the algorithmic process
function extended_euclidean_algorithm(a,b, quotients, remainders)
{
    if ( a == 0 )
    {
        return b;
    }
    if ( b == 0 )
    {
        
        return a;
    }

    if ( a > b )
    {
        let r = a % b;
        let q = a/b;

        // Push the quotients
        quotients.push(q);

        // Push the remainders
        remainders.push(r);

        return extended_euclidean_algorithm(b, r);
    }
    if ( b > a )
    {
        let r = b % a;
        let q = b/a;

        // Push the quotients
        quotients.push(q);

        // Push the remainders
        remainders.push(r);

        return extended_euclidean_algorithm(a, r);
    }
}

// Euclidean electric.
export default class EuclideanElectric
{

    constructor(scene_context)
    {
        this.scene_context = scene_context;

        // Set the boundary volume
        this.boundary_volume = [new THREE.Vector3(-1,-1, 1), new THREE.Vector3(1, 1, -1)];

        // Set the amount of inital particle allowed.
        this.boundary_particle_limit = 20;
        // Set the boundary limit on charged particles for their modular space.
        this.boundary_particle_modular_limit = [ Math.ceil(this.boundary_particle_limit/3), Math.ceil(this.boundary_particle_limit/3), Math.ceil(this.boundary_particle_limit/3)];

        // This mod pointer considers which point in the integer space to sample for the placement of a "point charge"
        this.space_mod = [0,0,0];

        // Set up intermediate results from latest extended GCD [ simple extend to full sequence. ]
        this.boundary_gcd = [0,0,0];

        // Set up the intermediate integer coordinate location
        this.boundary_particle_coordinates = [];

        // Set up the boundary electric field
        this.boundary_electric_field = [];

        // Set up a CPU element mesh
        this.boundary_element_mesh = new ElementMesh();
        this.boundary_element_buffer_geometry = new THREE.BufferGeometry();

        


    }

    test_stage0()
    {
        this.generate_boundary_conditions();
        this.mesh_boundary_particles();

        this.boundary_element_buffer_geometry.setAttribute("position", new THREE.BufferAttribute(this.boundary_element_mesh.vertices, 3));
        this.boundary_element_buffer_geometry.setAttribute("normal", new THREE.BufferAttribute(this.boundary_element_mesh.normals, 3));
        this.boundary_element_buffer_geometry.setAttribute("uv", new THREE.BufferAttribute(this.boundary_element_mesh.uvs, 2));

        this.boundary_element_buffer_geometry.setIndex(new THREE.BufferAttribute(this.boundary_element_mesh.elements, 1));
        
        let vertex_shader = `
            varying vec2 vUv;
            varying vec3 vNorm;

            // Layout of the buffer, 

            void main() {
                vUv = uv;
                vNorm = normal;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `

        let fragment_shader = `
            varying vec2 vUv;
            varying vec3 vNorm;

            void main()
            {
                gl_FragColor = vec4(1.0, vUv.y, 0.0, 1.0);
            }
            
        `

        let material = new THREE.ShaderMaterial({
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader,
            side: THREE.DoubleSide
        });
        let mesh = new THREE.Mesh(this.boundary_element_buffer_geometry, material);
        this.scene_context.scene.add(mesh);

    }


    // Method for distributing along the volume space for inital point charge selection
    advance_along_boundary()
    {

        this.space_mod[0] = Math.floor( ( this.space_mod[0] + this.boundary_gcd[0] ) % this.boundary_particle_modular_limit[0] );
        this.space_mod[1] =  Math.floor( ( this.space_mod[1] + this.boundary_gcd[1] ) % this.boundary_particle_modular_limit[1] );
        this.space_mod[2] =  Math.floor( ( this.space_mod[2] + this.boundary_gcd[2] ) % this.boundary_particle_modular_limit[2] );

    }

    // Always CPU
    // Generates initial space charges using GCD over predefined volume V.
    generate_boundary_conditions()
    {
        
        // Reset the space mod with the original seed value, so that there isn't always a single particle at the origin.
        this.space_mod = [ Math.floor( 0 + Math.random()*this.boundary_particle_modular_limit[0] ), Math.floor( 0 + Math.random()*this.boundary_particle_modular_limit[1] ), Math.floor( 0 + Math.random()*this.boundary_particle_modular_limit[2] ) ];
        
        // Keep track of certain statistics about the simulation.
        let max_particle_charge = 0;

        // Iterate through all particles of the boundary condition
        for ( let p = 0; p < this.boundary_particle_limit; p++ )
        {

            // Generate the GCD at the space mod.
            this.boundary_gcd[0] = euclidean_algorithm( this.space_mod[0], this.space_mod[2] );
            this.boundary_gcd[1] = euclidean_algorithm( this.space_mod[1], this.space_mod[2] );
            this.boundary_gcd[2] = euclidean_algorithm( this.space_mod[0], this.space_mod[1] );

            // Generate some way of measure the charge on the particle
            let particle_charge = (this.boundary_gcd[0] + this.boundary_gcd[1] + this.boundary_gcd[2] );

            // Store the integer coordinate
            this.boundary_particle_coordinates.push( [this.boundary_gcd[0], this.boundary_gcd[1], this.boundary_gcd[2], particle_charge] );

            // Advance with the sub results.
            this.advance_along_boundary();

            

            max_particle_charge = max_e(max_particle_charge, particle_charge);

            //console.log(this.boundary_gcd, this.space_mod);
            

        }

    
        // At this point allocate enough space  for the boundary meshes
        this.boundary_element_mesh.allocate_all( this.boundary_particle_limit*max_particle_charge*4 );

    }

    // CPU Edition
    advect_boundary_particles()
    {
        // Setup temporary force_vector.
        let electric_field_vector = new THREE.Vector3(0,0,0);
        // Vector difference between the current particle and the other one.
        let difference_vector = new THREE.Vector3(0,0,0);

        for( let p = 0 ; p < this.boundary_particle_coordinates.length; p++ )
        {
            // Set up the main particle coordinate.
            let main_particle_coordinate = this.boundary_particle_coordinates[p];

            // Reset the force vector.
            electric_field_vector.x = 0;
            electric_field_vector.y = 0;
            electric_field_vector.z = 0;

            // Calculate electric field with respect to the current particle.
            for ( let c = 0; c < this.boundary_particle_coordinates; c++ )
            {
                // Something something self forces?
                if ( c == p )
                {
                    continue;
                }

                // Set up the other coordinate.
                let other_particle_coordinate = this.boundary_particle_coordinates[p];

                // Calculate the difference
                difference_vector.x = main_particle_coordinate[0] - other_particle_coordinate[0];
                difference_vector.y = main_particle_coordinate[1] - other_particle_coordinate[1];
                difference_vector.z = main_particle_coordinate[2] - other_particle_coordinate[2];

                // q*x-x1/|x-x1|^3
                difference_vector.divideScalar( Math.pow( difference_vector.length(),3) ).multiplyScalar(other_particle_coordinate[3]);
                
                // Then E(x) = sum p(x)
                electric_field_vector.add(difference_vector);

            }

        }

    }

    

    
    // CPU Edition
    inner_mesh_method(x,y,z,i,j,k, particle_charge, px, py, pz)
    {

        
        // A list of neighbors
        let neighbors = [];

        // Import all neighbors that exist, min limits
        if ( x > 0 )
        {
            neighbors.push([x-1, y, z]);
        }
        if ( y > 0 )
        {
            neighbors.push([x, y-1, z]);
        }
        if ( z > 0 )
        {
            neighbors.push([x, y, z-1]);
        }

        // Import all neighbors that exist, max limits
        if ( x < i-1 )
        {
            neighbors.push([x+1, y, z]);
        }

        if ( y < j-1 )
        {
            neighbors.push([x, y+1, z]);
        }

        if ( z < k-1 )
        {
            neighbors.push([x, y, z+1]);
        }

        let origin = [x,y,z];

        

        if ( neighbors.length == 6 )
        {
            
            // Then define all of the components of the neighbors
            let left = neighbors[0];
            let right = neighbors[3];
            let bottom = neighbors[1];

            let top = neighbors[4];
            let back = neighbors[2];
            let front = neighbors[5];

            let x0 = gcd(right, left);
            let x1 = gcd(left, right);
            let x2 = gcd(top, bottom);
            let x3 = gcd(back, front);
            
            // Try to calculate a normal for our dot normal electric matrix style.
            let n = x1.clone().sub(x0).cross(x2.clone().sub(x0));
            // insert function to find greatest dot product amongst the 3 axis to determine relationship, then achieve "correct" normal.
            
            // Generate distance from the current location to the particle center
            //let relative_position = new THREE.Vector3(i,j,k) + new THREE.Vector3(x,y,z);
            let distance = Math.floor( Math.sqrt( x*x + y*y + z*z ) );

            let volume_difference = this.boundary_volume[1].clone().sub(this.boundary_volume[0]);

            // Let volume difference be measurable
            x0.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x1.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x2.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x3.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));

            x0.normalize();
            x1.normalize();
            x2.normalize();
            x3.normalize();

            x0 = new THREE.Vector3(x0.x * volume_difference.x, x0.y * volume_difference.y, x0.z *volume_difference.z);
            x1 = new THREE.Vector3(x1.x * volume_difference.x, x1.y * volume_difference.y, x1.z *volume_difference.z);
            x2 = new THREE.Vector3(x2.x * volume_difference.x, x2.y * volume_difference.y, x2.z *volume_difference.z);
            x3 = new THREE.Vector3(x3.x * volume_difference.x, x3.y * volume_difference.y, x3.z *volume_difference.z);
            //x0.multiply(volume_difference);
            //x1.multiply(volume_difference);
            //x2.multiply(volume_difference);

            // Then just push the verticies into the element mesh
            this.boundary_element_mesh.push_vertex(x0.x, x0.y, x0.z);
            this.boundary_element_mesh.push_vertex(x1.x, x1.y, x1.z);
            this.boundary_element_mesh.push_vertex(x2.x, x2.y, x2.z);
            this.boundary_element_mesh.push_vertex(x3.x, x3.y, x3.z);

            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);

            this.boundary_element_mesh.push_uv(0,0);
            this.boundary_element_mesh.push_uv(1,0);
            this.boundary_element_mesh.push_uv(1,1);
            this.boundary_element_mesh.push_uv(0,1);

            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+2);

            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+2);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+3);

            this.boundary_element_mesh.index_slot1 += 4;
        }

        if ( neighbors.length == 5 && x == 0 )
        {   
            
            // Then define all of the components of the neighbors
            let bottom = neighbors[0];
            let back = neighbors[1];
            let right = neighbors[2];
            let top = neighbors[3];
            let front = neighbors[4];

            let x0 = gcd(right, origin);
            let x1 = gcd(origin, right);
            let x2 = gcd(top, bottom);
            let x3 = gcd(back, front);
            
            // Try to calculate a normal for our dot normal electric matrix style.
            let n = x1.clone().sub(x0).cross(x2.clone().sub(x0));
            // insert function to find greatest dot product amongst the 3 axis to determine relationship, then achieve "correct" normal.
            
            // Generate distance from the current location to the particle center
            //let relative_position = new THREE.Vector3(i,j,k) + new THREE.Vector3(x,y,z);
            let distance = Math.floor( Math.sqrt( x*x + y*y + z*z ) );

            let volume_difference = this.boundary_volume[1].clone().sub(this.boundary_volume[0]);

            // Let volume difference be measurable
            x0.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x1.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x2.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x3.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));

            x0.normalize();
            x1.normalize();
            x2.normalize();
            x3.normalize();

            x0 = new THREE.Vector3(x0.x * volume_difference.x, x0.y * volume_difference.y, x0.z *volume_difference.z );
            x1 = new THREE.Vector3(x1.x * volume_difference.x, x1.y * volume_difference.y, x1.z *volume_difference.z );
            x2 = new THREE.Vector3(x2.x * volume_difference.x, x2.y * volume_difference.y, x2.z *volume_difference.z );
            x3 = new THREE.Vector3(x3.x * volume_difference.x, x3.y * volume_difference.y, x3.z *volume_difference.z);
            //x0.multiply(volume_difference);
            //x1.multiply(volume_difference);
            //x2.multiply(volume_difference);

            // Then just push the verticies into the element mesh
            this.boundary_element_mesh.push_vertex(x0.x, x0.y, x0.z);
            this.boundary_element_mesh.push_vertex(x1.x, x1.y, x1.z);
            this.boundary_element_mesh.push_vertex(x2.x, x2.y, x2.z);
            this.boundary_element_mesh.push_vertex(x3.x, x3.y, x3.z);

            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);

            this.boundary_element_mesh.push_uv(0,0);
            this.boundary_element_mesh.push_uv(1,0);
            this.boundary_element_mesh.push_uv(1,1);
            this.boundary_element_mesh.push_uv(0,1);

            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+2);

            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+2);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+3);

            this.boundary_element_mesh.index_slot1 += 4;
        }

        if ( neighbors.length == 5 && x >= i-1)
        {
            

            // Then define all of the components of the neighbors
            let left = neighbors[0];
            let bottom = neighbors[1];
            let back = neighbors[2];
            let top = neighbors[3];
            let front = neighbors[4];

            let x0 = gcd(origin, left);
            let x1 = gcd(left, origin);
            let x2 = gcd(top, bottom);
            let x3 = gcd(back, front);
            
            // Try to calculate a normal for our dot normal electric matrix style.
            let n = x1.clone().sub(x0).cross(x2.clone().sub(x0));
            // insert function to find greatest dot product amongst the 3 axis to determine relationship, then achieve "correct" normal.
            
            // Generate distance from the current location to the particle center
            //let relative_position = new THREE.Vector3(i,j,k) + new THREE.Vector3(x,y,z);
            let distance = Math.floor( Math.sqrt( x*x + y*y + z*z ) );

            let volume_difference = this.boundary_volume[1].clone().sub(this.boundary_volume[0]);

            // Let volume difference be measurable
            x0.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x1.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x2.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x3.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));

            x0.normalize();
            x1.normalize();
            x2.normalize();
            x3.normalize();

            x0 = new THREE.Vector3(x0.x * volume_difference.x, x0.y * volume_difference.y, x0.z *volume_difference.z);
            x1 = new THREE.Vector3(x1.x * volume_difference.x, x1.y * volume_difference.y, x1.z *volume_difference.z);
            x2 = new THREE.Vector3(x2.x * volume_difference.x, x2.y * volume_difference.y, x2.z *volume_difference.z);
            x3 = new THREE.Vector3(x3.x * volume_difference.x, x3.y * volume_difference.y, x3.z *volume_difference.z);
            //x0.multiply(volume_difference);
            //x1.multiply(volume_difference);
            //x2.multiply(volume_difference);

            // Then just push the verticies into the element mesh
            this.boundary_element_mesh.push_vertex(x0.x, x0.y, x0.z);
            this.boundary_element_mesh.push_vertex(x1.x, x1.y, x1.z);
            this.boundary_element_mesh.push_vertex(x2.x, x2.y, x2.z);
            this.boundary_element_mesh.push_vertex(x3.x, x3.y, x3.z);

            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);

            this.boundary_element_mesh.push_uv(0,0);
            this.boundary_element_mesh.push_uv(1,0);
            this.boundary_element_mesh.push_uv(1,1);
            this.boundary_element_mesh.push_uv(0,1);

            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+2);

            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+2);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+3);

            this.boundary_element_mesh.index_slot1 += 4;

        }
        
        if ( neighbors.length == 5 && y >= j-1)
        {
            // Then define all of the components of the neighbors
            let left = neighbors[0];
            let bottom = neighbors[1];
            let back = neighbors[2];
            
            let right = neighbors[3];
            let front = neighbors[4];

            let x0 = gcd(right, left);
            let x1 = gcd(left, right);
            let x2 = gcd(origin, bottom);
            let x3 = gcd(back, front);
            
            // Try to calculate a normal for our dot normal electric matrix style.
            let n = x1.clone().sub(x0).cross(x2.clone().sub(x0));
            // insert function to find greatest dot product amongst the 3 axis to determine relationship, then achieve "correct" normal.
            
            // Generate distance from the current location to the particle center
            //let relative_position = new THREE.Vector3(i,j,k) + new THREE.Vector3(x,y,z);
            let distance = Math.floor( Math.sqrt( x*x + y*y + z*z ) );

            let volume_difference = this.boundary_volume[1].clone().sub(this.boundary_volume[0]);

            // Let volume difference be measurable
            x0.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x1.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x2.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x3.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));

            x0.normalize();
            x1.normalize();
            x2.normalize();
            x3.normalize();

            x0 = new THREE.Vector3(x0.x * volume_difference.x, x0.y * volume_difference.y, x0.z *volume_difference.z);
            x1 = new THREE.Vector3(x1.x * volume_difference.x, x1.y * volume_difference.y, x1.z *volume_difference.z);
            x2 = new THREE.Vector3(x2.x * volume_difference.x, x2.y * volume_difference.y, x2.z *volume_difference.z);
            x3 = new THREE.Vector3(x3.x * volume_difference.x, x3.y * volume_difference.y, x3.z *volume_difference.z);
            //x0.multiply(volume_difference);
            //x1.multiply(volume_difference);
            //x2.multiply(volume_difference);

            // Then just push the verticies into the element mesh
            this.boundary_element_mesh.push_vertex(x0.x, x0.y, x0.z);
            this.boundary_element_mesh.push_vertex(x1.x, x1.y, x1.z);
            this.boundary_element_mesh.push_vertex(x2.x, x2.y, x2.z);
            this.boundary_element_mesh.push_vertex(x3.x, x3.y, x3.z);

            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);

            this.boundary_element_mesh.push_uv(0,0);
            this.boundary_element_mesh.push_uv(1,0);
            this.boundary_element_mesh.push_uv(1,1);
            this.boundary_element_mesh.push_uv(0,1);

            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+2);

            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+2);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+3);

            this.boundary_element_mesh.index_slot1 += 4;

        }
        
        if ( neighbors.length == 5 && z >= k-1)
        {
            // Then define all of the components of the neighbors
            let left = neighbors[0];
            let bottom = neighbors[1];
            let back = neighbors[2];
            let right = neighbors[3];
            let top = neighbors[4];

            let x0 = gcd(right, left);
            let x1 = gcd(left, right);
            let x2 = gcd(top, bottom);
            let x3 = gcd(back, origin);
            
            // Try to calculate a normal for our dot normal electric matrix style.
            let n = x1.clone().sub(x0).cross(x2.clone().sub(x0));
            // insert function to find greatest dot product amongst the 3 axis to determine relationship, then achieve "correct" normal.
            
            // Generate distance from the current location to the particle center
            //let relative_position = new THREE.Vector3(i,j,k) + new THREE.Vector3(x,y,z);
            let distance = Math.floor( Math.sqrt( x*x + y*y + z*z ) );

            let volume_difference = this.boundary_volume[1].clone().sub(this.boundary_volume[0]);

            // Let volume difference be measurable
            x0.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x1.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x2.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));
            x3.multiplyScalar( particle_charge* 1/distance).add(new THREE.Vector3(px,py,pz));

            x0.normalize();
            x1.normalize();
            x2.normalize();
            x3.normalize();

            x0 = new THREE.Vector3(x0.x * volume_difference.x, x0.y * volume_difference.y, x0.z *volume_difference.z);
            x1 = new THREE.Vector3(x1.x * volume_difference.x, x1.y * volume_difference.y, x1.z *volume_difference.z);
            x2 = new THREE.Vector3(x2.x * volume_difference.x, x2.y * volume_difference.y, x2.z *volume_difference.z);
            x3 = new THREE.Vector3(x3.x * volume_difference.x, x3.y * volume_difference.y, x3.z *volume_difference.z);
            //x0.multiply(volume_difference);
            //x1.multiply(volume_difference);
            //x2.multiply(volume_difference);

            // Then just push the verticies into the element mesh
            this.boundary_element_mesh.push_vertex(x0.x, x0.y, x0.z);
            this.boundary_element_mesh.push_vertex(x1.x, x1.y, x1.z);
            this.boundary_element_mesh.push_vertex(x2.x, x2.y, x2.z);
            this.boundary_element_mesh.push_vertex(x3.x, x3.y, x3.z);

            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);
            this.boundary_element_mesh.push_normal(n.x,n.y,n.z);

            this.boundary_element_mesh.push_uv(0,0);
            this.boundary_element_mesh.push_uv(1,0);
            this.boundary_element_mesh.push_uv(1,1);
            this.boundary_element_mesh.push_uv(0,1);

            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+2);

            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+2);
            this.boundary_element_mesh.push_element(this.boundary_element_mesh.index_slot1+3);

            this.boundary_element_mesh.index_slot1 += 4;

        }
        


    }

    // CPU Edition
    mesh_boundary_particles()
    {

        for ( let p = 0; p < this.boundary_particle_limit; p++ )
        {

            // Get the charge of the particle
            let main_particle_coordinate = this.boundary_particle_coordinates[p];

            

            // Get the particle charge.
            let particle_charge = main_particle_coordinate[3];

            // Calculate the dimensions of the mesh boundary
            let i = Math.ceil(particle_charge/3);
            let j = Math.ceil(particle_charge/3);
            let k = Math.ceil(particle_charge/3);

            console.log(main_particle_coordinate, i,j,k);

            // Calculate position of particle
            let px = main_particle_coordinate[0];
            let py = main_particle_coordinate[1];
            let pz = main_particle_coordinate[2];

            

            for ( let x = 0; x < i; x++ )
            {
                for ( let y = 0; y < j; y++ )
                {
                    for ( let z = 0; z < k; z++ )
                    {
                        // Then we generate and build the mesh.
                        this.inner_mesh_method(x,y,z,i,j,k, particle_charge, px*5.0, py*5.0, pz*5.0);
                        
                    }
                }
            }
            


        }

    }

    

    // Develops on the integer coordinatep
    simulate()
    {
        
    }
    

};