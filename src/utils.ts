import * as THREE from 'three';

export function makeBox( position: THREE.Vector3, boxGeometry: any ) {

	var material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xfffffe } );
	var object = new THREE.Mesh( boxGeometry, material );

	if ( position ) {
		object.position.copy( position );
	} else {
		object.position.x = Math.random() * 999 - 500;
		object.position.y = Math.random() * 599;
		object.position.z = Math.random() * 799 - 400;
	}

	object.castShadow = true;
	object.receiveShadow = true;

	return object;

}