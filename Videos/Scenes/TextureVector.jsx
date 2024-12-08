
import * as THREE from 'three';

export default class TextureVector {

    constructor( structure_size, format = THREE.RGBAFormat )
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

        // Store the tag type of texture vector system
        this.tag_type = "texture_vector";

        // Store the format
        this.format = format;

        // Store a texture object
        this.texture_data = undefined;
        this.texture_dimension = undefined;
        this.generate_texture_object ( );

        

        //System for named indexes of structures
        this.struct_index_map = {};

    }

    // Generate the texture object.
    generate_texture_object ( )
    {
        this.texture_dimension = new THREE.Vector2( Math.floor ( Math.sqrt ( this.capacity /4) ), Math.floor ( Math.sqrt ( this.capacity/4) ) );

        //console.log(this.texture_dimension);

        this.texture_data = new THREE.DataTexture( this.array,  this.texture_dimension.x, this.texture_dimension.y, this.format, THREE.FloatType );
        
        this.texture_data.needsUpdate = true;
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

    set_size ( value, capacity )
    {
        //console.log(`TextureVector: setting size: ${capacity}`);

        if ( capacity > this.capacity )
        {   
            this.capacity = capacity;
            let new_array = new Float32Array ( (Math.max ( 1, Math.pow(this.capacity,2) )));

            // Copy over the previous data.
            for ( let i = 0 ; i < this.tail; i ++)
            {
                new_array[i] = this.array[i];
            }



            for (let i = this.tail; i < this.capacity; i++)
            {
                new_array[i] = 0.5;
            }

            this.array = new_array;
            this.generate_texture_object();



        }



    }

    push ( value, structure_name = undefined )
    {

        if ( this.tail+1 > this.capacity )
        {
            this.resize();
        }

        if ( (this.tail+1) % this.structure_size == 0 )
        {
            
            this.structure_tail += 1;

            if (structure_name != undefined)
            {
                console.log("validated");
                this.struct_index_map[structure_name] = this.structure_tail-1;
            }

        }

        this.array[this.tail] = value;

        this.tail += 1;

        this.texture_data.needsUpdate = true;

        


    }

    update(value, index)
    {

        if (index > this.capacity)
        {
            return;
        }

        if (this.structure_size == 1)
        {
            this.array[index*this.structure_size]  = value;
        }else {
            for (let i = 0; i < this.structure_size; i++)
            {
                this.array[index*this.structure_size + i] = value[i];
            }

        }


        this.texture_data.needsUpdate = true;
        
    }

    formatted_update(value, index, offset, length)
    {


        if (typeof index === 'string' || index instanceof String)
        {
            //console.log("is string");
            if (this.struct_index_map[index] == undefined )
            {
                //console.log("undefined");
                return;
            }
            index = this.struct_index_map[index];
        } 

        

        if ((index*this.structure_size) + offset + length > this.capacity)
        {
            return;
        }

        for (let i = 0; i < length; i++)
        {

            if ( i < value.length )
            {
                this.array[(index*this.structure_size) + offset + i] = value[i];
            }else {
                this.array[(index*this.structure_size) + offset + i] = 1.0;
            }


        }

        this.texture_data.needsUpdate = true;


    }

};