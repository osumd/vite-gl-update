
import TextureVector from './TextureVector';

import * as THREE from 'three';

export default class LightsTexture extends TextureVector{

    constructor ( )
    {


        super(20);
        // Create a texture vector

        
        // Position, color, ambient, diffuse, specular

    }

    add_light ( location = new THREE.Vector3(0,0,0), diffuse = new THREE.Vector3(1,1,1), ambient = new THREE.Vector3(0,0,0), specular = new THREE.Vector3(1,1,1), name = undefined )
    {

        //solution wastes stack space but maybe  optimizie out
        this.push ( location.x, name );
        this.push ( location.y, name  );
        this.push ( location.z, name  );
        this.push ( 1.0, name  );

        this.push ( diffuse.x, name  );
        this.push ( diffuse.y, name  );
        this.push ( diffuse.z, name  );
        this.push ( 1.0, name  );

        this.push ( ambient.x, name  );
        this.push ( ambient.y, name  );
        this.push ( ambient.z, name  );
        this.push ( 1.0, name  );

        this.push ( specular.x, name  );
        this.push ( specular.y, name  );
        this.push ( specular.z, name  );
        this.push ( 1.0, name  );

        // Store a vector here to determine the light type
        this.push ( 1, name  );
        this.push ( 0, name  );
        this.push ( 0, name  );
        this.push ( 1, name  );

    }

    add_sun_light ( location = new THREE.Vector3(0,0,0), diffuse = new THREE.Vector3(1,1,1), ambient = new THREE.Vector3(0,0,0), specular = new THREE.Vector3(1,1,1), name = undefined )
    {
        this.push ( location.x, name );
        this.push ( location.y ,name);
        this.push ( location.z ,name);
        this.push ( 1.0 ,name);

        this.push ( diffuse.x ,name);
        this.push ( diffuse.y ,name);
        this.push ( diffuse.z ,name);
        this.push ( 1.0 ,name);

        this.push ( ambient.x ,name);
        this.push ( ambient.y ,name);
        this.push ( ambient.z ,name);
        this.push ( 1.0 ,name);

        this.push ( specular.x ,name);
        this.push ( specular.y ,name);
        this.push ( specular.z ,name);
        this.push ( 1.0 ,name);

        // Store a vector here to determine the light type
        this.push ( 0 ,name);
        this.push ( 0 ,name);
        this.push ( 0 ,name);
        this.push ( 1 ,name);
    }

    struct_size ( )
    {

        return 20;

    }

    count( )
    {

        
        return this.structure_tail;
    }

    texture ( )
    {
        return this.texture_data;
    }

    dimension ( )
    {
        return this.texture_dimension;
    }

    update_position(position, index)
    {
        

        this.formatted_update(position, index, 0, 4);
    }

};



