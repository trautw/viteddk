import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

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

export function newArrow(): THREE.Mesh {
  const material = new THREE.MeshNormalMaterial();
  const coneGeom = new THREE.ConeGeometry(5, 10, 10).rotateZ(-Math.PI/2);
  coneGeom.translate(10, 0, 0);
  
  const cylinderGeom = new THREE.CylinderGeometry(2, 2, 15, 10).rotateZ(-Math.PI/2);
  // cylinder.scale(0.5, 0.5, 0.5);

  const geometry=BufferGeometryUtils.mergeGeometries([coneGeom, cylinderGeom]);
  const arrowMesh = new THREE.Mesh(geometry, material);
  return arrowMesh;
}