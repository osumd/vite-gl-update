
import TextureVector from './TextureVector';

import * as THREE from 'three';

export default class LightsTexture {

    constructor ( )
    {

        // Create a texture vector
        this.texture_vector = new TextureVector(  20  );
        
        // Position, color, ambient, diffuse, specular

    }

    add_light ( location = new THREE.Vector3(0,0,0), diffuse = new THREE.Vector3(1,1,1), ambient = new THREE.Vector3(0,0,0), specular = new THREE.Vector3(1,1,1) )
    {
        this.texture_vector.push ( location.x );
        this.texture_vector.push ( location.y );
        this.texture_vector.push ( location.z );
        this.texture_vector.push ( 1.0 );

        this.texture_vector.push ( diffuse.x );
        this.texture_vector.push ( diffuse.y );
        this.texture_vector.push ( diffuse.z );
        this.texture_vector.push ( 1.0 );

        this.texture_vector.push ( ambient.x );
        this.texture_vector.push ( ambient.y );
        this.texture_vector.push ( ambient.z );
        this.texture_vector.push ( 1.0 );

        this.texture_vector.push ( specular.x );
        this.texture_vector.push ( specular.y );
        this.texture_vector.push ( specular.z );
        this.texture_vector.push ( 1.0 );

        // Store a vector here to determine the light type
        this.texture_vector.push ( 1 );
        this.texture_vector.push ( 0 );
        this.texture_vector.push ( 0 );
        this.texture_vector.push ( 1 );

    }

    add_sun_light ( location = new THREE.Vector3(0,0,0), diffuse = new THREE.Vector3(1,1,1), ambient = new THREE.Vector3(0,0,0), specular = new THREE.Vector3(1,1,1) )
    {
        this.texture_vector.push ( location.x );
        this.texture_vector.push ( location.y );
        this.texture_vector.push ( location.z );
        this.texture_vector.push ( 1.0 );

        this.texture_vector.push ( diffuse.x );
        this.texture_vector.push ( diffuse.y );
        this.texture_vector.push ( diffuse.z );
        this.texture_vector.push ( 1.0 );

        this.texture_vector.push ( ambient.x );
        this.texture_vector.push ( ambient.y );
        this.texture_vector.push ( ambient.z );
        this.texture_vector.push ( 1.0 );

        this.texture_vector.push ( specular.x );
        this.texture_vector.push ( specular.y );
        this.texture_vector.push ( specular.z );
        this.texture_vector.push ( 1.0 );

        // Store a vector here to determine the light type
        this.texture_vector.push ( 0 );
        this.texture_vector.push ( 0 );
        this.texture_vector.push ( 0 );
        this.texture_vector.push ( 1 );
    }

    struct_size ( )
    {

        return 20;

    }

    count( )
    {

        
        return this.texture_vector.structure_tail;
    }

    texture ( )
    {
        return this.texture_vector.texture;
    }

    dimension ( )
    {
        return this.texture_vector.texture_dimension;
    }

};