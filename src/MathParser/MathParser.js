

import { Text } from "troika-three-text";

// Use standard troika text attributes
class MathParserNode
{
    constructor()
    {
        //Alignment options
        this.alignX = "left";
        this.alignY = "0"

        this.color = [1,0,0];
        this.position = [0,0,0];
        this.size = 1.0;
        this.id = "";
        this.textContent = "";
        
        // Register length of the total letters
        // Register length of letter at the end.
        this.totalLength = 0;
        this.lastLetterLength = 0;

        // Operator assignment
        this.operator_name = "";
        this.operator_arguments = [];
        this.operator_arguments_length = [];
        this.empty = true;

        // Supports superscript and subscript behavior
        this.superscriptContent = "";
        this.subscriptContent = "";

        
    }

    copy_attributes( other_node )
    {
        this.color = [...other_node.color];
        this.size = other_node.size;
        this.id = other_node.id;
        this.spaceCount = other_node.spaceCount;
    }
}

// Math decoder will run through parser and generate the text
// Uses troika text

class MathDecoder
{
    constructor(scene_context)
    {
        // Store scene context
        this.scene_context = scene_context;
        // We need our baseline cursor
        this.baseline_cursor = [0,0];

        // Set by what the position of the current token is.
        this.current_base_position = [0,0,0];

        this.operator_map = {
            "frac" : this.render_frac.bind(this)
        };

        // Associate the ids with indexes into the reusable text, helpful for reference/altering specific portions of a parsed math system.
        this.id_map = {
            "" : {
                text_count: 0,
                frac_count: 0,
                total_length: 0,
            },
        };
        // Id associated with current export token
        this.current_group_id = "";

        // List of all text_ids associated with this current decoding cycle
        this.ids_array = [];
        
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
    }

    // Use subroutines for appending ids into the id table
    add_text_id(id)
    {
        // Given the id assign it to textx
        // Get the current text_count
        let text_count = this.id_map[this.current_group_id].text_count;
        // Assign the text variation the text id
        this.id_map[this.current_group_id][`text${text_count}`] = id;
        
    }

    add_superscript_id(id)
    {
        let text_count =this.id_map[this.current_group_id].text_count;
        this.id_map[this.current_group_id][`test${text_count}super`] = id;
    }

    add_subscript_id(id)
    {
        let text_count =this.id_map[this.current_group_id].text_count;
        this.id_map[this.current_group_id][`test${text_count}sub`] = id;
    }

    // Increment the text id after subscripts and superscripts
    increment_text_id()
    {
        this.id_map[this.current_group_id].text_count++;
    }
    // Use subroutines for appending ids for the frac operator
    add_frac_id(numerator, denominator)
    {
        // Given the id assign it to fracx
        // Get the current text_count
        let frac_count = this.id_map[this.current_group_id].frac_count;
        // Assign the text variation the text id
        this.id_map[this.current_group_id][`frac${frac_count}numerator`] = numerator;
        this.id_map[this.current_group_id][`frac${frac_count}denominator`] = denominator;
        
    }

