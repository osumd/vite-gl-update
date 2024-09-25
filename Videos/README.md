Scene (Scene Name):
    Subscene 1.
        Script:
            Gloal Effect:
                "Explain recurssion"
            Body:
                Reccursion begins with the inital condition, and given a rule defined by its previous iterations so that the nth term of the recursive
                function can be solved. :- s0

                Lame's Theorem for example analyzes the number of divisions it takes to get to the greatest common denominator of two integer values :- s1

                the Euclidean algorithm uses recursion with a base case being that the remainder from the current iteration is zero, and that subsequently 
                remainders are computed until this base case is reached. :- s2

                The steps of the euclidean algorithm are linked to fibbonacci numbers by equality relations for example, then explain lames theroem

                Solving for a simple recurrence relation like the fibbonaci sequence involves solving a 2-degree polynomial or a quadratic polynomial. 
        Display:
            Gloal Effect:
                "Introduce the feeling/essence of recursion using the fibbonaci sequence." :- s0
                "Explains contrived insights from Lame's Theorem" :- s1
                "Lays out the notation of a recurrence relation" :- s2
            Body:
                Fibbonacci Function described, initially plotted, then the Fibbonaci Map sequences are plotted, the pixels are draw onto a plane
                as they are plotted and then.

                Fibbonaci surfaces arrise from each fibonnaci sequence, where the sequence identity is describe on scene, as well as current fibbonaci 
                number [ uses memoization ], the surfaces are lighting defined by fibbonaci numbers, and is kind of like a fractal. :- s0

                A few steps of euclidean algorithm are displayed in a column on the left side of the screen, then the recurrence relation for the euclidean algorithm shows up centered in the right side column of the screen. :- s2

        Macro Usage:

            // The document model
            let s1doc = FuiDoc.parse ( " 
                < display="grid" columns_template = "50% 50%" >

                    < >
                        a_n = a_n-1 + a_n-2
                        a_0 = 0
                        a_1 = 1
                    </>

                    <>
                    </>

                    <texture>
                    </>

                    < plot id = "plot" >
                    </>

                </>
            
            " ); 

            animate.opacity ( s1doc.lhs.equation1, s1doc.rhs.equation1 ); // fade in
            animate.opacity ( s1doc.plot );

            let plane = s1doc.infinity_plane ( origin,  ); 

            let p1 = s1doc.fade_in_point ( ( s1doc.eq0.input, s1doc.eq0.input ) );
            let p2 = s1doc.fade_in_point ( ( s1doc.eq1.input, s1doc.eq1.input ) );

            animate.lookat ( s1doc.plot.camera, p1 );
            animate.lookat ( s1doc.plot.camera, p2 );

            // In the future make it possible to assign ids to textures
            
            animate.opacity ( s1doc.geometry_texture );
            animate.rotate_view ( s1doc.plot.camera, 0, target, 180 );

            s1doc.plot.materialize_line ( p1, p2 );
            s1doc.plot.coordinate_plane ( y = 1 );


            // What should happen here.
            s1doc.remove("el0")

            s1doc.grid.columns = ["50%"]
            s1doc.grid.rows = ["50%, 50%"]

            context.animate.execute ( value_to_change, post_value, update_function )

            in each sequence, plot the ball sequence, set labels nodally representing the node text mode.

            for each ball then simply reveal the relevent sequence information
            s1doc.plot ( fibonacci value );
            context.animate.uniform ( )
            

            s1doc.plot.add_plane ( i );
            s1doc.view_plane ( );
            s1doc.plot.fade_in_point



            // Procedural model
            let pl = planar_ui ( );

            pl.begin_table ( column_vector, row_vector );
            pl.begin_column ( );

            pl.add_equation( );
            pl.add_equation( );
            pl.add_equation( );

            pl.begin_column ( );
            
            pl.3dplot ( )

            pl.end_table ( );

        Plot

            Requirements:
                Allows multiple coordinate system visualization methods [ use mvp one for now ]
                Plots Points
                Lines
                Vectors
                Single Variate Functions
                Multivariate Functions


            Plot ( CoordinateBasis, Origin )

            Instanced spheres

            Usage:

                class point_id : InstancedMesh reference, and index, type tag

                problem: if the object is disposed of the reference is still in the event system. | dispose events I guess

                let point_id = Plot.fade_in_point ( );

                
                eventSystem.animate (  )
            

            



            
            
                
    Subscene 2.
        Script:
            Goal Effect:
                

                


Notes - Descriptions
    s0 :- 
    
    what is a fibbonaci surface, a fibbonacci surface increases in complexity at each number in the sequence. Each fibbonaci surface has a location cooresponding to its
    recursive identity, or "stack location". The surface is built adeqeuately large, but the size is also determined by the fibbonaci sequence. The fibbonaci surface is
    a point rolling along a series of circles where the radius of the circle is a function related to the fibbonaci sequence. [COOL idea but not works for three.js is that the surface samples a bitmap of fibonacci numbers]. Mesh generation must be animatable so that the surface is being built, the shader uses lighting etc

    Methods/Options
        vertex instancing uniform pipeline:
            cpu directs the transform, radius, angles, and instance count of the surface completion.
            A batch of instances are assigned to a single sequence, each invocation has a dedicated interpolation of the sphere radius, angles, and transform at that point
            which leads to complexity. We would have to store an angle, radius, etc for each instance which would be possible but lets explore other options.
        fragment shader pipeline:
            a vertex call for each sequence up to a limit, then the fragment shader simulates the animations uses (u+v) where each pixel  represents a plane
            and the plane is written into a texture.
            Then the buffer is rendered and slowly allowed more draw calls on the geometry to simulate the animation.
            problem: the results are written directly to textures on the gpu which is costly for the cpu to read in order to for example sync up a camera for the journey!
    
    animation.
        be able to create more fibbonaci surfaces
        edit the variables



Add an option to add new nodes to a current instance of a FUI Doc
Add a re-rendering option such that previously rendered objects are simply reused.


ChunkMesh Usage:
    // Uniform primitives per chunk and per protocol.
    ChunkMesh ( { chunk_size, chunk_radius, chunk_finding_method, primitive_per_chunk, primitive_type })
    ChunkMesh.add_uniforms ( )
    ChunkMesh.add_protocol ( { max_primitives_per_protocol = 2, shader_subroutine } )

ChunkCoordiantePlane Usage:

    ChunkCoordinatePlane ( { plane_information, sub_divisions, origin, unit_length })

    