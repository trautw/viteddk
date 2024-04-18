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
const myUrl = "/dance/mairieswedding.yaml";

const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
const boxMaterial = new THREE.MeshBasicMaterial();

export async function loadDance(scene: THREE.Scene, 
                          curveHandles: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>[] | undefined,
                          ): Promise<any> {
let result: {curves: {curve: THREE.Curve<THREE.Vector3>}[], dance: any} = {curves: [], dance: undefined};
await readYamlFromUrl(myUrl)
  .then((dance) => {
    // console.log("Parsed YAML data:", dance);
    result.dance = dance;
    return dance.person.map( function(person: { name: any; formations: { path: { points: { x: number; y: number; }[]; }; }[]; }) {
      let curveVertices: THREE.Vector3[] = [];
      person.formations.forEach((formation) => {
        console.log('formation = ',formation);
			  curveVertices = curveVertices.concat(
          formation.path.points.map( function ( handlePos: { x: number ; y: number ; } ) {
    			  const handle = new THREE.Mesh( boxGeometry, boxMaterial );
			      handle.position.copy( new THREE.Vector3(handlePos.x,0,handlePos.y) );
			      curveHandles!.push( handle );
			      scene!.add( handle );
            console.log('handle = ',handle);
			      return handle.position;
			    }) 
        );
        console.log('curveVertices = ',curveVertices);
      });

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
    placeDancers(scene, mycurves);
    return mycurves;
  }).catch((error) => {
    console.error("Error reading YAML:", error);
  });
  return result;
}