    render_text(export_token)
    {
        // Add text

        

        // It is raw text, text is generated and retrievable through troika text
        // Create a new text object
        let text = this.scene_context.reusable_text.get_new_text_id();
        
        // Generate base x and base y
        let base_x = this.baseline_cursor[0] + this.current_base_position[0];
        let base_y = this.baseline_cursor[1] + this.current_base_position[1];
        let base_z = this.current_base_position[2];

        //console.log(base_x,base_y,base_z);

        this.scene_context.reusable_text.text_objects[text].fontSize = export_token.size;
        this.scene_context.reusable_text.text_objects[text].text = export_token.textContent;
        this.scene_context.reusable_text.text_objects[text].position.set(base_x, base_y, base_z);
        this.scene_context.reusable_text.text_objects[text].font = "../../public/fonts/latinmodern-math.otf";
        this.scene_context.reusable_text.text_objects[text].sync();
        // Round the letter count up
    
        // Add the newly created text id to the id_map
        this.add_text_id(text);

        // Assume the letters are of size/size and just use the division by two formula
        let baselineSkip  = (export_token.totalLength)*export_token.size;

        if ( export_token.superscriptContent != "" )
        {
            // Then apply a new superscript text
            let superscript_text = this.scene_context.reusable_text.get_new_text_id();
            this.scene_context.reusable_text.text_objects[superscript_text].fontSize = export_token.size*0.4
            this.scene_context.reusable_text.text_objects[superscript_text].text = export_token.superscriptContent;

            this.scene_context.reusable_text.text_objects[superscript_text].position.set(base_x+baselineSkip - export_token.lastLetterLength*0.2, base_y-export_token.lastLetterLength*0.1, base_z);

            this.scene_context.reusable_text.text_objects[superscript_text].font = "../../public/fonts/latinmodern-math.otf";

            this.scene_context.reusable_text.text_objects[superscript_text].sync();
        
            this.scene_context.scene.add(this.scene_context.reusable_text.text_objects[superscript_text]);

            // Add the super script to the id map
            this.add_superscript_id(superscript_text);
        }

        if ( export_token.subscriptContent != "" )
        {
            // Then apply a new superscript text
            let subscript_text = this.scene_context.reusable_text.get_new_text_id();

            this.scene_context.reusable_text.text_objects[subscript_text].fontSize = export_token.size*0.4
            this.scene_context.reusable_text.text_objects[subscript_text].text = export_token.subscriptContent;
            this.scene_context.reusable_text.text_objects[subscript_text].position.set(base_x+baselineSkip - export_token.lastLetterLength*0.2, base_y-export_token.lastLetterLength*1.5, base_z);
            this.scene_context.reusable_text.text_objects[subscript_text].font = "../../public/fonts/latinmodern-math.otf";

            this.scene_context.reusable_text.text_objects[subscript_text].sync();
            
            this.scene_context.scene.add(this.scene_context.reusable_text.text_objects[subscript_text]);

            // Addd the sub script to the id map.
            this.add_subscript_id(subscript_text);

        }

        if ( export_token.superscriptContent != "" && export_token.subscriptContent != "")
        {
            baselineSkip += export_token.lastLetterLength*0.4;
        }
        

        this.baseline_cursor[0] += baselineSkip;
        
        // Increment the text id
        this.increment_text_id();

        this.scene_context.scene.add(this.scene_context.reusable_text.text_objects[text]);
    }

    render_frac(export_token)
    {

        // Generate base x and base y
        let base_x = this.baseline_cursor[0] + this.current_base_position[0];
        let base_y = this.baseline_cursor[1] + this.current_base_position[1];
        let base_z = this.current_base_position[2];

        let m = this.scene_context.reusable_text.get_new_text_id();
        let n = this.scene_context.reusable_text.get_new_text_id();
        let k = this.scene_context.reusable_text.get_new_text_id();
    
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
        this.scene_context.reusable_text.text_objects[m].anchorX = export_token.alignX;
        this.scene_context.reusable_text.text_objects[m].anchorY = export_token.alignY;
        this.scene_context.reusable_text.text_objects[m].position.set(base_x, base_y, base_z);
        this.scene_context.reusable_text.text_objects[m].fontSize = 0.7*export_token.size;
        this.scene_context.reusable_text.text_objects[m].letterSpacing = 0;
        this.scene_context.reusable_text.text_objects[m].font = "../../public/fonts/latinmodern-math.otf";
        this.scene_context.reusable_text.text_objects[m].sync();
        
        let size0 = (export_token.operator_arguments_length[0] == max_size ) ? ( max_size - export_token.operator_arguments_length[0] ) : ( max_size - export_token.operator_arguments_length[0] )*0.5;
        let size1 = (export_token.operator_arguments_length[1] == max_size ) ? ( max_size - export_token.operator_arguments_length[1] ) : ( max_size - export_token.operator_arguments_length[1] )*0.5;

        this.scene_context.reusable_text.text_objects[n].text = export_token.operator_arguments[0];
        this.scene_context.reusable_text.text_objects[n].anchorX = export_token.alignX;
        this.scene_context.reusable_text.text_objects[n].anchorY = export_token.alignY;
        this.scene_context.reusable_text.text_objects[n].position.set(base_x + size0, base_y + export_token.size*0.3, base_z);
        this.scene_context.reusable_text.text_objects[n].fontSize = 0.7*export_token.size;
        this.scene_context.reusable_text.text_objects[n].font = "../../public/fonts/latinmodern-math.otf";
        this.scene_context.reusable_text.text_objects[n].sync();

        this.scene_context.reusable_text.text_objects[k].text = export_token.operator_arguments[1];
        this.scene_context.reusable_text.text_objects[k].anchorX = export_token.alignX;
        this.scene_context.reusable_text.text_objects[k].anchorY = export_token.alignY;
        this.scene_context.reusable_text.text_objects[k].position.set(base_x + size1, base_y - export_token.size*0.3, base_z)*export_token.size;
        this.scene_context.reusable_text.text_objects[k].fontSize = 0.7*export_token.size;
        this.scene_context.reusable_text.text_objects[k].font = "../../public/fonts/latinmodern-math.otf";
        this.scene_context.reusable_text.text_objects[k].sync();

        this.baseline_cursor[0] += max_size*export_token.size;

        this.scene_context.scene.add(this.scene_context.reusable_text.text_objects[m]);
        this.scene_context.scene.add(this.scene_context.reusable_text.text_objects[n]);
        this.scene_context.scene.add(this.scene_context.reusable_text.text_objects[k]);

        this.add_frac_id(n,k);
    }

