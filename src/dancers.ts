import * as THREE from 'three';
import { InstancedFlow } from 'three/addons/modifiers/CurveModifier.js';

export function placeDancersiOld(scene: THREE.Scene, curves: { curve: THREE.Curve<THREE.Vector3> }[], flow: InstancedFlow ) {
	const material = new THREE.MeshStandardMaterial( {
		color: 0x99ffff
	} );

	const numberOfInstances = 8;
    const geometry = new THREE.ConeGeometry( 0.2, 0.5, 8 ).rotateZ(-Math.PI/2); 
    // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
	// flow = new InstancedFlow( numberOfInstances, curves.length, geometry, material );
	flow = new InstancedFlow( numberOfInstances, curves.length, geometry, material );

	curves.forEach( function ( { curve }, i ) {
		flow.updateCurve( i, curve );
		scene.add( flow.object3D );
	} );

	for ( let i = 0; i < numberOfInstances; i ++ ) {
		const curveIndex = i % curves.length;
		flow.setCurve( i, curveIndex );
		flow.moveIndividualAlongCurve( i, i * 1 / numberOfInstances );
		flow.object3D.setColorAt( i, new THREE.Color( 0xffffff * Math.random() ) );
	}
}

export function placeDancers(scene: THREE.Scene, curves: { curve: THREE.Curve<THREE.Vector3>; }[], flow: InstancedFlow): void {
					const material = new THREE.MeshStandardMaterial( {
						color: 0x99ffff
					} );

					const numberOfInstances = 8;
                    // const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
                    const geometry = new THREE.ConeGeometry( 0.2, 0.5, 8 ).rotateZ(-Math.PI/2); 
                    // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
					// flow = new InstancedFlow( numberOfInstances, curves.length, geometry, material );
					flow = new InstancedFlow( numberOfInstances, curves.length, geometry, material );

					curves.forEach( function ( { curve }, i ) {
						flow.updateCurve( i, curve );
						scene.add( flow.object3D );
					} );

					for ( let i = 0; i < numberOfInstances; i ++ ) {

						const curveIndex = i % curves.length;
						flow.setCurve( i, curveIndex );
						flow.moveIndividualAlongCurve( i, i * 1 / numberOfInstances );
						flow.object3D.setColorAt( i, new THREE.Color( 0xffffff * Math.random() ) );

					}
}