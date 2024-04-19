import axios from 'axios';
import * as THREE from 'three';

async function fetchYamlData(url: string): Promise<any> {
  const response = await axios.get(url);
  return response.data;
}

import * as yaml from 'yaml';
import { placeDancers } from './dancers';
import { newArrow } from './utils';

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

const boxGeometry = new THREE.BoxGeometry( 10, 10, 10 );
const boxMaterial = new THREE.MeshBasicMaterial();

export async function loadDance(scene: THREE.Scene, 
                          curveHandles: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>[] | undefined,
                          ): Promise<any> {
let result: {curves: {curve: THREE.Curve<THREE.Vector3>}[], dance: any} = {curves: [], dance: undefined};
await readYamlFromUrl(myUrl)
  .then((dance) => {
    // console.log("Parsed YAML data:", dance);
    result.dance = dance;
    return dance.person.map( function(person: { name: string; formations: { path: { points: { x: number; y: number; }[]; }; }[]; }) {
      console.log('Person = ',person.name);
      let curveVertices: THREE.Vector3[] = [];
      const position: { t: number; v: THREE.Vector3}[] = [];
      person.formations.forEach((formation) => {
        console.log('formation = ',formation);
			  curveVertices = curveVertices.concat(
          formation.path.points.map( function ( handlePos: { t: number; x: number ; y: number ; } ) {
            // const arrow = newArrow();
    			  // const handle = new THREE.Mesh( arrow.geometry, arrow.material );
    			  const handle = new THREE.Mesh( boxGeometry, boxMaterial );
			      const p = new THREE.Vector3(handlePos.x,0,handlePos.y);
            position.push({t: handlePos.t, v: p} );
			      handle.position.copy(p);
			      curveHandles!.push( handle );
			      scene!.add( handle );
			      return handle.position;
			    }) 
        );
      });

			const curve = new THREE.CatmullRomCurve3( curveVertices );
			curve.curveType = 'centripetal';
			curve.closed = true;

      /*
      curveVertices.forEach((_element,i) => {
        const tangent = curve.getTangentAt(i/curveVertices.length);
        const euler = new THREE.Euler(tangent.x,tangent.y,tangent.z);
        curveHandles![i].setRotationFromEuler(euler);
      });
      */

			const points = curve.getPoints( 50 );
			const line = new THREE.LineLoop(
				new THREE.BufferGeometry().setFromPoints( points ),
				new THREE.LineBasicMaterial( { color: 0x00ff00 } )
			);

      const MicroBeatsPerBeat = 4;
      const Beats = 16;
      const fineVertices: THREE.Vector3[] = [position[0].v];

      let beat = -1;
      let currentPosId = 0;
      for (let microbeat = 0; microbeat < Beats * MicroBeatsPerBeat; microbeat++) {
        if (microbeat > beat*MicroBeatsPerBeat) {
          // use next position
          currentPosId++;
          beat = position[currentPosId]?.t;
          // fineVertices.push(position[currentPosId]?.v);
        }
        console.log('Processing microbeat = ',microbeat,', beat = ',beat);
        fineVertices.push(curve.getPoint(microbeat/(Beats*MicroBeatsPerBeat)));
      }
			const finecurve = new THREE.CatmullRomCurve3( fineVertices );
			finecurve.curveType = 'centripetal';
			finecurve.closed = true;

			const finepoints = curve.getPoints( 50 );
			const fineline = new THREE.LineLoop(
				new THREE.BufferGeometry().setFromPoints( finepoints ),
				new THREE.LineBasicMaterial( { color: 0x0000ff } )
			);

			scene!.add( line );
			scene!.add( fineline );

      console.log('curve = ',curve);
      console.log('finecurve = ',finecurve);
			return {
				curve: finecurve,
				line: fineline
			};
    });
  }).then((mycurves: { curve: THREE.Curve<THREE.Vector3>; }[]) => {
    result.curves = mycurves;
    console.log('mycurves = ',mycurves);
    placeDancers(scene, mycurves);
    return mycurves;
  }).catch((error) => {
    console.error("Error reading YAML:", error);
  });
  return result;
}
