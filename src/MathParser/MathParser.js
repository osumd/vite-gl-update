
// Import text from troika text.
import { Text } from "troika-three-text";


// Use standard troika text attributes
class MathParserNode
{
    constructor()
    {
        //Alignment options [Default]
        this.alignX = "left";
        this.alignY = "0"

        // Choose attributes availabe to troika text, need to add rotations for if the frustrum is rotated.
        this.color = [1,0,0];
        this.position = [0,0,0];
        this.quaternion = [0,0,0]; // For quaternion rotation to orient to the plane normal.

        this.size = 1.0;
        this.id = "";
        this.textContent = "";
        
        // Register length of the total letters [verify]
        // Register length of letter at the end.
        this.totalLength = 0;
        this.lastLetterLength = 0;

        // Operator assignment [verify]
        this.operator_name = "";
        this.operator_arguments = [];
        this.operator_arguments_length = [];
        this.empty = true;

        // Supports superscript and subscript behavior [verify]
        this.superscriptContent = "";
        this.subscriptContent = "";

        


    }

    // Copies color,size,id and space
    copy_attributes( other_node )
    {
        this.color = [...other_node.color];
        this.size = other_node.size;
        this.position = [...other_node.position];
        this.id = other_node.id;
    }
}

// Math decoder does not actually decode math as much as it renders text.
// Math decoder will run through parser and generate the text
// Uses troika text
class MathDecoder
{
    
    constructor(scene_context)
    {
        // Store scene context
        this.scene_context = scene_context;

        // Cursor which moves according to the next contexual placement of text objects. 
        // Not in accordance with any basis vectors, and works on 2x2 identity. [REFACTOR to account for real axes]
        this.baseline_cursor = [0,0];

        // Define unit vectors in coorespondence with the baseline cursor
        this.baseline_vectors = [
            [1,0,0],
            [0,1,0]
        ];

        this.orientation = [0,0,0,1]

        //Dedicated as a local translation unit,  [verify]
        this.current_base_position = [0,0,0];

        // Stores operator placement functions [verify]
        this.operator_map = {
            "frac" : this.render_frac.bind(this),
        };

        // Associate the ids with indexes into the reusable text, helpful for reference/altering specific portions of a parsed math system.
        // For local ids only.
        // [furthur verify needed.]
        this.id_map = {
            text_count: 0,
            frac_count: 0,
            equals_count: 0,

            // Section for tracking equations
            equation0 : {
                equals_flag: "lhs",
                lhs: {
                    text_count: 0,
                    frac_count: 0,
                    all_ids: []
                },
                rhs: {
                    text_count: 0,
                    frac_count: 0,
                    all_ids: []
                },
                all_ids: []

            },
            equation_tail: 0,
            all_ids: []
        };


        // Dimension map for the local math decodings
        this.dimension_map = {

            total_length: 0.0,
            total_height: 0.0,
        };

        // Id associated with current export token [ verify - look up.]
        this.current_group_id = "";

        // List of all text_ids associated with this current decoding cycle [ needed implementation.]
        this.ids_array = [];

        // Store information regarding the maximum font height for line skipping
        this.maximum_line_height = 0.0;
        this.minimum_line_height = 1.0;
        
        
    }

    // Function to reset the class details
    reset()
    {
        // Id associated with current export token
        this.current_group_id = "";

        // List of all text_ids associated with this current decoding cycle
        this.ids_array = [];

        // We need our baseline cursor
        this.baseline_cursor = [0,0];

        // Set by what the position of the current token is.
        this.current_base_position = [0,0,0];

        // 
        this.end_current_equation();
    }

    // Resets the id map
    reset_id_map ( )
    {
        this.id_map = {
            text_count: 0,
            frac_count: 0,
            equals_count: 0,

            // Section for tracking equations
            equation0 : {
                equals_flag: "lhs",
                lhs: {
                    text_count: 0,
                    frac_count: 0,
                    all_ids: []
                },
                rhs: {
                    text_count: 0,
                    frac_count: 0,
                    all_ids: []
                },
                all_ids: []

            },
            equation_tail: 0,

            all_ids: []
        };

    }

    // Add equation id's either text, frag operators etc.
    add_equation_text_id ( id )
    {
        

        // Support local inclusion.

        // Get the flag string from the id map for accessing.
        let flag_string = this.id_map[`equation${this.id_map.equation_tail}`].equals_flag;

        // Get the text count
        let text_count = this.id_map[`equation${this.id_map.equation_tail}`][flag_string].text_count;

        this.id_map[`equation${this.id_map.equation_tail}`][flag_string][ `text${text_count}`] = id;

        this.id_map[`equation${this.id_map.equation_tail}`][flag_string].text_count++;

        this.id_map[`equation${this.id_map.equation_tail}`][flag_string].all_ids.push ( id );
        this.id_map[`equation${this.id_map.equation_tail}`].all_ids.push ( id );


    }

    // Function which closes the current equation id and submits
    end_current_equation ( )
    {

        let current_equation = `equation${this.id_map.equation_tail}`;

        // If the current equation is empty then do nothing else, increment equation status

        if ( this.id_map[current_equation].lhs.all_ids.length != 0 && this.id_map[current_equation].rhs.all_ids.length == 0 )
        {
            this.id_map[current_equation] = {
                equals_flag: "lhs",
                lhs : { text_count: 0, frac_count: 0, all_ids: [] },
                rhs : { text_count: 0, frac_count: 0, all_ids: [] },
                all_ids: []
            };

        }else
        {
            // Other wise increment the equation tail and create a new equation.
            this.id_map.equation_tail += 1;

            let next_equation = `equation${this.id_map.equation_tail}`;


            this.id_map[next_equation] = {
                equals_flag: "lhs",
                lhs : { text_count: 0, frac_count: 0, all_ids: [] },
                rhs : { text_count: 0, frac_count: 0, all_ids: [] },
                all_ids: []
            };
        }


    }

    // Use subroutines for appending ids into the id table
    add_text_id(id)
    {

        //  Support local inclusion

        let text_count;
        if ( this.current_group_id != "" )
        {
            text_count = this.id_map[this.current_group_id].text_count;
             // Assign the text variation the text id
            this.id_map[this.current_group_id][`text${text_count}`] = id;
        }else
        {
            text_count = this.id_map.text_count;
            this.id_map[`text${text_count}`] = id;
        }

        
        this.add_equation_text_id ( id );
    }

    // Use to add equals ids
    add_equals_id ( id )
    {
        // Local
        let equals_count;
        if ( this.current_group_id != "" )
        {
            equals_count = this.id_map[this.current_group_id].equals_count;
             // Assign the text variation the text id
            this.id_map[this.current_group_id][`equals${equals_count}`] = id;
        }else
        {
            equals_count = this.id_map.equals_count;
            this.id_map[`equals${equals_count}`] = id;
        }

    }

    // Could refactor to just count the subscripts/supercripts to make it easier to find but could then not find the sub/super based on text alone. [ preffered ]
    add_superscript_id(id)
    {
        let text_count =this.id_map[this.current_group_id].text_count;
        this.id_map[this.current_group_id][`test${text_count}super`] = id;

    
    }

    add_subscript_id(id)
    {
    
        if ( this.current_group_id != "" )
        {
            let text_count = this.id_map[this.current_group_id].text_count;
            this.id_map[this.current_group_id][`test${text_count}sub`] = id;
        }else
        {

        }


       
    }

    add_global_id(id)
    {
        this.id_map.all_ids.push(id);
    }

    // Increment the text id after subscripts and superscripts
    increment_text_id()
    {
        if( this.current_group_id != "")
        {
            this.id_map[this.current_group_id].text_count++;
        }else{
            this.id_map.text_count++;
        }
    
    }

    // Increment equals id
    increment_equals_id ( )
    {
        if( this.current_group_id != "")
        {
            this.id_map[this.current_group_id].equals_count++;
        }else{
            this.id_map.equals_count++;
        }
    }

    // Use subroutines for appending ids for the frac operator
    add_frac_id(numerator, denominator)
    {
        
        if ( this.current_group_id != "")
        {
            // Given the id assign it to fracx
            // Get the current text_count
            let frac_count = this.id_map[this.current_group_id].frac_count;
            // Assign the text variation the text id
            this.id_map[this.current_group_id][`frac${frac_count}numerator`] = numerator;
            this.id_map[this.current_group_id][`frac${frac_count}denominator`] = denominator;
        }else
        {
            // Given the id assign it to fracx
            // Get the current text_count
            let frac_count = this.id_map.frac_count;
            // Assign the text variation the text id
            this.id_map[`frac${frac_count}numerator`] = numerator;
            this.id_map[`frac${frac_count}denominator`] = denominator;
        }
    }

