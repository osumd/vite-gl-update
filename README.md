# Event System adsf
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




# VSCODE Shortcuts
ctrl-p search for file
ctrl-shift-o search for symbol
ctrl-g line number
ctrl-tab tab back and forth