import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadDance } from './dance';

const curveHandles: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>[] = [];

let settings;

let stats: Stats;
let scene: THREE.Scene,
	camera: THREE.PerspectiveCamera,
	renderer: THREE.WebGLRenderer,
	clock: THREE.Clock;

let dance: any;	
let curves: { curve: THREE.Curve<THREE.Vector3>; }[] = [];

init();
animate();

function init() {

    clock = new THREE.Clock();

    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );

	scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xa0a0a0 );
    scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set( 100, 200, 300 );
	camera.lookAt( scene.position );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 100, 0 );
    controls.update();

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 5 );
    hemiLight.position.set( 0, 200, 0 );
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff, 5 );
    dirLight.position.set( 0, 200, 100 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = - 100;
    dirLight.shadow.camera.left = - 120;
    dirLight.shadow.camera.right = 120;
    scene.add( dirLight );

	// ground
    const ground = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
	scene.add( ground );

    const grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add( grid );

    loadDance(scene, curveHandles).then((result) => {
	  curves = result.curves;
	  dance = result.dance;
	  console.log('currv = ',curves);
	  dance.person.forEach( (person, i:number) => {
        const fbxLoader = new FBXLoader();
        fbxLoader.load( person.model, function ( fbx: THREE.Group<THREE.Object3DEventMap> ) {
		  person.curve = result.curves[i];
          person.model = SkeletonUtils.clone (fbx);
          person.mixer = new THREE.AnimationMixer( person.model );
          person.mixer.clipAction( person.model.animations[ 0 ] ).play();
          scene.add( person.model );
		})
      });
	});

    // createPanel();

	stats = new Stats();
	document.body.appendChild( stats.dom );

	window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}


function animate()  {
	requestAnimationFrame( animate );

    const delta = clock.getDelta();
	const secondsPerRound = 20;
	const now = clock.getElapsedTime()/secondsPerRound % 1;
	const later = (clock.getElapsedTime()/secondsPerRound + 0.01) % 1;

	dance.person.forEach( person => {
	  console.log('Processing person ',person.name);
	  console.log('model = ',person.model);
      if (person.model.position) {
		 console.log('Person = ',person);
		 if (person.curve) {
	       const curcurve = person.curve.curve;
           const point = curcurve.getPointAt(now); // Ensure animation loops seamlessly
           const targetpoint = curcurve.getPointAt(later); // Ensure animation loops seamlessly
		   person.model.position.copy(point);
		   person.model.lookAt(targetpoint);
           person.mixer.update( delta );
		 }
	  };
	})

	render();
}

function render() {
	renderer.render( scene, camera );
	stats.update();
}



console.log('DONE');