    render_text(export_token)
    {
        
        // Generate base x and base y [ verify ]
        let base_x = this.baseline_cursor[0]*(this.baseline_vectors[0][0]) + this.baseline_cursor[1]*(this.baseline_vectors[1][0]) + this.current_base_position[0];
        let base_y = this.baseline_cursor[0]*(this.baseline_vectors[0][1]) + this.baseline_cursor[1]*(this.baseline_vectors[1][1]) + this.current_base_position[1];
        let base_z = this.baseline_cursor[0]*(this.baseline_vectors[0][2]) + this.baseline_cursor[1]*(this.baseline_vectors[1][2]) + this.current_base_position[2];


        // Dont add text id's if they are soley space.
        if ( export_token.textContent != " ")
        {

            // Id into the reusable text object, used to access again and dispose of.
            let text = this.scene_context.reusable_text.get_new_text_id();

            //console.log ( "Content, ID" ,export_token.textContent, text );

            

            // Hardcoded font with hardcoded sizes per font.
            this.scene_context.reusable_text.text_objects[text].fontSize = export_token.size;
            // Set text.
            this.scene_context.reusable_text.text_objects[text].text = export_token.textContent;
            // Set position.
            this.scene_context.reusable_text.text_objects[text].position.set(base_x, base_y, base_z);
            // Set the orientation
            this.scene_context.reusable_text.text_objects[text].quaternion.set(this.orientation[0], this.orientation[1], this.orientation[2], this.orientation[3]);
            this.scene_context.reusable_text.text_objects[text].font = "../../public/fonts/latinmodern-math.otf";
            this.scene_context.reusable_text.text_objects[text].sync();

            // Add the newly created text id to the id_map
            this.add_text_id(text);

            // Adds id to the total id_list
            this.add_global_id(text);

            this.scene_context.scene.add(this.scene_context.reusable_text.text_objects[text]);

            // Increment the text id
            this.increment_text_id();
        }
        

        // Use the calculated normalized sum of the total length and multiply by export token size.
        let baselineSkip = (export_token.totalLength)*export_token.size;

        if ( export_token.size > 1.0 )
        {
            baselineSkip = ( export_token.totalLength)*export_token.size*1.6;
        }

        // Use the baseline skip to generate three skip floats
        let skipx = baselineSkip*this.baseline_vectors[0][0];
        let skipy = baselineSkip*this.baseline_vectors[0][1];
        let skipz = baselineSkip*this.baseline_vectors[0][2];


        // Use the last letter length to generate the the two vectors on the two unit axes.
        let lastx0 = export_token.lastLetterLength*this.baseline_vectors[0][0];
        let lastx1 = export_token.lastLetterLength*this.baseline_vectors[0][1];
        let lastx2 = export_token.lastLetterLength*this.baseline_vectors[0][1];

        let lasty0 = export_token.lastLetterLength*this.baseline_vectors[1][0];
        let lasty1 = export_token.lastLetterLength*this.baseline_vectors[1][1];
        let lasty2 = export_token.lastLetterLength*this.baseline_vectors[1][2];

        //console.log(skipx,        skipy,        skipz,        lastx0,        lastx1,        lastx2,        lasty0,        lasty1,        lasty2)

        if ( export_token.superscriptContent != "" )
        {
            // Then apply a new superscript text
            let superscript_text = this.scene_context.reusable_text.get_new_text_id();
            this.scene_context.reusable_text.text_objects[superscript_text].fontSize = export_token.size*0.4
            this.scene_context.reusable_text.text_objects[superscript_text].text = export_token.superscriptContent;

            this.scene_context.reusable_text.text_objects[superscript_text].position.set(base_x+skipx*1.2 - lastx0*0.2 - lasty0*0.1, base_y+skipy -lasty1*0.1- lastx1*0.2, base_z+skipz-lastx2*0.2- lasty2*0.1);

            this.scene_context.reusable_text.text_objects[superscript_text].font = "../../public/fonts/latinmodern-math.otf";

            this.scene_context.reusable_text.text_objects[superscript_text].sync();
        
            this.scene_context.scene.add(this.scene_context.reusable_text.text_objects[superscript_text]);

            // Add the super script to the id map
            //this.add_superscript_id(superscript_text);
            //this.add_global_id(superscript_text);
        }

        if ( export_token.subscriptContent != "" )
        {

            //console.log ( export_token.lastLetterLength, baselineSkip, export_token.totalLength  );

            // Then apply a new superscript text
            let subscript_text = this.scene_context.reusable_text.get_new_text_id();

            this.scene_context.reusable_text.text_objects[subscript_text].fontSize = export_token.size*0.4
            this.scene_context.reusable_text.text_objects[subscript_text].text = export_token.subscriptContent;
            this.scene_context.reusable_text.text_objects[subscript_text].position.set(base_x + skipx*1.2 - lastx0*0.2 - lasty0*1.2, base_y + skipy - lastx1*0.2 - lasty1*1.2, base_z + skipz - lastx2*0.2 - lasty2*1.2);
            this.scene_context.reusable_text.text_objects[subscript_text].font = "../../public/fonts/latinmodern-math.otf";

            this.scene_context.reusable_text.text_objects[subscript_text].sync();
            
            this.scene_context.scene.add(this.scene_context.reusable_text.text_objects[subscript_text]);

            // Addd the sub script to the id map.
            this.add_subscript_id(subscript_text);
            this.add_global_id(subscript_text);

        }

        // Get the max length between the superscript and subscript content.
        let max_script_length = Math.max ( export_token.superscriptContent.length , export_token.subscriptContent.length );

        baselineSkip  += export_token.lastLetterLength*0.4 * max_script_length;
        

        this.baseline_cursor[0] += baselineSkip;
        
        

        
    }

    render_frac(export_token)
    {

        // Generate base x and base y [ verify ]
        let base_x = this.baseline_cursor[0]*(this.baseline_vectors[0][0]) + this.baseline_cursor[1]*(this.baseline_vectors[1][0]) + this.current_base_position[0];
        let base_y = this.baseline_cursor[0]*(this.baseline_vectors[0][1]) + this.baseline_cursor[1]*(this.baseline_vectors[1][1]) + this.current_base_position[1];
        let base_z = this.baseline_cursor[0]*(this.baseline_vectors[0][2]) + this.baseline_cursor[1]*(this.baseline_vectors[1][2]) + this.current_base_position[2];

        let m = this.scene_context.reusable_text.get_new_text_id();
        let n = this.scene_context.reusable_text.get_new_text_id();
        let k = this.scene_context.reusable_text.get_new_text_id();

        // Adding text ids.
        this.add_global_id(m);
        this.add_global_id(n);
        this.add_global_id(k);

        // Find the max size between the arguments
        let max_size = ( export_token.operator_arguments_length[0] > export_token.operator_arguments_length[1] ) ? export_token.operator_arguments_length[0] : export_token.operator_arguments_length[1];

        let fraction_text = "";
        let space_covered = 0;
        while ( space_covered < max_size*export_token.size )
        {
            space_covered += 1;
            fraction_text  += "—";
        }
        
        // Define spaces for the first operand
    
        this.scene_context.reusable_text.text_objects[m].text = fraction_text ;
        // this.scene_context.reusable_text.text_objects[m].anchorX = export_token.alignX;
        // this.scene_context.reusable_text.text_objects[m].anchorY = export_token.alignY;
        this.scene_context.reusable_text.text_objects[m].position.set(base_x, base_y, base_z);
        this.scene_context.reusable_text.text_objects[m].quaternion.set(this.orientation[0], this.orientation[1], this.orientation[2], this.orientation[3]);
        this.scene_context.reusable_text.text_objects[m].fontSize = 0.7*export_token.size;
        this.scene_context.reusable_text.text_objects[m].letterSpacing = 0;
        this.scene_context.reusable_text.text_objects[m].font = "../../public/fonts/latinmodern-math.otf";
        this.scene_context.reusable_text.text_objects[m].sync();
        
        let size0 = (export_token.operator_arguments_length[0] == max_size ) ? ( max_size - export_token.operator_arguments_length[0] ) : ( max_size - export_token.operator_arguments_length[0] )*0.4;
        let size1 = (export_token.operator_arguments_length[1] == max_size ) ? ( max_size - export_token.operator_arguments_length[1] ) : ( max_size - export_token.operator_arguments_length[1] )*0.4;

        if ( size0 < 0.1  && size1 < 0.1)
        {
            size0 = max_size*0.2;
            size1 = max_size*0.2;
        }
        
        // Create two size based vectors on the unit vectos
        let size0x = size0 * this.baseline_vectors[0][0];
        let size0y = size0 * this.baseline_vectors[0][1];
        let size0z = size0 * this.baseline_vectors[0][2];

        let size1x = size0 * this.baseline_vectors[0][0];
        let size1y = size0 * this.baseline_vectors[0][1];
        let size1z = size0 * this.baseline_vectors[0][2];

        // Create export sized vectors
        let tokenx =  export_token.size * this.baseline_vectors[1][0];
        let tokeny =  export_token.size * this.baseline_vectors[1][1];
        let tokenz =  export_token.size * this.baseline_vectors[1][2];


        this.scene_context.reusable_text.text_objects[n].text = export_token.operator_arguments[0];
        this.scene_context.reusable_text.text_objects[n].anchorX = export_token.alignX;
        this.scene_context.reusable_text.text_objects[n].anchorY = export_token.alignY;
        this.scene_context.reusable_text.text_objects[n].position.set(base_x + size0x + tokenx*0.3, base_y + tokeny*0.3 + size0y, base_z + size0z + tokenz*0.3);
        this.scene_context.reusable_text.text_objects[n].quaternion.set(this.orientation[0], this.orientation[1], this.orientation[2], this.orientation[3]);
        this.scene_context.reusable_text.text_objects[n].fontSize = 0.7*export_token.size;
        this.scene_context.reusable_text.text_objects[n].font = "../../public/fonts/latinmodern-math.otf";
        this.scene_context.reusable_text.text_objects[n].sync();

        this.scene_context.reusable_text.text_objects[k].text = export_token.operator_arguments[1];
        this.scene_context.reusable_text.text_objects[k].anchorX = export_token.alignX;
        this.scene_context.reusable_text.text_objects[k].anchorY = export_token.alignY;
        this.scene_context.reusable_text.text_objects[k].position.set(base_x + size1x - tokenx*0.3, base_y + size1y - tokeny*0.3, base_z + size1z - tokenz*0.3)*export_token.size;
        this.scene_context.reusable_text.text_objects[k].quaternion.set(this.orientation[0], this.orientation[1], this.orientation[2], this.orientation[3]);
        this.scene_context.reusable_text.text_objects[k].fontSize = 0.7*export_token.size;
        this.scene_context.reusable_text.text_objects[k].font = "../../public/fonts/latinmodern-math.otf";
        this.scene_context.reusable_text.text_objects[k].sync();

        this.baseline_cursor[0] += max_size*export_token.size;

        this.scene_context.scene.add(this.scene_context.reusable_text.text_objects[m]);
        this.scene_context.scene.add(this.scene_context.reusable_text.text_objects[n]);
        this.scene_context.scene.add(this.scene_context.reusable_text.text_objects[k]);

        this.add_frac_id(n,k);
    }

