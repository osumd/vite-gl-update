Scene (Scene Name):
    Subscene 1.
        Script:
            Gloal Effect:
                "Explain recurssion"
            Body:
                Reccursion begins with the inital condition, and given a rule defined by its previous iterations so that the nth term of the recursive
                function can be solved. :- s0

                Lame's Theorem for example analizes the number of divisions it takes to get to the greatest common denominator of two integer values :- s1

                the Euclidean algorithm uses recursion with a base case being that the remainder from the current iteration is zero, and that subsequently 
                remainders are computed until this base case is reached. :- s2
        Display:
            Gloal Effect:
                "Introduce the feeling/essence of recursion using the fibbonaci sequence." :- s0
                "Explains contrived insights from Lame's Theorem" :- s1
                "Lays out the notation of a recurrence relation" :- s2
            Body:
                Fibbonaci surfaces arrise from each fibonnaci sequence, where the sequence identity is describe on scene, as well as current fibbonaci 
                number [uses memoization], the surfaces are lighting defined by fibbonaci numbers, and is kind of like a fractal. :- s0

                


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
    
    lets try option 2
        
        convert the triangles to planes.
        connect the planes along the curve.
        use spheres instead of circles
        add lighting, then expand to higher resolutions.