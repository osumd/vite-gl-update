import * as THREE from 'three';
import { attribute } from 'three/examples/jsm/nodes/Nodes.js';

export default class LamesTheorem
{

    constructor(scene_context)
    {
        // Store the scene context
        this.scene_context = scene_context;
        // Store the last camera rotation, etc
        this.last_camera = [0,0,0];
    }

    euclidean_algorithm(a,b)
    {
        
        if ( a == 0 )
        {
            return b;
        }
        if ( b == 0 )
        {
            
            return a;
        }

        if ( a > b )
        {
            let r = a % b;
            
            return this.euclidean_algorithm(b, r);
        }
        if ( b > a )
        {
            let r = b % a;
            
            return this.euclidean_algorithm(a, r);
        }

        
         

    }

    euclidean_divisions(a,b,n)
    {
        
        if ( a == 0 )
        {
            return n;
        }
        if ( b == 0 )
        {
            
            return n;
        }

        if ( a > b )
        {
            let r = a % b;
            
            return this.euclidean_divisions(b, r, n+1);
        }
        if ( b > a )
        {
            let r = b % a;
            
            return this.euclidean_divisions(a, r, n+1);
        }

        
         

    }

    bezouts_identity(a,b)
    {
        let s0 = 1;
        let s1 = 0;

        let t0 = 0;
        let t1 = 1;

        let q0 = 0;

        let x = a , y = b;
        if ( b > a )
        {   
            x = b;
            y = a;
        }
        
        while ( y != 0 )
        {
            q0 = Math.floor(x / y);
            
            let sj = s0 - (q0*s1);
            let tj = t0 - (q0*t1);

            

            s0 = s1;
            t0 = t1;
            s1 = sj;
            t1 = tj;

            let r = x % y;

            x = y;
            y = r;

        }

        return [s0,t0];
        


    }

    fibonacci(n)
    {

        
        if ( n == 0 )
        {
            return 0;
        }
        if ( n == 1 )
        {
            return 1;
        }

        //this.scene_context.eventSystem.add_event({object: this.scene_context.camera, duration: 1}, {attribute:"position", to: new THREE.Vector3(n,n,n)})
        //this.scene_context.instanceMachine.add_xy_sphere(new THREE.Vector3(n,l,n), 0.1);
        let fib_1 = this.fibonacci(n-1);
        //this.scene_context.instanceMachine.add_xy_sphere(new THREE.Vector3(Math.cos(fib_1),0,0), 0.1);
        let fib_2 = this.fibonacci(n-2);

        //this.scene_context.instanceMachine.add_xy_sphere(new THREE.Vector3( (fib_1+fib_2)*Math.cos(fib_2/10)/10, 0,(fib_1+fib_2)*Math.sin(fib_2/10)/5), 0.1);
        //this.scene_context.instanceMachine.add_xy_sphere(new THREE.Vector3( (fib_1+fib_2)*Math.sin(fib_2/10)/10, 0,(fib_1+fib_2)*Math.cos(fib_2/10)/5), 0.1);
        //this.scene_context.instanceMachine.add_xy_sphere(new THREE.Vector3( (fib_1+fib_2)*Math.sin(fib_2/10), 0,(fib_1+fib_2)*Math.cos(fib_2/10)), 0.1);

        return fib_1+fib_2;
        
    }

    play()
    {

        

    }

}