    handle_equals ( export_token )
    {

    
        // Id into the reusable text object, used to access again and dispose of.
        let text = this.scene_context.reusable_text.get_new_text_id();

        this.add_equals_id( text );
        this.increment_equals_id ( );
        this.add_global_id ( text );
        
        // Generate base x and base y [ verify ]
        let base_x = this.baseline_cursor[0]*(this.baseline_vectors[0][0]) + this.baseline_cursor[1]*(this.baseline_vectors[1][0]) + this.current_base_position[0];
        let base_y = this.baseline_cursor[0]*(this.baseline_vectors[0][1]) + this.baseline_cursor[1]*(this.baseline_vectors[1][1]) + this.current_base_position[1];
        let base_z = this.baseline_cursor[0]*(this.baseline_vectors[0][2]) + this.baseline_cursor[1]*(this.baseline_vectors[1][2]) + this.current_base_position[2];

        // Hardcoded font with hardcoded sizes per font.
        this.scene_context.reusable_text.text_objects[text].fontSize = export_token.size;
        // Set text.
        this.scene_context.reusable_text.text_objects[text].text = export_token.textContent;
        // Set position.
        this.scene_context.reusable_text.text_objects[text].position.set(base_x, base_y, base_z);
        // Set the orientation
        this.scene_context.reusable_text.text_objects[text].quaternion.set(this.orientation[0], this.orientation[1], this.orientation[2], this.orientation[3]);
        this.scene_context.reusable_text.text_objects[text].font = "../../public/fonts/latinmodern-math.otf";
        this.scene_context.reusable_text.text_objects[text].sync();

        // Use the calculated normalized sum of the total length and multiply by export token size.
        let baselineSkip = (export_token.totalLength)*export_token.size;

        this.baseline_cursor[0] += baselineSkip;
        
        this.scene_context.scene.add(this.scene_context.reusable_text.text_objects[text]);

        this.id_map[ `equation${this.id_map.equation_tail}`].equals_flag = "rhs";
    }


    // While decoding a compartment of export tokens should be being compiled, then when an equation is ended, these export tokens
    // should be converted to the desired ast_tree

    decode(export_tokens, id_map_reference)
    {

        this.id_map = id_map_reference;

        // Reset the id array, helpful for disposing of text ids in bulk in an animation group
        this.ids_array = [];

        for(let i = 0 ; i < export_tokens.length; i++)
        {
            // Let the export token exists
            let export_token = export_tokens[i];

            // increase the maximum line height
            this.maximum_line_height = Math.max ( this.maximum_line_height, export_token.size );
            this.minimum_line_height = Math.min ( this.minimum_line_height, export_token.size );


            // Align the text to a baseline in a particular way.
            if ( export_token.size > 1.0 )
            {
                // If the last token had a larger size, then attempt to align to baseline.
                export_token.position[1] += ( export_token.size - 1.0 );

            }else if ( export_token.size < 1.0 )
            {
                // If the last token had a larger size, then attempt to align to baseline.
                export_token.position[1] += ( export_token.size - 1.0 )*0.8;
            }
            
            // Set the base position.
            this.current_base_position[0] = export_token.position[0];
            this.current_base_position[1] = export_token.position[1];
            this.current_base_position[2] = export_token.position[2];

            // If the export token has an id then initalize its inner contents
            if ( export_token.id != "" && this.id_map[export_token.id] == undefined )
            {
                this.id_map[export_token.id] = {}
                this.id_map[export_token.id].text_count = 0;
                this.id_map[export_token.id].frac_count = 0;
            }

            //Select the current group id as this token as its being parsed.
            this.current_group_id = export_token.id;


            if ( export_token.textContent == "=" )
            {
                this.handle_equals ( export_token );
            }
            else if ( export_token.textContent == '\n' )
            {

                // Then simply increase the baseline cursor
                this.baseline_cursor[0] = 0;
                this.baseline_cursor[1] -= this.maximum_line_height*0.8;
                this.maximum_line_height = 0;

                // And end the current equation
                //this.end_current_equation ( );
                console.log("new equation?");
            }
            else if ( export_token.textContent != "" )
            {
                this.render_text(export_token);

            }else if ( this.operator_map[export_token.operator_name] != undefined )
            {
                this.operator_map[export_token.operator_name](export_token);
            }
            
            //console.log ( Math.max ( this.id_map.total_height, this.baseline_cursor[1] ) );

            // After rendering the text, then check
            // Increment the total length for general placement within the math decoder, and height of course.
            this.dimension_map.total_length = Math.max ( this.dimension_map.total_length, this.baseline_cursor[0] );
            this.dimension_map.total_height = Math.max ( this.dimension_map.total_height, (-this.baseline_cursor[1]) + this.maximum_line_height*0.8 );

        }

        this.reset();

        return this.dimension_map;

    }



}

// A Math Expression generator from export tokens.
// Exports
// For each export token
// If export token is an operator make the node with the arguments of the operator
// Attach it as the next inline child of the previous node on the stack.
class MathExpressionNode 
{

    constructor ( )
    {

        // A difference in numeric value, and symbolic value
        this.symbolic_value = "";
        this.function_name = "";
        this.numeric_value = 0.0;

        // An indicator to type of node symbolic, numeric etc.
        this.node_value_type = ""

        this.operator = "";
        this.children = [];

    }

    set_symbolic_value_node ( value )
    {

        this.symbolic_value = value;
        this.node_value_type = "alphabetic";

    }

    set_numeric_value_node ( value )
    {

        this.numeric_value = value;
        this.node_value_type = "numeric";
    }

    set_operator_node ( operator )
    {
        this.operator = operator;
    }

    set_function_node ( function_name, input_node )
    {
        this.function_name = function_name;
        this.input_node = input_node;
        this.node_value_type = "function";
    }

    // Copy all attributes except children
    copy_except_children ( node )
    {
        // A difference in numeric value, and symbolic value
        this.symbolic_value = node.symbolic_value;
        this.numeric_value = node.numeric_value;

        // An indicator to type of node symbolic, numeric etc.
        this.node_value_type = node.node_value_type;

        this.operator = node.operator;

    }

};

class MathExpressionConverter
{

    constructor ( )
    {

        this.operator_token_handlers = {
            "frac" : this.handle_frac_token.bind(this),
        };


        this.operator_text_handlers = {
            '*': this.handle_multiply_text.bind(this),
            '+': this.handle_addition_text.bind(this),
            '=' : this.handle_equals_text.bind(this),
        };

        // Set up some input handlers 
        this.input_handlers = {
            "subscript_input" : this.handle_subscript_input.bind(this),
        };

    }

