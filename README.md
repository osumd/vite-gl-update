#Event System
## More Attributes
Need look at interpolation, need scaling, euler rotation quaternions etc.
## How to manage disposable or temporal length of objects.
Could potentially just zero scale use color for opacity., could these be added
to a reusable asset bin for events which
need similar disposable objects.
### Algorithm Idea
Set creation event up for example text.
generate disposable, a three text object is positioned and oriented and then the time line head reaches the end of the event with "disposable objects" in it, then it adds that transparent or zero size object into an array which the the others can draw on.
### Test 1 General disposable complete
### Test 1 Theory
any operation on disposing of text will be fine.
### Test 2 Animation System text
the event animation system should be asked
to group or add objects into a single scene
to make ease of disposal, but also animate these
objects

so either there is a seperate object for
storing the collections of text ids
and the event system can accept like group id's
and local id's

TextGroup
Along the ideas of the text group
there should be an ability to group
multiple object types
as only their id distinguishes themselves.
for this purpose this will be fine.

# Object orthoview
Define object, define coordinate axis from object center
find the orthoaxis in question x,y,z , the difference in forward vector of camera
must be zero with the orthoaxis from object center coordinate system.
so we set the forward vector to axis in question which has negative dot product to
the object ortho axis.

not all objects start in the same orientation so its confusing to reference the forward vector
we get the forward vector relative to 0,0,-1 or original state of a camera
then apply current rotation to this vector to attain forward vector
then we cross with the orthoaxis and rotate by the angle between the two vectors.
we flip the orthoaxis as the desired axis.

the otherhalf of the transformation involves distance and so interleaves two attributes.
we simply find the new position by object_position + orthoaxis*distance.

# Solid uv plane to sphere geometry.
Divide a plane into n sections, use a ratio to place a vertex in each section.
Transform the uv onto the surface of the sphere.

Face connection from each vertex to adjacent subdivded faces.

Algorithm
first divides the x space or radius plane by n
and divides the y space or radius plane by n
these section dimensions or spaces are denoted, and based
on the number a point will be placed in the section for a simple
algorithm just use a center for the first implementation.

Then also denote the adjacency of the sections, so that edges in their respective section can be connected to form the faces.

# Need a fix for instance machine resizing.



# REFACTORS
Allow object to be defined before all switch states in get, and update less confusing.


# VSCODE Shortcuts
ctrl-p search for file
ctrl-shift-o search for symbol
ctrl-g line number
ctrl-tab tab back and forth