    decode(export_tokens)
    {

        // Reset the id map
        this.id_map = {
            "" : {
                text_count: 0,
                frac_count: 0,
                total_length: 0,
            },
        };
        // Reset the id array, helpful for disposing of text ids in bulk in an animation group
        this.ids_array = [];

        for(let i = 0 ; i < export_tokens.length; i++)
        {
            // Let the export token exists
            let export_token = export_tokens[i];

            // Increment the global total_length
            this.id_map[""].total_length+=export_token.totalLength;

            

            // Set the base position.
            this.current_base_position[0] = export_token.position[0];
            this.current_base_position[1] = export_token.position[1];
            this.current_base_position[2] = export_token.position[2];

            // If the export token has an id then initalize its inner contents
            if ( export_token.id != "" )
            {
                this.id_map[export_token.id] = {}
                this.id_map[export_token.id].text_count = 0;
                this.id_map[export_token.id].frac_count = 0;
            }

            //Select the current group id as this token as its being parsed.
            this.current_group_id = export_token.id;

            // Render either the text or the operator.
            if ( export_token.textContent != "" )
            {
                this.render_text(export_token);

            }else if ( this.operator_map[export_token.operator_name] != undefined )
            {
                
                this.operator_map[export_token.operator_name](export_token);

            }

        }

        this.reset();

        return this.id_map;

    }
}

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
            "b" : 0.55,
            "c" : 0.5,
            "d" : 0.5,
            "e" : 0.5,
            "f" : 0.4,
            "g" : 0.55,
            "h" : 0.4,
            "i" : 0.33,
            "j" : 0.44,
            "k" : 0.65,
            "l" : 0.33,
            "m" : 0.7,
            "n" : 0.65,
            "o" : 0.5,
            "p" : 0.65,
            "q" : 0.65,
            "r" : 0.45,
            "s" : 0.45,
            "t" : 0.44,
            "u" : 0.65,
            "v" : 0.65,
            "w" : 0.65, 
            "x" : 0.7,
            "y" : 0.7,
            "z" : 0.6,
            " " : 0.35,
            "=" :0.77,
            "+" : 0.77

        };

        // Create the math decoder
        this.math_decoder = new MathDecoder(scene_context);

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
                this.current_export_token = new MathParserNode();

                
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
            while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length)
            {
                this.token_index++;
            }

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
            while( math_string[this.token_index] == ' ' && this.token_index < this.math_string_length)
            {
                this.token_index++;
            }

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

    parse_math(math_string)
    {
        // Reset the parse string
        this.token_index = 0;

        // Set the length of the math string
        this.math_string_length = math_string.length;

        // Create array of export tokens of MathParserNodes
        this.current_export_token = new MathParserNode();

        let export_tokens = [];

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
        

        return this.math_decoder.decode(export_tokens);

    }

}

// let ParseMode = new MathParser();
// ParseMode.parse_math("a^{2+2}_{1+1}");