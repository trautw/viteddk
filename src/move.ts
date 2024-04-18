import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadDance } from './dance';

const curveHandles: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>[] = [];

let settings: any;

let stats: Stats;
let stats2: Stats;
let scene: THREE.Scene,
	camera: THREE.PerspectiveCamera,
	renderer: THREE.WebGLRenderer,
	clock: THREE.Clock;

let dance: any;	
let danceLoaded = false;
let currentFormation = 0;

const labels = document.querySelectorAll<HTMLDivElement>('.label')
const infos = document.createElement( 'div' );

init();
animate();

function init() {

    clock = new THREE.Clock();

    infos.id = 'infosId';
    infos.className = 'infosClass';
    infos.innerHTML = 'Infos';
    infos.style.display = 'block';
    infos.style.position = 'absolute';
    infos.style.top = '100px';
    infos.style.left = '100px';
    document.body.appendChild( infos );
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
	camera.position.set( 0, 500, 500 );
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
	  dance = result.dance;
	  dance.person.forEach( (person, i:number) => {
        const fbxLoader = new FBXLoader();
        fbxLoader.load( person.model_url, function ( fbx: THREE.Group<THREE.Object3DEventMap> ) {
		  person.curve = result.curves[i];
          person.model = SkeletonUtils.clone (fbx);
          person.mixer = new THREE.AnimationMixer( person.model );
          person.mixer.clipAction( person.model.animations[ 0 ] ).play();
          scene.add( person.model );
          danceLoaded = true;
		})
      });
	}).then( _result => {
      danceLoaded = true;
    });

    createPanel();

	stats = new Stats();
	document.body.appendChild( stats.dom );

	stats2 = new Stats();
    stats2.showPanel(2);
    stats2.dom.style.cssText = 'position:absolute;top:0px;left:80px;';
	document.body.appendChild( stats2.dom );

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
    const secondsPerRound = settings['seconds per round'];
	const now = clock.getElapsedTime()/secondsPerRound % 1;
	const later = (clock.getElapsedTime()/secondsPerRound + 0.01) % 1;

    if (currentFormation < 0) {incFormation()};

    if (dance) {
      dance.person.forEach( (person,i) => {
        if ('model' in person && 'position' in person.model) {
		  if ('curve' in person) {
	       const curcurve = person.curve.curve;
           const point = curcurve.getPointAt(now); 
           const targetpoint = curcurve.getPointAt(later);
		   person.model.position.copy(point);
		   person.model.lookAt(targetpoint);
           person.mixer.update( delta );
           if (person.formations[currentFormation].path.points.length == 1) {
             const mixer = <THREE.AnimationMixer>person.mixer;
             mixer.stopAllAction();
             if ('direction' in person.formations[currentFormation].path) {
               const direction = person.formations[currentFormation].path.direction;
               let currentpos = new THREE.Vector3();
               currentpos = person.model.position;
               let targetpoint = new THREE.Vector3();
               if (0 == direction) {
                 targetpoint = new THREE.Vector3(currentpos.x,0,currentpos.z+100);
               };
               if (180 == direction) {
                 targetpoint = new THREE.Vector3(currentpos.x,0,currentpos.z-100);
               };
               person.model.lookAt(targetpoint);
             }
           }
		  } // curve
          // Labels
          const position = person.model.position;
          // const x = ((1 + position.x) / 2) * window.innerWidth - 50
          // const y = ((1 - position.z) / 2) * window.innerHeight
          const x = position.x+200;
          const y = position.z+200;

          labels[i].style.left = x + 'px'
          labels[i].style.top = y + 'px'
          labels[i].style.display = 'block';
          // labels[i].style.display = data.labelsVisible ? 'block' : 'none'
          labels[i].textContent = person.name + ': ' + person.formations[currentFormation].name;

          // Info
          infos.textContent = ' Current Formation: '+currentFormation;
	    }
      })
	}

	render();
}

function render() {
	renderer.render( scene, camera );
	stats.update();
	stats2.update();
}

function restartDance() {
  currentFormation = 0;
}

function incFormation() {
  if (danceLoaded) {
    // currentFormation++;
    currentFormation = 1;
    // console.log('Next formation ',currentFormation)
  }
}

function createPanel() {
  const panel = new GUI( { width: 310 } );

  const folder1 = panel.addFolder( 'Visibility' );
  const folder2 = panel.addFolder( 'Activation/Deactivation' );
  const folder3 = panel.addFolder( 'Exports' );

  settings = {
	'restart': restartDance,
	'show model': true,
	'show skeleton': false,
	'modify step size': 0.05,
	'seconds per round': 4.0,
    'show camera position': showCameraPosition,
  };

  panel.add( settings, 'restart');

  folder1.add( settings, 'show model' ).onChange( showModel );

  folder2.add( settings, 'show skeleton' );
  folder2.add( settings, 'seconds per round', 1.0, 10.0, 4.0 );

  folder3.add( settings, 'show camera position' );

  folder1.open();
  folder2.open();
}

function showModel( visibility: boolean ) {
  // model.visible = visibility;
  dance.person.forEach((person: { model: { visible: boolean; }; }) => {
    person.model.visible = visibility;
  })
}

function showCameraPosition() {
    console.log('Camera position');
    console.log(camera.position);
}