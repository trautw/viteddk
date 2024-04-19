import * as THREE from 'three';
import { InstancedFlow } from 'three/addons/modifiers/CurveModifier.js';
import { newArrow } from './utils';


export function placeDancers(scene: THREE.Scene, curves: { curve: THREE.Curve<THREE.Vector3>; }[] ): InstancedFlow {
  const arrow = newArrow();
  const numberOfInstances = 8;

  console.log('dancers curves = ',curves);

  const flow = new InstancedFlow( numberOfInstances, curves.length, arrow.geometry,<THREE.Material>arrow.material );

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
  return flow;
}