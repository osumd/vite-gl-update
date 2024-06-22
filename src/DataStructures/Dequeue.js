import React from 'react';

class Dequeue extends React.Component
{

    constructor()
    {
        super();

        this.head = 0;
        this.tail = 0;

        this.data = new Array(12);
        this.data_length = 12;

        this.elements = 0;



    }

    push_back(value)
    {
        if( (this.tail + 1) % this.data.length === this.head)
        {
            this.resize();
        }


        this.data[this.tail] = value;
        this.data_length++;
        this.tail = (this.tail + 1) % this.data_length;
        
        this.elements++;
    }



    pop_front()
    {

        if(this.head === this.tail)
        {
            
            return null;
        }

        let value = this.data[this.head];
        this.head = (this.head + 1) % this.data.length;

        this.elements--;
        return value;

    }

    pop_back()
    {
        if(this.head === this.tail)
        {
            return null;
        }

        this.tail = (this.tail - 1) % this.data.length;
        return this.data[this.tail];
    }


    empty()
    {
        return (this.head === this.tail) || (this.elements == 0);
    }

    resize()
    {
        let new_data = new Array(this.data.length * 2);

        for(let i = 0; i < this.data.length; i++)
        {
            new_data[i] = this.data[ (this.head + i) % this.data.length ];
        }

        this.head = 0;
        this.tail = this.data.length-1;
        this.data_length = this.data.length * 2;
        this.data = new_data;
    

    }




};

// let Q = new Dequeue();

// let n = 200;

// for( let i = 0; i < n; i ++)
// {
//     Q.push_back(i);

// }
// for( let i = 0; i < n; i ++)
// {
//     console.log(Q.pop_back())
// }


export {Dequeue};