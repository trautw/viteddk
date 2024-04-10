import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { InstancedFlow } from 'three/addons/modifiers/CurveModifier.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { getCurves, getLine } from './line';
import { placeDancers } from './dancers';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const ACTION_SELECT = 1, ACTION_NONE = 0;
const curveHandles: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>[] = [];
const mouse = new THREE.Vector2();

let settings;

let stats: Stats;
let scene: THREE.Scene,
	camera: THREE.PerspectiveCamera,
	renderer: THREE.WebGLRenderer,
	rayCaster: THREE.Raycaster,
	control: TransformControls,
	flow: InstancedFlow,
	action = ACTION_NONE;

init();
animate();

function init() {
	scene = new THREE.Scene();

	const light = new THREE.DirectionalLight( 0xffaa33, 3 );
	light.position.set( - 10, 10, 10 );
	scene.add( light );

	const light2 = new THREE.AmbientLight( 0x003973, 3 );
	scene.add( light2 );

	camera = new THREE.PerspectiveCamera(
		40,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);
	camera.position.set( 2, 2, 4 );
	camera.lookAt( scene.position );

    const curves = getCurves(scene,curveHandles);

	const material = new THREE.MeshStandardMaterial( {
		color: 0x99ffff
	} );

	const numberOfInstances = 8;
    const geometry = new THREE.ConeGeometry( 0.2, 0.5, 8 ).rotateZ(-Math.PI/2); 
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

	// placeDancers(scene, curves, flow);

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    renderer.domElement.addEventListener( 'pointerdown', onPointerDown );

    rayCaster = new THREE.Raycaster();
    control = new TransformControls( camera, renderer.domElement );
    control.addEventListener( 'dragging-changed', function ( event ) {

    if ( ! event.value ) {
	    curves.forEach( function ( { curve, line }, i ) {
		    const points = curve.getPoints( 50 );
		    line.geometry.setFromPoints( points );
		    flow.updateCurve( i, curve );
	    } );
    }

    } );

    createPanel();

	stats = new Stats();
	document.body.appendChild( stats.dom );

	window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onPointerDown( event: { clientX: number; clientY: number; } ) {
	action = ACTION_SELECT;
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function animate() {
	requestAnimationFrame( animate );
	if ( action === ACTION_SELECT ) {
		rayCaster.setFromCamera( mouse, camera );
		action = ACTION_NONE;
		const intersects = rayCaster.intersectObjects( curveHandles, false );
		if ( intersects.length ) {
			const target = intersects[ 0 ].object;
			control.attach( target );
			scene.add( control );
		}
	}
	if ( flow ) {
		flow.moveAlongCurve( 0.001 );
	}
	render();
}

function render() {
	renderer.render( scene, camera );
	stats.update();
}


			/*******************
			var gif_container, gif_status: HTMLElement, gif_progress: HTMLInputElement, gif_download: HTMLAnchorElement;
			var gif: { render: () => void; on: (arg0: string, arg1: { (p: any): void; (blob: any): void; }) => void; } | null, gif_processing = false;

			function makeGif() {
				gif_container = document.getElementById('gif_container')!;
				gif_status = document.getElementById('gif_status')!;
				gif_progress = <>document.getElementById('gif_progress')!;
				gif_download = <HTMLAnchorElement>document.getElementById('gif_download')!;

				var gl = renderer.context;

				renderer.context.getImageData = (a, b, c, d) => {
					const gl_w = gl.drawingBufferWidth, gl_h = gl.drawingBufferHeight;
					const pixels = new Uint8Array(gl_w * gl_h * 4);
					renderer.context.readPixels(a, b, c, d, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

					var imageData = new ImageData(Uint8ClampedArray.from(pixels), gl_w, gl_h);

					const img_w = imageData.width, img_h = imageData.height;
					const data = imageData.data;

					Array.from({ length: img_h },
						(val, i) => data.slice(i * img_w * 4, (i + 1) * img_w * 4))
							.forEach((val, i) => data.set(val, (img_h - i - 1) * img_w * 4));

					return imageData;
				}

				console.log('MakeGif');

				if (gif) {
					if (!gif_processing) {
						gif.render();
						gif_processing = true;
						gif_status.textContent = 'Gif rendering ...';

						gif.on('progress', p => {
							const percent = Math.round(p * 100);

							console.log(percent + '%');
							gif_progress.value = percent.toString();
						});

						gif.on('finished', blob => {
							gif_processing = false;
							gif = null;
							gif_download!.style.display = 'block';
							gif_status.textContent = 'Gif render complete';
							gif_download!.href = URL.createObjectURL(blob);
						});
					}
					else {
						window.alert('gif rendering in progress');
					}

					return;
				}

				gif_container.style.display = 'block';
				gif_download.style.display = 'none';
				gif_progress.innerText
				gif_progress.value = 0;
				gif_status.textContent = 'Gif capturing ...';

				const workers = navigator.hardwareConcurrency || 2;

				console.log('gif rendering with', workers, 'web workers');

				gif = new GIF({
					workers: workers,
					quality: 5,
					width: gl.drawingBufferWidth,
					height: gl.drawingBufferHeight,
					workerScript: 'gif/gif.worker.js'
				});
			}
			 **********/





function createPanel() {
	const panel = new GUI( { width: 310 } );

	const folder1 = panel.addFolder( 'Visibility' );
	const folder2 = panel.addFolder( 'Activation/Deactivation' );
	const folder3 = panel.addFolder( 'Pausing/Stepping' );
	const folder4 = panel.addFolder( 'Crossfading' );
	const folder5 = panel.addFolder( 'Blend Weights' );
	const folder6 = panel.addFolder( 'General Speed' );

	settings = {
		'show model': true,
		'show skeleton': false,
		// 'deactivate all': deactivateAllActions,
		// 'activate all': activateAllActions,
		// 'pause/continue': pauseContinue,
		// 'make single step': toSingleStepMode,
		'modify step size': 0.05,
		'from walk to idle': function () {
			// prepareCrossFade( walkAction, idleAction, 1.0 );
		},
		'from idle to walk': function () {
			// prepareCrossFade( idleAction, walkAction, 0.5 );
		},
		'from walk to run': function () {
			// prepareCrossFade( walkAction, runAction, 2.5 );
		},
		'from run to walk': function () {
			// prepareCrossFade( runAction, walkAction, 5.0 );
		},
		'use default duration': true,
		'set custom duration': 3.5,
		'modify idle weight': 0.0,
		'modify walk weight': 1.0,
		'modify run weight': 0.0,
		'modify time scale': 1.0
	};

	// folder1.add( settings, 'show model' ).onChange( showModel );
	// folder1.add( settings, 'show skeleton' ).onChange( showSkeleton );
	// folder2.add( settings, 'deactivate all' );
	// folder2.add( settings, 'activate all' );
	// folder3.add( settings, 'pause/continue' );
	// folder3.add( settings, 'make single step' );
	folder3.add( settings, 'modify step size', 0.01, 0.1, 0.001 );
	// crossFadeControls.push( folder4.add( settings, 'from walk to idle' ) );
	// crossFadeControls.push( folder4.add( settings, 'from idle to walk' ) );
	// crossFadeControls.push( folder4.add( settings, 'from walk to run' ) );
	// crossFadeControls.push( folder4.add( settings, 'from run to walk' ) );
	folder4.add( settings, 'use default duration' );
	folder4.add( settings, 'set custom duration', 0, 10, 0.01 );
	folder5.add( settings, 'modify idle weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

	// setWeight( idleAction, weight );

	} );
	folder5.add( settings, 'modify walk weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
		// setWeight( walkAction, weight );
	} );
	folder5.add( settings, 'modify run weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
		// setWeight( runAction, weight );
	} );
	// folder6.add( settings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( modifyTimeScale );

	folder1.open();
	folder2.open();
	folder3.open();
	folder4.open();
	folder5.open();
	folder6.open();

}

