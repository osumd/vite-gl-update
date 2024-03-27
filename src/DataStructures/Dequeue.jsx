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


        this.events = [];

    }

    push_front(value)
    {
        if((this.tail + 1) % this.data.length === this.head)
        {
            this.resize();
        }

        this.events.push("push_front before " + " data: " + this.data + " head: " + this.head + " tail: " + this.tail);


        this.data[this.tail] = value;
        this.data_length++;
        this.tail = (this.tail + 1) % this.data_length;
        
        this.events.push("push_front after " + "data: " + this.data + " head: " + this.head + " tail: " + this.tail);
        this.events.push(" ");

        this.elements++;
    }

    pop_front()
    {

        if(this.head === this.tail)
        {
            this.events.push("null pop_front ");
            return null;
        }

        this.events.push("pop_front before " + "data:\\br" + this.data + "head: " + this.head + "tail: " + this.tail);

        let value = this.data[this.head];
        this.head = (this.head + 1) % this.data.length;

        this.events.push("pop_front after " + "data:\\br" + this.data + "head: " + this.head + "tail: " + this.tail);

        this.events.push(" ");
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
            new_data[i] = this.data[(this.head + i) % this.data.length];
        }

        this.head = 0;
        this.tail = this.data.length;
        this.data_length = this.data.length * 2;
        this.data = new_data;
    

    }

    render()
    {
        return <div>
            {this.events.map((event, index) => (
                        <li key={index}>{event}</li>
            ))}

        </div>
    }


};

export {Dequeue};