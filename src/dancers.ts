import * as THREE from 'three';
import { InstancedFlow } from 'three/addons/modifiers/CurveModifier.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';


function getArrow(): THREE.Mesh {
  const material = new THREE.MeshNormalMaterial({color: 0x99ffff});
  const coneGeom = new THREE.ConeGeometry(10, 20, 10).rotateZ(-Math.PI/2);
  coneGeom.translate(25, 0, 0);
  
  const cylinderGeom = new THREE.CylinderGeometry(4, 6, 30, 10).rotateZ(-Math.PI/2);
  // cylinder.scale(0.5, 0.5, 0.5);

  const geometry=BufferGeometryUtils.mergeGeometries([coneGeom, cylinderGeom]);
  const arrowMesh = new THREE.Mesh(geometry, material);
  return arrowMesh;
}

export function placeDancers(scene: THREE.Scene, curves: { curve: THREE.Curve<THREE.Vector3>; }[] ): InstancedFlow {
					const arrow = getArrow();
					const numberOfInstances = 8;

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