export default class ElementMesh
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

    reset()
    {
        // Stores the indexes and two custom index pointers.
        this.vertices_index = 0;
        this.elements_index = 0;
        this.uvs_index = 0;
        this.normals_index = 0;

        // Stores the two custom index pointers
        this.index_slot1 = 0;
        this.index_slot2 = 0;
    }

}