    // Fulfills an unfulfilled previous operator node
    fulfill_operator_node ( operand_stack, unfulfilled_operator_node )
    {
        // If the last operator node is unfulfilled 
        if ( unfulfilled_operator_node[0] != undefined && operand_stack[0].length > 0)
        {
            // Pop the last operand of the operand stack
            let final_operand = operand_stack[0].pop();

            // Push the final operand as a child of the unfulfilled operator node
            unfulfilled_operator_node[0].children.push( final_operand );

            unfulfilled_operator_node[0] = undefined;

        }

    }

    // Part of the branch of operator handlers.
    handle_frac_token ( token, operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node )
    {

        // Since the arguments come with it, these will need to be converted into miniature syntax trees them selves with a secondary math parser, and expression converter.

        // Since the operator names are unconvential, they should have conversions to standard operators
        

        // Create an operator node
        let operator_node = new MathExpressionNode( );
        operator_node.set_operator_node ( "/" );

        // Iterate through the arguments
        for ( let c = 0 ; c < token.operator_arguments.length; c++ )
        {

            // Assuming they are all alpha numeric values, just create nodes
            let operand_node = new MathExpressionNode( );

            // Need to ignore spaces when dealing with adding the symbolic value.
            operand_node.set_symbolic_value_node ( token.operator_arguments[c] );

            // Push the operand node as a child of the operator node
            operator_node.children.push ( operand_node );


        }

        // Push the operator_node to the operand stack
        operand_stack[0].push ( operator_node );


    }

    // Then handle the operator token.
    handle_operator_token ( token, operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node )
    {
        // If the operator has a handler.
        if ( this.operator_token_handlers[ token.operator_name] != undefined )
        {
            // Then call the handler to deal with the operator.
            this.operator_token_handlers[ token.operator_name ] ( token, operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node );

        }else
        {

            // Withought the token handler do nothing to the tree.

        }

    }

    // Branch for text based operators/operands!

    // boolean to check if the char is a alphabetic character
    is_alphabetic ( sample_char )
    {

        let char_code = sample_char.charCodeAt(0);
        if  ( char_code >= 65 && char_code <= 89  || char_code >= 97 && char_code <= 122 )
        {

            return true;

        }

        return false;
    }

    // boolean value to check if a char is a numeric character
    is_numeric ( sample_char )
    {

        let char_code = sample_char.charCodeAt(0);
        if  ( char_code >= 48 && char_code <= 57  || char_code == 46 )
        {

            return true;

        }

        return false;

    }
    
    // handle alphanumeric single char operands
    handle_alpha_operand ( text_expression, text_expression_index, text_expression_length, operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node )
    {
        
        // While the token at the expression index is not an operator, a space, or a numerical value.
        // Get the current token from the text expression
        var current_token = text_expression[ text_expression_index ];

        // Create a new operand node representing the current symbolic operand.
        let operand_node = new MathExpressionNode ( );
        // Set an empty string as the symbolic value.
        operand_node.set_symbolic_value_node ("");


        // Since we already know the first token is alphabetic we simply do while
        // Add the current token to the symbolic value
        operand_node.symbolic_value += current_token;

        // Increment the text expression index.
        text_expression_index += 1;

        if ( text_expression_index < text_expression_length )
        {
            
            // Set the current token to the next incremented value
            current_token = text_expression[ text_expression_index ];
        }
        

        while ( this.is_alphabetic ( current_token ) && text_expression_index < text_expression_length )
        {
            
            // Add the current token to the symbolic value
            operand_node.symbolic_value += current_token;

            // Increment the text expression index.
            text_expression_index += 1;

            // Set the current token to the next incremented value
            current_token = text_expression[ text_expression_index ];

        }

        // I must of designed this incorrectly because this is not good, but it must be done.
        text_expression_index -= 1;

        // Push the operand node onto the operand stack.
        operand_stack[0].push ( operand_node ); 

    }

     // handle numeric operands 
    handle_numeric_operand ( text_expression, text_expression_index, text_expression_length, operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node )
    {
        
        // While the token at the expression index is not an operator, a space, or a numerical value.
        // Get the current token from the text expression
        var current_token = text_expression[ text_expression_index ];

        // Create a new operand node representing the current symbolic operand.
        let operand_node = new MathExpressionNode ( );

        // temporary value 
        let temporary_value = "";

        // Add the current token to the symbolic value
        temporary_value += current_token;

        // Increment the text expression index.
        text_expression_index += 1;

        if ( text_expression_index < text_expression_length-1 )
        {

            // Set the current token to the next incremented value
            current_token = text_expression[ text_expression_index ];
        }


        while ( this.is_numeric ( current_token ) && text_expression_index < text_expression_length )
        {
            


            // Add the current token to the symbolic value
            temporary_value += current_token;

            // Increment the text expression index.
            text_expression_index += 1;

            // Set the current token to the next incremented value
            current_token = text_expression[ text_expression_index ];
        }

        // I must of designed this incorrectly because this is not good, but it must be done.
        text_expression_index -= 1;

        // After that parseFloat from string.
        operand_node.set_numeric_value_node( parseFloat ( temporary_value ) );

        // Push the operand node onto the operand stack.
        operand_stack[0].push ( operand_node ); 

    }

    // Multiply token handling.
    handle_multiply_text( operator_char, operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node )
    {
        // Fulfill the unfulfilled previous operator node if there is one.
        this.fulfill_operator_node( operand_stack, unfulfilled_operator_node );

        // Base case
        //create new token node
        let operator_node = new MathExpressionNode ( );
        operator_node.set_operator_node ( operator_char );


        // If the operand stack is not empty
        if ( operand_stack[0].length > 0 )
        {
            // Get the operand
            let initial_operand = operand_stack[0].pop();

            // Push as operand of the new operator node.
            operator_node.children.push ( initial_operand );


        }


        // Push to the stack.
        operand_stack[0].push ( operator_node );

        /// Set as the unfulffiled node
        unfulfilled_operator_node[0] = operator_node;
    }

    // Addition operator.
    handle_addition_text ( operator_char, operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node )
    {
        // Fulfill the unfulfilled previous operator node if there is one.
        this.fulfill_operator_node( operand_stack, unfulfilled_operator_node );

        // Base case
        //create new token node
        let operator_node = new MathExpressionNode ( );
        operator_node.set_operator_node ( operator_char );

        // If the operand stack is not empty
        if ( operand_stack[0].length > 0 )
        {
            // Get the operand
            let initial_operand = operand_stack[0].pop();

            // Push as operand of the new operator node.
            operator_node.children.push ( initial_operand );


        }

        // Push to the stack.
        operand_stack[0].push ( operator_node );

        /// Set as the unfulffiled node
        unfulfilled_operator_node[0] = operator_node;
    }

    // Handle equals text
    handle_equals_text ( operator_char, operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node )
    {
       

        // Base case
        //create new token node
        let operator_node = new MathExpressionNode ( );
        operator_node.set_operator_node ( operator_char );
        
        // Before switching complete the lhs by fulfiling the unfilfilled lhs
        this.fulfill_operator_node (  operand_stack, unfulfilled_operator_node );

        // In this case whether or not an spatial operator was found is important to determine if the left hand side is a function or an equation.


        // Switch the operand stack the right hand side.
        operand_stack[0] = rhs_operand_stack;

        equals_node[0] = operator_node;
    }


    // This function should determine if the string is an expression, alphabetic or numeric and return the isolated content.
    is_expression ( string )
    {

        // Set a status as to whether the string is an expression.
        let expression_status = false;
        
        // Checks if the string type is alphabetic or numeric.
        let string_type = "";

        // The filtered value in essence from the string.
        let value = "";

        if ( this.is_alphabetic ( string ) )
        {
            string_type = "symbolic";

            // Iterate through the string, if it contains operators then return true;
            for ( let c = 0 ; c < string.length; c ++ )
            {

                if ( this.operator_text_handlers[string[c]] != undefined )
                {
                    expression_status = true;
                } 

                // If the character is alphabetic then add it to the value.
                if ( this.is_alphabetic ( string[c] ) == true )
                {
                    value += string[c];
                }

            }

        } else if ( this.is_numeric ( string ) )
        {
            string_type = "numeric";

            // Iterate through the string, if it contains operators then return true;
            for ( let c = 0 ; c < string.length; c ++ )
            {

                if ( this.operator_text_handlers[string[c]] != undefined )
                {
                    expression_status = true;
                } 

                // If the character is numeric then add it to the value.
                if ( this.is_numeric ( string[c] ) == true )
                {
                    value += string[c];
                }

            }
        }

        return {status: expression_status, type: string_type, value: value };

    }


    //  All input handlers will be here.
    // A helper function to detect if the token has an input as a text expression
    has_input ( token )
    {

        if ( token.subscriptContent != "" && token.superscriptContent == "" )
        {
            return "subscript_input";
        }

        return "none";

    }

