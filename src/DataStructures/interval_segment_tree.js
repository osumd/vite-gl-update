


class interval_segment_node
{
    constructor(start, end, value)
    {
        this.start = start;
        this.end = end;
        this.value = value;
    }

    
}

function unionize_segments(segmentA, segmentB)
{
    if(segmentA == undefined && segmentB == undefined)
    {
        return undefined;
    }

    if(segmentA == undefined && segmentB != undefined)
    {
        return new interval_segment_node(segmentB.start,segmentB.end,segmentB.value);
    }
    if(segmentB == undefined && segmentA != undefined)
    {
        return new interval_segment_node(segmentA.start,segmentA.end,segmentA.value);
    }

    let min = (segmentA.start < segmentB.start) ? segmentA.start : segmentB.start;
    let max = (segmentA.end > segmentB.end) ? segmentA.end : segmentB.end;
    return new interval_segment_node(min,max,"");
    
}

function intersects_segments(value, segment)
{

    if(segment == undefined)
    {
        return false;
    }
    if(value >= segment.start && value <= segment.end)
    {
        return true;
    }
    return false;

}


class interval_segment_tree
{
    constructor()
    {   
        //set up the leaf array to construct the tree from.
        this.intervals_leafs = []
        this.tree = undefined;
    }

    insert_interval(start,end,value)
    {

        this.intervals_leafs.push( new interval_segment_node(start,end,value) );

    }

    interval_sort_function(a,b)
    {

        //could use insertion sort here instead to maintain the sorted array.
        if(a.start < b.start)
        {
            return -1;
        }
        if(b.start < a.start)
        {
            return 1;
        }

        if(b.start == a.start)
        {
            return 0;
        }

    }

    build_tree()
    {
        let leaf_nodes = this.intervals_leafs.length;

        let nodes = Math.pow(2,Math.ceil(Math.log2(leaf_nodes))) ;
        let height =  Math.floor(Math.log2( nodes ));
        nodes = ((2*nodes)-1) - (nodes-leaf_nodes);

        this.tree_length = nodes;

        if(leaf_nodes <= 2 )
        {
            nodes+=1;
        }
        
        if(this.tree == undefined)
        {
            this.tree = new Array(nodes);
        }else
        {
            while(nodes > this.tree.length)
            {
                this.tree.push(0);
            }
            this.tree.length = nodes;
        }
        
        this.intervals_leafs.sort( this.interval_sort_function );

        for(let i = 0; i < leaf_nodes; i++)
        {

            this.tree[ (nodes-leaf_nodes) + i ] = this.intervals_leafs[i];

            
        }

        for(let level = height-1; level >= 0; level--)
        {

            let nodes_at_level = Math.pow(2, level);
            
            let start_index = ((2*nodes_at_level)-2)-(nodes_at_level-1);


            

            for(let col = 0; col < nodes_at_level; col++)
            {

                let parent = start_index + col;
                
                let left_child = (parent*2)+1;
                let right_child = (parent*2)+2;

                let unionized_segment = unionize_segments(this.tree[left_child], this.tree[right_child]);

                this.tree[parent] = unionized_segment;

            }


        }
    }

    in_interval(value)
    {

        //get root
        let current_node = this.tree[0];

        let intersected_list = [];

        if(intersects_segments(value, current_node))
        {
            this.in_interval_helper(0,value,intersected_list);
        }

        
        return intersected_list;



    }

    in_interval_helper(index, value, intersected_list)
    {

        let current_node = this.tree[index];
        
        if(current_node.value != "")
        {
            intersected_list.push(current_node);
            return;
        }

        let left_index = (index*2)+1;
        let right_index = (index*2)+2;

        if(left_index < this.tree.length && intersects_segments(value, this.tree[left_index]) == true)
        {
            this.in_interval_helper(left_index, value, intersected_list);
        }

        if(right_index < this.tree.length && intersects_segments(value, this.tree[right_index]) == true)
        {
            this.in_interval_helper(right_index, value, intersected_list);
        }

    }
 
}


export {interval_segment_tree, interval_segment_node};
