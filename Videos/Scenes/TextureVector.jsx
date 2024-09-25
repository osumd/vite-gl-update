
import * as THREE from 'three';

export default class TextureVector {

    constructor( structure_size )
    {

        
        //  In terms of the number of floats
        this.structure_size = structure_size;

        // Create the texture object.
        this.capacity = structure_size*20;
        this.tail = 0;

        // Store a structure tail
        this.structure_tail = 0;

        // Store the 
        this.array = new Float32Array( this.capacity );

        // Store a texture object
        this.texture = undefined;
        this.texture_dimension = undefined;
        this.generate_texture_object ( );

    }

    // Generate the texture object.
    generate_texture_object ( )
    {
        this.texture_dimension = new THREE.Vector2( Math.floor ( Math.sqrt ( this.capacity /4) ), Math.floor ( Math.sqrt ( this.capacity/4) ) );

        console.log(this.texture_dimension);

        this.texture = new THREE.DataTexture( this.array,  this.texture_dimension.x, this.texture_dimension.y, THREE.RGBAFormat, THREE.FloatType );
        
        this.texture.needsUpdate = true;
    }

    resize ( )
    {

        let new_array = new Float32Array ( (Math.max ( 1, Math.pow(this.capacity,2) )));

        // Copy over the previous data.
        for ( let i = 0 ; i < this.tail; i ++)
        {
            new_array[i] = this.array[i];
        }

        this.array = new_array;
        this.capacity = Math.max ( 1, Math.pow(this.capacity,2) );

        // Then generate the new texture object.
        this.generate_texture_object();

    }


    push ( value )
    {

        if ( this.tail+1 > this.capacity )
        {
            this.resize();
        }

        if ( (this.tail+1) % this.structure_size == 0 )
        {
            this.structure_tail += 1;            
        }

        this.array[this.tail] = value;

        this.tail += 1;

        this.texture.needsUpdate = true;

        


    }

};