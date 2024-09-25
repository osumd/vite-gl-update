import * as THREE from 'three';

export default class Material {

    constructor( ambient = new THREE.Vector3(0,0,0), diffuse = new THREE.Vector3(1,1,1), specular = new THREE.Vector3(0,0,0), shininess = 32)
    {

        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;

    }
};