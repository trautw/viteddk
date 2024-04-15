import axios from 'axios';
import * as THREE from 'three';

async function fetchYamlData(url: string): Promise<any> {
  const response = await axios.get(url);
  return response.data;
}

import * as yaml from 'yaml';
import { placeDancers } from './dancers';

async function parseYaml(data: string): Promise<any> {
  try {
    return await yaml.parse(data);
  } catch (error) {
    console.error("Error parsing YAML:", error);
    throw error;
  }
}

async function readYamlFromUrl(url: string): Promise<any> {
  const data = await fetchYamlData(url);
  const parsedData = await parseYaml(data);
  return parsedData;
}

// Example usage
// const myUrl = "https://example.com/config.yaml";
const myUrl = "/dance/marieswedding.yaml";

    const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
	const boxMaterial = new THREE.MeshBasicMaterial();

export async function loadDance(scene: THREE.Scene, 
                          curveHandles: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>[] | undefined,
                          ): Promise<any> {
let result: {curves: {curve: THREE.Curve<THREE.Vector3>}[], dance: any} = {curves: [], dance: undefined};
await readYamlFromUrl(myUrl)
  .then((dance) => {
    console.log("Parsed YAML data:", dance);
    result.dance = dance;
    return dance.person.map( function(person: { name: string; path: { points: { x: number; z: number; }[]; } }) {
      console.log(person.name);
					const curveVertices = person.path.points.map( function ( handlePos: { x: number ; z: number ; } ) {

						const handle = new THREE.Mesh( boxGeometry, boxMaterial );
						handle.position.copy( new THREE.Vector3(handlePos.x,0,handlePos.z) );
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

    });
  }).then((mycurves: { curve: THREE.Curve<THREE.Vector3>; }[]) => {
    result.curves = mycurves;
    const flow = placeDancers(scene, mycurves);
    console.log(flow);
    return mycurves;
  }).catch((error) => {
    console.error("Error reading YAML:", error);
  });
  console.log('Ende od dance');
  return result;
}
