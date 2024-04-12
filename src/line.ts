import * as THREE from 'three';

export function getCurves(scene: { add: (arg0: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | THREE.LineLoop<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>) => void; } | undefined, curveHandles: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>[] | undefined) {
    const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
	const boxMaterial = new THREE.MeshBasicMaterial();
    return [[
					{ x:   100, y: 0, z: - 100 },
					{ x:   100, y: 50, z: 100},
					{ x: - 100, y: 0, z: 100 },
					{ x: - 100, y: 0, z: - 100 },
				],
				[
					{ x: 200, y: 0, z: - 100 },
					{ x: 200, y: 0, z: 100 },
					{ x: 400, y: 0, z: 100 },
					{ x: 400, y: 0, z: - 100 },
				]].map( function ( curvePoints ) {

					const curveVertices = curvePoints.map( function ( handlePos ) {

						const handle = new THREE.Mesh( boxGeometry, boxMaterial );
						handle.position.copy( new THREE.Vector3(handlePos.x,handlePos.y,handlePos.z) );
						curveHandles!.push( handle );
						scene!.add( handle );
						return handle.position;

					} );

					const curve = new THREE.CatmullRomCurve3( curveVertices );
					curve.curveType = 'centripetal';
					curve.closed = true;

					const points = curve.getPoints( 50 );
					const line = new THREE.LineLoop(
						new THREE.BufferGeometry().setFromPoints( points ),
						new THREE.LineBasicMaterial( { color: 0x00ff00 } )
					);

					scene!.add( line );

					return {
						curve,
						line
					};

				} );


};