    handle_subscript_input ( token, operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node )
    {

        // If the subscript value is an expression eg has operators in it.
        // In order to do this we must generate the export tokens using the MathParser utility.
        let expression_status = this.is_expression ( token.subscriptContent );

        // Setup a node to represent the input node
        let input_node = undefined;

        if (  expression_status.status == true )
        {

        }else
        {

            if ( expression_status.type == "symbolic" )
            {
                
                // Create a symbolic node
                input_node = new MathExpressionNode( );
                input_node.set_symbolic_value_node ( expression_status.value );

            } else if ( expression_status.type == "numeric" )
            {
                // Create a symbolic node
                input_node = new MathExpressionNode( );

                input_node.set_numeric_value_node ( parseFloat ( expression_status.value ) );
            }

        }

        if ( input_node != undefined )
        {

            //Create the symbolic node representing the text content of the function
            let function_node = new MathExpressionNode ( );
            function_node.set_function_node ( token.textContent, input_node );

            operand_stack[0].push ( function_node );

        }

    }

    // Part of handling a normal text expression
    handle_text_expression ( token, operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node )
    {

        // Get the text context.

        // Set a cursor value representing the current text expression index
        let text_expression_index = 0;
        let text_expression_length = token.textContent.length;

        // iterate through the text content.
        while ( text_expression_index < token.textContent.length )
        {

            // If the token is a known operator
            if ( this.operator_text_handlers[ token.textContent[text_expression_index] ] != undefined )
            {   
                
                // Then handle the token as seen fit.
                this.operator_text_handlers[ token.textContent[text_expression_index] ] (  token.textContent[text_expression_index], operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node );

            }else if ( this.is_alphabetic ( token.textContent[text_expression_index] ) )
            {
                this.handle_alpha_operand ( token.textContent, text_expression_index, text_expression_length, operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node );

            } else if ( this.is_numeric ( token.textContent[text_expression_index] ) )
            {
                this.handle_numeric_operand ( token.textContent, text_expression_index, text_expression_length, operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node );
            }

            text_expression_index += 1;

        }


    }

    

    // Return a root based on the current operator stack arrays
    make_root ( operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node  )
    {
        
        // If this expression has a left hand side/right hand side system. 
        if ( equals_node[0] != undefined )
        {
            // Add the left hand side and the right hand side.
            equals_node[0].children.push ( lhs_operand_stack[0] );
            equals_node[0].children.push ( rhs_operand_stack[0] );

            return equals_node[0];

        }
    }



    // Convert accepts the export tokens side effect free and returns the node root. 
    convert ( export_tokens )
    {

        // Generate all of the neccecary this information
        
        let unfulfilled_operator_node = [ undefined ];
        let equals_node = [ undefined ];
        let lhs_operand_stack = [];
        let rhs_operand_stack = [];

        let operand_stack = [ lhs_operand_stack ];

        // Loop through the tokens.
        for ( let e = 0; e < export_tokens.length; e ++ )
        {
            
            // Check if the text content has an input type and if so handle that.
            let input_type = this.has_input ( export_tokens[e] );

            if ( input_type != "none" )
            {
                this.input_handlers [ input_type ] ( export_tokens[e], operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node );
            }
            else if ( export_tokens[e].operator_name != "" )
            {
                // If the export token is an operator then handle the operator.
                this.handle_operator_token ( export_tokens[e], operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node );

            }else if ( export_tokens[e].textContext != "" )
            {
                this.handle_text_expression ( export_tokens[e], operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node );
            }
            

        }

        // Fulfill any unsatisfied nodes.
        this.fulfill_operator_node (operand_stack, unfulfilled_operator_node  );

        let root = this.make_root (  operand_stack, unfulfilled_operator_node, lhs_operand_stack, rhs_operand_stack, equals_node );

        return root;

    }

};

class MathExpresssionSolver 
{

    constructor ( )
    {

        // Operand stack
        this.operand_stack = [];

        // Operator handlers
        this.operator_handlers = { 

            '*' : this.handle_multiply.bind(this),
            '+' : this.handle_add.bind(this),
        };

        // Symbol map for symbolic replacements
        this.symbol_map = {

        };

    }

    //  Return an indicator to whether the node is numeric and its numeric value
    numerical_value_info ( node )
    {

        if ( node.node_value_type == "numeric" )
        {

            return { status: true, value: node.numeric_value };

        }else if ( this.symbol_map [ node.symbolic_value ] != undefined  )
        {

            return { status: true, value : this.symbol_map [node.symbolic_value ] };

        }else 
        {
            return { status: false, value: "" };
        }



    }

    handle_multiply ( node )
    {
        // Create two operand node values
        let operand_node1 = this.operand_stack.pop();
        let operand_node0 = this.operand_stack.pop();

        // Get info about numericalness and its value
        let numerical_info0 = this.numerical_value_info ( operand_node0 );
        let numerical_info1 = this.numerical_value_info ( operand_node1 );

        // If the operand is numeric then the status is true, else if there is a symbolic conversion then it is true.
    
        // If both types are numeric
        if ( numerical_info0.status == true && numerical_info1.status == true )
        {
            // Create a new numeric node 
            let numeric_result = new MathExpressionNode ( );
            numeric_result.set_numeric_value_node ( numerical_info0.value * numerical_info1.value );
            this.operand_stack.push ( numeric_result );


        }else
        {
            // Create a new operator node
            let operator_node = new MathExpressionNode ( );
            operator_node.set_operator_node( '*' );

            // Push the two operand nodes as children of the this new operator node.
            operator_node.children.push ( operand_node0 );
            operator_node.children.push ( operand_node1 );
        }

        

        

    }

    handle_add ( node )
    {
        // Create two operand node values
        let operand_node1 = this.operand_stack.pop();
        let operand_node0 = this.operand_stack.pop();

        // Get info about numericalness and its value
        let numerical_info0 = this.numerical_value_info ( operand_node0 );
        let numerical_info1 = this.numerical_value_info ( operand_node1 );
        // If the operand is numeric then the status is true, else if there is a symbolic conversion then it is true.

        if ( numerical_info0.value === 0 && numerical_info1.value !== 0 )
        {

            this.operand_stack.push ( operand_node1 );

        }else if ( numerical_info0.value !== 0 && numerical_info1.value === 0 )

        {
            this.operand_stack.push ( operand_node0 );

        }


        // If both types are numeric
        else if ( numerical_info0.status == true && numerical_info1.status == true )
        {
            // Create a new numeric node 
            let numeric_result = new MathExpressionNode ( );
            numeric_result.set_numeric_value_node ( numerical_info0.value + numerical_info1.value );
            this.operand_stack.push ( numeric_result );


        }
        else
        {
            // Create a new operator node
            let operator_node = new MathExpressionNode ( );
            operator_node.set_operator_node( '+' );

            // Push the two operand nodes as children of the this new operator node.
            operator_node.children.push ( operand_node0 );
            operator_node.children.push ( operand_node1 );

            this.operand_stack.push ( operator_node );
        }

    }

    handle_operand ( node )
    {

        // Create an operand node
        let operand_node = new MathExpressionNode ( );
        
        // Copy the node over to the new operand
        operand_node.copy_except_children ( node );

        if ( this.symbol_map[ node.symbolic_value ] != undefined )
        {
            operand_node.set_numeric_value_node ( this.symbol_map[node.symbolic_value ] );
        }

        // then push  the operand onto the stack
        this.operand_stack.push ( operand_node );

    }

    solve_ast_dfs ( node )
    {

        // Iterate through the nodes children and then commit dfs upon them.
        for ( let c = 0 ; c < node.children.length; c++ )
        {
            
            // Go down the tree in order to retrieve the operands.
            this.solve_ast_dfs ( node.children[c] );

        }

        // If the node is an operator
        if ( this.operator_handlers[ node.operator ] != undefined )
        {

            this.operator_handlers[ node.operator ] ( node );

        }else 
        {

            // If the node is an operand, then copy the node  over to the operand stack withought the contextual children.
            this.handle_operand ( node );

        }

        
        

    }

    // Prints out the solved expression based on the AST
    solve ( ast )
    {

        // Assuming the ast is the root.
        this.solve_ast_dfs ( ast );

        return this.operand_stack[0];

    }

    

    // Print the traversal of an ast
    print( node )
    {

        


        if ( node.children.length > 0 )
        {


            this.print ( node.children[0] );

            if ( node.operator != "" )
            {
                console.log(node.operator);
            }
            else if ( node.node_value_type == "numeric" )
            {

                console.log(node.numeric_value);
            }else
            {
                console.log(node.symbolic_value);
            }

            this.print ( node.children[1] );

        }else
        {
            if ( node.operator != "" )
            {
                console.log(node.operator);
            }
            else if ( node.node_value_type == "numeric" )
            {

                console.log(node.numeric_value);
            }else
            {
                console.log(node.symbolic_value);
            }
        }

        
    }


};


