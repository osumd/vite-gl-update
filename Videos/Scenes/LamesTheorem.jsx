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


    get_camera_far_plane()
    {
        // Get the forward vector
        // Get the rotation of the camera
        let camera_rotation = this.scene_context.camera.quaternion.clone();
        let camera_forward  = new THREE.Vector3(0,0,-1).applyQuaternion(camera_rotation).normalize();

        this.last_camera[0] = camera_forward;
        this.last_camera[1] = camera_rotation;

        let camera_up = this.scene_context.camera.up;
        let camera_right = camera_forward.clone().cross(camera_up).normalize();

        let camera_fov = this.scene_context.camera.fov;
        let camera_far = this.scene_context.camera.far;

        let camera_far_half_distance = 10*Math.tan(((camera_fov)*(3.14159265359/180))/2);
        let camera_far_center = this.scene_context.camera.position.clone().add(camera_forward.clone().multiplyScalar(10));
        let camera_left_corner = camera_far_center.clone().sub(camera_right.multiplyScalar(camera_far_half_distance));
            
        //this.scene_context.instanceMachine.add_xy_sphere(camera_left_corner, Math.random());
        //this.scene_context.eventSystem.add_text({text: camera_far_half_distance.toString()});
        
        //console.log("omg animate");
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
        // I need a way to place text into specific portion of the view frustrum.
        //let gcd = this.euclidean_algorithm(252, 198);

        //let bezout = this.bezouts_identity(252,198);
        //console.log(Math.log10(198));
        //let a = 252;
        //let b = 198;
        //let alpha = (1+Math.sqrt(5))/2;
        //let n = this.euclidean_divisions(252, 198, 0);

        //console.log(this.fibonacci(10));
        //console.log(this.fibonacci(n+1) > Math.pow(alpha,n-1));
        //console.log(b > Math.pow(alpha, n-1));

        //console.log(Math.log10(b) > (n-1)*Math.log10(alpha));
        //console.log(Math.log10(b) > (n-1)/5);
        
        
        
        

    }

}