// Inline structure
export default class MathParser
{

    // Takes strings with math tokens in the
    constructor(scene_context)
    {
        // Store the scene context
        this.scene_context = scene_context;
        // the reusable text or its own reusable text object

        // A token index globally to help tokensize the current parse string.
        this.token_index = 0;

        // Store the length buffer of the math string
        this.math_string_length = 0;

        // Store the current export token
        this.current_export_token = undefined;

        // Check the token map
        this.token_map = {
            "<": this.expand_attribute_tag.bind(this),
            "|": this.expand_operator.bind(this),
            "^": this.expand_superscript.bind(this),
            "_": this.expand_subscript.bind(this),
            '\n': this.expand_newline.bind(this),
            "=" : this.expand_equals.bind(this)

        };

        // Extinguish token logic
        this.token_extinguishers = {
            "<": this.extinguish_attribute_tag.bind(this),
            "|": this.extinguish_operator.bind(this),
            "^": this.extinguish_superscript.bind(this),
            "_": this.extinguish_subscript.bind(this),
        };

        // Check the attribute map
        this.attribute_map = {
            "color": this.parse_color_tag.bind(this),
            "position" : this.parse_position_tag.bind(this),
            "size" : this.parse_size.bind(this),
            "id" : this.parse_id.bind(this)
        };

        // Check the operator map
        this.operator_map  = {
            "frac": "0"
        };

        // Store a length map to tally length and store last length.
        // Create a map
        this.length_map = {
            "a" : 0.5,
            "b" : 0.5,
            "c" : 0.5,
            "d" : 0.55,
            "e" : 0.5,
            "f" : 0.5,
            "g" : 0.5,
            "h" : 0.5,
            "i" : 0.5,
            "j" : 0.5,
            "k" : 0.5,
            "l" : 0.3,
            "m" : 0.6,
            "n" : 0.5,
            "o" : 0.5,
            "p" : 0.5,
            "q" : 0.5,
            "r" : 0.5,
            "s" : 0.5,
            "t" : 0.5,
            "u" : 0.5,
            "v" : 0.5,
            "w" : 0.5, 
            "x" : 0.5,
            "y" : 0.5,
            "z" : 0.5,
            " " : 0.1,
            "=" :0.7,
            "+" : 0.8,
            "/" : 0.6
        };

        // Create the math decoder
        this.math_decoder = new MathDecoder(scene_context);

    }


    // Reset the global
    reset_id_map ( ) 
    {

        this.math_decoder.reset_id_map ( );

    }

    // Token extinguishers
    extinguish_attribute_tag(math_string, psuedo_index)
    {
        // Skips the tag opener its self.
        psuedo_index++;
        
        while ( math_string[psuedo_index] != '>' && psuedo_index < math_string.length )
        {
            // Discern the tag type, so if the next character sub white space is a slash character
            while( math_string[psuedo_index] == ' ' && psuedo_index < math_string.length && math_string[psuedo_index] != '>' )
            {

                psuedo_index++;

            }

            // Now that the white space is clear check the next character, if alphabetic then parse attributes.

            if ( math_string[psuedo_index] == '/' )
            {
                psuedo_index += 2;
            
                return psuedo_index;
            }else
            {
                psuedo_index = this.extinguish_attribute_details(math_string);
            }
        }

        
        if ( math_string[psuedo_index] == '>' )
        {

            psuedo_index++;
        }

        return psuedo_index;
    }
    extinguish_attribute_details(math_string, psuedo_index)
    {
        while ( math_string[psuedo_index] != '>' && psuedo_index < math_string.length )
        {
            
            // Discern the tag type, so if the next character sub white space is a slash character
            while( math_string[psuedo_index] == ' ' && psuedo_index < math_string.length && math_string[psuedo_index] != '>' )
            {

                psuedo_index++;

            }


            // Other wise collect token up until the = equals sign
            while ( math_string[psuedo_index] != '=' && psuedo_index < math_string.length && math_string[psuedo_index] != '>' )
            {
                psuedo_index++;
            }

            // Discern the tag type, so if the next character sub white space is a slash character
            while( math_string[psuedo_index] == ' ' && psuedo_index < math_string.length )
            {

                psuedo_index++;

            }

            // Skip the equals sign token if it exists
            if ( math_string[psuedo_index] == '=' )
            {
                psuedo_index++;
            }

            // Discern the tag type, so if the next character sub white space is a slash character
            while( math_string[psuedo_index] == ' ' && psuedo_index < math_string.length )
            {

                psuedo_index++;

            }

            // Get the value of the behind the equals sign.
            // Discern the tag type, so if the next character sub white space is a slash character
            while( math_string[psuedo_index] != ' ' && psuedo_index < math_string.length && math_string[psuedo_index] != '>' )
            {
                
                psuedo_index++;

            }

            // After the getting the value, we then use a nice table to store the attribute
            if ( this.attribute_map[token] != undefined )
            {
                

            }else
            {
                // Skip to the equals sign
                while ( math_string != "=" && math_string[psuedo_index] != '>' && psuedo_index < math_string.length)
                {
                    psuedo_index++;
                }
                //Skip the white space
                while( math_string[psuedo_index] == ' ' && psuedo_index < math_string.length )
                {

                    psuedo_index++;

                }
                // Skip the the whitespace
                while ( math_string != " " && math_string[psuedo_index] != '>' && psuedo_index < math_string.length)
                {
                    psuedo_index++;
                }
            }

        }

        return psuedo_index;

    }
    extinguish_operator(math_string,psuedo_index)
    {
        // Skip past this tken.
        psuedo_index++;

        // Get operator name
        // Discern the tag type, so if the next character sub white space is a slash character
        while( math_string[psuedo_index] == ' ' && psuedo_index < math_string.length)
        {
            psuedo_index++;
        }

    
        // Get name up to first curly brace or space
        while( math_string[psuedo_index] != ' ' && math_string[psuedo_index] != '{' && psuedo_index < math_string.length && math_string[psuedo_index] != '>' && math_string[psuedo_index] != '<')
        {

            psuedo_index++;
        }

        // Clear the white space if there is any
        while( math_string[psuedo_index] == ' ' && psuedo_index < math_string.length)
        {
            psuedo_index++;
        }

        // Create an open close status to tell to terminate when a space is encountered upon a close
        let open = 0;
        while ( psuedo_index < math_string.length && math_string[psuedo_index] != '>' && math_string[psuedo_index] != '<')
        {
            
            if ( math_string[psuedo_index] == "}")
            {   
                open--;

            } else if ( math_string[psuedo_index] != '{' )
            {

            }else
            {

            
                open++;

            }
            psuedo_index++;

            // If the argument holders are closed, then search for the next non white space character.
            if ( open <= 0  )
            {
                let temp_index = 0;
                while( math_string[psuedo_index] == ' ' && psuedo_index < math_string.length)
                {
                    temp_index++;
                    psuedo_index++;
                }

                if ( math_string[psuedo_index] != '{')
                {
                    psuedo_index -= temp_index;
                    break;
                }
            }

        }
    
        return psuedo_index;

    }
    extinguish_superscript(psuedo_index)
    {
        
    }
    extinguish_subscript(psuedo_index)
    {
        
    }

    // Determine open or closed tag, and parse the attributes if open, otherwise
    expand_attribute_tag(math_string, export_tokens)
    {

        // Skips the tag opener its self.
        this.token_index++;
        
        while ( math_string[this.token_index] != '>' && this.token_index < this.math_string_length )
        {
            // Discern the tag type, so if the next character sub white space is a slash character
            while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length && math_string[this.token_index] != '>' )
            {

                this.token_index++;

            }

            // Now that the white space is clear check the next character, if alphabetic then parse attributes.

            if ( math_string[this.token_index] == '/' )
            {
                this.token_index += 2;
                
                export_tokens.push(this.current_export_token);
                // Then close the current attribute;
                this.current_export_token = new MathParserNode();
                return;
            }else
            {
                this.parse_attribute_tag(math_string);
            }
        }

        
        if ( math_string[this.token_index] == '>' )
        {

            this.token_index++;
        }


    }

    // parse the attributes of the tag
    parse_attribute_tag(math_string)
    {
        

        while ( math_string[this.token_index] != '>' && this.token_index < this.math_string_length )
        {
            
            // Discern the tag type, so if the next character sub white space is a slash character
            while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length && math_string[this.token_index] != '>' )
            {

                this.token_index++;

            }

            // Create a new token object
            let token = "";
            let value = "";
            // Other wise collect token up until the = equals sign
            while ( math_string[this.token_index] != '=' && this.token_index < this.math_string_length && math_string[this.token_index] != '>' )
            {
                token += math_string[this.token_index];
                this.token_index++;
            }

            // Discern the tag type, so if the next character sub white space is a slash character
            while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length )
            {

                this.token_index++;

            }

            // Skip the equals sign token if it exists
            if ( math_string[this.token_index] == '=' )
            {
                this.token_index++;
            }

            // Discern the tag type, so if the next character sub white space is a slash character
            while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length )
            {

                this.token_index++;

            }

            // Get the value of the behind the equals sign.
            // Discern the tag type, so if the next character sub white space is a slash character
            while( math_string[this.token_index] != ' ' && this.token_index < this.math_string_length && math_string[this.token_index] != '>' )
            {
                
                value += math_string[this.token_index];
                this.token_index++;

            }

            // After the getting the value, we then use a nice table to store the attribute
            if ( this.attribute_map[token] != undefined )
            {
                this.attribute_map[token](value);
                
                break;

            }else
            {
                // Skip to the equals sign
                while ( math_string != "=" && math_string[this.token_index] != '>' && this.token_index < this.math_string_length)
                {
                    this.token_index++;
                }
                //Skip the white space
                while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length )
                {

                    this.token_index++;

                }
                // Skip the the whitespace
                while ( math_string != " " && math_string[this.token_index] != '>' && this.token_index < this.math_string_length)
                {
                    this.token_index++;
                }
            }

        }


    }

    // Attribute map parsers ; 
    parse_color_tag(value)
    {

        let color_mini_results = [];
        let color_sub_result = "";
        for( let i = 0; i < value.length; i ++ )
        {

            if ( (value.charCodeAt(i) >= 48 && value.charCodeAt(i) <= 57) ||  value[i] == "." || value[i] == "-")
            {
                color_sub_result += value[i];
            }

            if ( value[i] == ',')
            {
                color_mini_results.push(color_sub_result);
                if ( color_mini_results.length > 2 )
                {
                    break;
                }
                color_sub_result = "";
            }

        }

        if ( color_sub_result != "" && color_mini_results.length < 3)
        {
            color_mini_results.push(color_sub_result);
        }

        for ( let i = 0; i < color_mini_results.length; i ++ )
        {

            this.current_export_token.color[i] = parseFloat(color_mini_results[i]);
        }

    }
    // Attribute map parsers ; 
    parse_position_tag(value)
    {
        
        let position_mini_results = [];
        let position_sub_result = "";
        for( let i = 0; i < value.length; i ++ )
        {

            if ( (value.charCodeAt(i) >= 48 && value.charCodeAt(i) <= 57) ||  value[i] == "." || value[i] == "-")
            {
                position_sub_result += value[i];
            }

            if ( value[i] == ',')
            {
                position_mini_results.push(position_sub_result);
                if ( position_mini_results.length > 2 )
                {
                    break;
                }
                position_sub_result = "";
            }

        }

        if ( position_sub_result != "" && position_mini_results.length < 3)
        {
            position_mini_results.push(position_sub_result);
        }

        for ( let i = 0; i < position_mini_results.length; i ++ )
        {
            
            this.current_export_token.position[i] = parseFloat(position_mini_results[i]);
        }

        

        

    }
    
    parse_size(value)
    {
        this.current_export_token.size = parseFloat(value);
    }

    parse_id(value)
    {
        this.current_export_token.id = value;
    }

    // Expansion of operators like latec
    expand_operator(math_string, export_tokens)
    {
        // Skip past this tken.
        this.token_index++;

        // Get operator name
        // Discern the tag type, so if the next character sub white space is a slash character
        while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length)
        {
            this.token_index++;
        }

        let operator_name = "";
        // Get name up to first curly brace or space
        while( math_string[this.token_index] != ' ' && math_string[this.token_index] != '{' && this.token_index < this.math_string_length && math_string[this.token_index] != '>' && math_string[this.token_index] != '<')
        {
            operator_name += math_string[this.token_index];
            this.token_index++;
        }

        // Clear the white space if there is any
        while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length)
        {
            this.token_index++;
        }

        // Get the operator paramters supports text only right now
        let argument = "";
        let argument_length = 0;
        let operator_arguments = [];
        let operator_arguments_length = [];

        // Create an open close status to tell to terminate when a space is encountered upon a close
        let open = 0;
        while ( this.token_index < this.math_string_length && math_string[this.token_index] != '>' && math_string[this.token_index] != '<')
        {
            
            if ( math_string[this.token_index] == "}")
            {   
                operator_arguments.push(argument);
                operator_arguments_length.push(argument_length);
                argument = "";
                argument_length = 0;
                open--;

            } else if ( math_string[this.token_index] != '{' )
            {
                if ( this.length_map[math_string[this.token_index]] != undefined )
                {
                    argument_length += this.length_map[math_string[this.token_index]];
                }else
                {
                    argument_length += 0.44;
                }
                
                argument += math_string[this.token_index];
            }else
            {

                
                open++;


            }
            this.token_index++;

            // If the argument holders are closed, then search for the next non white space character.
            if ( open <= 0  )
            {
                let temp_index = 0;
                while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length)
                {
                    temp_index++;
                    this.token_index++;
                }

                if ( math_string[this.token_index] != '{')
                {
                    this.token_index -= temp_index;
                    break;
                }
            }

        }
        
        
        
        if ( this.operator_map[operator_name] != undefined )
        {
        
            // Generate a new opeartor token
            let operator_token = new MathParserNode();

            operator_token.copy_attributes(this.current_export_token);

            operator_token.operator_name = operator_name;
            operator_token.operator_arguments = operator_arguments;
            operator_token.operator_arguments_length = operator_arguments_length;

            // Push the current token if it isn't empty.
            if ( this.current_export_token.operator_name != "" || this.current_export_token.textContent != "" )
            {
                export_tokens.push(this.current_export_token);

                let new_token = new MathParserNode();
                new_token.copy_attributes(this.current_export_token);
                this.current_export_token = new_token;                
            }

            export_tokens.push(operator_token);
            

        }else
        {

        }

        

    }
    // Expansion of subscripts and super scripts
    expand_superscript(math_string, export_tokens)
    {
        this.token_index++;
        // Slopy empty check, still doesn't support recursiveness
        if ( this.current_export_token.operator_name != "" || this.current_export_token.textContent != "" )
        {

            // Skip any white space.
            while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length)
            {
                this.token_index++;
            }

            // Then absorb text contnet up to the closing tag
            if ( math_string[this.token_index] == '{')
            {

                // Skip the open bracket
                this.token_index++;
                
                while ( math_string[this.token_index] != '}' && this.token_index < this.math_string_length )
                {
                    this.current_export_token.superscriptContent += math_string[this.token_index];
                    this.token_index++;
                }

                // Skip the close bracket 
                this.token_index++;


            }else
            {
                // Use the regular character there and return.
                this.current_export_token.superscriptContent += math_string[this.token_index];
                this.token_index++;

            }

            //At this point check for any subscripts as the dual.

            // Skip any white space.
            // while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length)
            // {
            //     this.token_index++;
            // }

            if ( math_string[this.token_index] == '_' )
            {
                this.token_index++;
                // Use the same protocol to absorb the paramter
                while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length)
                {
                    this.token_index++;
                }
                
                if ( math_string[this.token_index] == '{')
                {

                    // Skip the open bracket
                    this.token_index++;
                    
                    while ( math_string[this.token_index] != '}' && this.token_index < this.math_string_length )
                    {

                        this.current_export_token.subscriptContent += math_string[this.token_index];
                        this.token_index++;
                    }

                    // Skip the close bracket 
                    this.token_index++;


                
                }else
                {
                    // Use the regular character there and return.
                    this.current_export_token.subscriptContent += math_string[this.token_index];
                    this.token_index++;

                    
                }

            }

            //Then push the text object to the export tokens
            export_tokens.push(this.current_export_token);
            
            //Create a new token and copy the attributes
            let new_token = new MathParserNode();
            new_token.copy_attributes(this.current_export_token);

            this.current_export_token = new_token;

        }

        return;

    }

    expand_subscript(math_string, export_tokens)
    {
        this.token_index++;

        // Slopy empty check, still doesn't support recursiveness
        if ( this.current_export_token.operator_name != "" || this.current_export_token.textContent != "" )
        {

            // Skip any white space.
            while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length)
            {
                this.token_index++;
            }

            // Then absorb text contnet up to the closing tag
            if ( math_string[this.token_index] == '{')
            {

                // Skip the open bracket
                this.token_index++;
                
                while ( math_string[this.token_index] != '}' && this.token_index < this.math_string_length )
                {
                    
                    
                    this.current_export_token.subscriptContent += math_string[this.token_index];
                    this.token_index++;
                }

                // Skip the close bracket 
                this.token_index++;


            }else
            {
                // Use the regular character there and return.
                this.current_export_token.subscriptContent += math_string[this.token_index];
                this.token_index++;

            }

            //At this point check for any subscripts as the dual.

            // Skip any white space.
            // while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length)
            // {
            //     this.token_index++;
            // }

            if ( math_string[this.token_index] == '^' )
            {
                this.token_index++;
                // Use the same protocol to absorb the paramter
                while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length)
                {
                    this.token_index++;
                }
                
                if ( math_string[this.token_index] == '{')
                {

                    // Skip the open bracket
                    this.token_index++;
                    
                    while ( math_string[this.token_index] != '}' && this.token_index < this.math_string_length )
                    {

                        this.current_export_token.superscriptContent += math_string[this.token_index];
                        this.token_index++;
                    }

                    // Skip the close bracket 
                    this.token_index++;


                
                }else
                {
                    // Use the regular character there and return.
                    this.current_export_token.superscriptContent += math_string[this.token_index];
                    this.token_index++;

                    
                }

            }

            //Then push the text object to the export tokens
            export_tokens.push(this.current_export_token);
            
            //Create a new token and copy the attributes
            let new_token = new MathParserNode();
            new_token.copy_attributes(this.current_export_token);

            this.current_export_token = new_token;

        

        }

        return;
    }

    // Expands a new line as an operator type
    expand_newline ( math_string, export_tokens )
    {

        if ( this.encountered_character == false )
        {
            this.token_index += 1;
        }else
        if ( this.current_export_token.operator_name != "" || this.current_export_token.textContent != "" )
        {


            //Then push the text object to the export tokens
            export_tokens.push(this.current_export_token);

            //  Create a newline token
            let newline_token = new MathParserNode();
            newline_token.textContent = "\n";
            export_tokens.push ( newline_token );

            // Create a new token
            let new_token = new MathParserNode();
            new_token.copy_attributes(this.current_export_token);
            this.current_export_token = new_token;

            this.token_index += 1;

            // Skip the weird space
            this.skip_space( math_string );
        }else{

            //  Create a newline token
            let newline_token = new MathParserNode();
            newline_token.textContent = "\n";
            export_tokens.push ( newline_token );

            this.token_index += 1;
            this.skip_space( math_string );
        }

        //

    }

    // Expands the equals sign token
    expand_equals ( math_string, export_tokens )
    {

        // Push the current token.
        export_tokens.push ( this.current_export_token );

        // Generate the equals token.
        let equals_token = new MathParserNode();
        equals_token.copy_attributes( this.current_export_token );

        equals_token.textContent = "=";

        equals_token.totalLength = this.length_map["="];

        // Update the last letter length
        equals_token.lastLetterLength = this.length_map["="];

        export_tokens.push( equals_token );

        //Create a new token and copy the attributes
        let new_token = new MathParserNode();
        new_token.copy_attributes(this.current_export_token);

        this.current_export_token = new_token;


        this.token_index += 1;
    }

    // Tries to estimate width of text.
    get_text_meta_data(math_string)
    {

        let total_length = 0;

        let psuedo_index = 0;

        while ( psuedo_index < math_string.length )
        {
            if ( this.token_extinguishers[math_string[psuedo_index]] != undefined )
            {
                psuedo_index = this.token_extinguishers[ math_string[psuedo_index] ](math_string, psuedo_index);
            }else
            if ( this.length_map[math_string[psuedo_index]] != undefined )
            {
                total_length += this.length_map[math_string[psuedo_index]];

            }else
            {
                //total_length += 0.44;
            }

            psuedo_index++;
            
        }
    
        return total_length;
    }

    // Here we can set the baseline vectors
    set_base_line_vectors(vector0, vector1, orientation)
    {
        this.math_decoder.baseline_vectors[0][0] = vector0.x;
        this.math_decoder.baseline_vectors[0][1] = vector0.y;
        this.math_decoder.baseline_vectors[0][2] = vector0.z;
//
        this.math_decoder.baseline_vectors[1][0] = vector1.x;
        this.math_decoder.baseline_vectors[1][1] = vector1.y;
        this.math_decoder.baseline_vectors[1][2] = vector1.z;

        
        this.math_decoder.orientation[0] = orientation.x;
        this.math_decoder.orientation[1] = orientation.y;
        this.math_decoder.orientation[2] = orientation.z;
        this.math_decoder.orientation[3] = orientation.w;

        //console.log(this.math_decoder.baseline_vectors);
        //this.math_decoder.orientation = plane_normal;

    }

    // Function to skip to the next non space.
    skip_space ( math_string )
    {

            while ( this.token_index < this.math_string_length && math_string[this.token_index] == ' ' )
            {
                this.token_index += 1;
            }

    }

    // We parse math and pass an id map reference to the math parser.
    parse_math(math_string, id_map_reference)
    {

        // Reset the parse string
        this.token_index = 0;

        // Set the length of the math string
        this.math_string_length = math_string.length;

        // Create array of export tokens of MathParserNodes
        this.current_export_token = new MathParserNode();

        let export_tokens = [];

        // Boolean to check if alphanumeric character.
        this.encountered_character = false;
    
        while ( this.token_index < math_string.length )
        {
            if ( this.token_map[math_string[this.token_index]] != undefined )
            {
                this.token_map[math_string[this.token_index]](math_string, export_tokens);            
            }else
            {

                // Sum the total text content length
                if ( this.length_map[math_string[this.token_index]] != undefined )
                {
                    this.current_export_token.totalLength += this.length_map[math_string[this.token_index]];

                    // Update the last letter length
                    this.current_export_token.lastLetterLength = this.length_map[math_string[this.token_index]];
    
                }else
                {
                    this.current_export_token.totalLength += 0.44;
                    this.current_export_token.lastLetterLength = 0.44;
                }
                
                
                if ( math_string.charCodeAt(this.token_index) >= 33 && math_string.charCodeAt(this.token_index) <= 126 )
                {
                    this.encountered_character =  true;
                }

                this.current_export_token.textContent += math_string[this.token_index];
                
                
                this.token_index++;
            }

        }
        
        // Export the current export token
        if ( this.current_export_token.textContent != "" )
        {
         
            export_tokens.push(this.current_export_token);
        }
        
        // Return the expression as an id map for example frac0, frac1, then the components of would be numerator0 denominator1
        // Text contnet is just t0 t1

        // Any id given explicitly will return a group of id's under its container
        // The math parser just absorbs ids, the decoder generates them and associates indexes into the text pool for each,
        
        // After decoding the decoder should end the current equation, if there is an equation.
        return this.math_decoder.decode(export_tokens, id_map_reference);

    }

    // Generates simply export tokens for testing
    get_export_tokens(math_string)
    {

        // Reset the parse string
        this.token_index = 0;

        // Set the length of the math string
        this.math_string_length = math_string.length;

        // Create array of export tokens of MathParserNodes
        this.current_export_token = new MathParserNode();

        let export_tokens = [];

        // Boolean to check if alphanumeric character.
        this.encountered_character = false;
    
        while ( this.token_index < math_string.length )
        {
            if ( this.token_map[math_string[this.token_index]] != undefined )
            {
                this.token_map[math_string[this.token_index]](math_string, export_tokens);            
            }else
            {

                // Sum the total text content length
                if ( this.length_map[math_string[this.token_index]] != undefined )
                {
                    this.current_export_token.totalLength += this.length_map[math_string[this.token_index]];

                    // Update the last letter length
                    this.current_export_token.lastLetterLength = this.length_map[math_string[this.token_index]];
    
                }else
                {
                    this.current_export_token.totalLength += 0.44;
                    this.current_export_token.lastLetterLength = 0.44;
                }
                
                
                if ( math_string.charCodeAt(this.token_index) >= 33 && math_string.charCodeAt(this.token_index) <= 126 )
                {
                    this.encountered_character =  true;
                }

                this.current_export_token.textContent += math_string[this.token_index];
                
                
                this.token_index++;
            }

        }
        
        // Export the current export token
        if ( this.current_export_token.textContent != "" )
        {
         
            export_tokens.push(this.current_export_token);
        }
        
        // Return the expression as an id map for example frac0, frac1, then the components of would be numerator0 denominator1
        // Text contnet is just t0 t1

        // Any id given explicitly will return a group of id's under its container
        // The math parser just absorbs ids, the decoder generates them and associates indexes into the text pool for each,
        
        // After decoding the decoder should end the current equation, if there is an equation.
        return export_tokens;

    }

    // Dispose of a given text object with the ID map
    dispose( id_map )
    {
        //console.log ( id_map );
        this.scene_context.reusable_text.dispose_ids ( id_map.all_ids );

    }

}


let math_parser = new MathParser( undefined );

let export_tokens = math_parser.get_export_tokens ( "f_n = 0" );

let expression_converter = new MathExpressionConverter ( );

let converted_root = expression_converter.convert ( export_tokens );

// let math_expression_solver = new MathExpresssionSolver ( );

// math_expression_solver.symbol_map.a = 1;
// math_expression_solver.symbol_map.b = 2;

// let solved = math_expression_solver.solve ( converted_root );

// math_expression_solver.print ( solved );