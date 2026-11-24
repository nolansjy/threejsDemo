import * as THREE from 'three';

import TWEEN from 'three/addons/libs/tween.module.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

import { loadSheetData } from './api/sheet.js';

let camera, scene, renderer;
let controls;

const objects = [];
const targets = { table: [], sphere: [], helix: [], grid: [] };


const data = await loadSheetData();
const table = data.table;

init();
animate();


function init() {

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 3000;

    scene = new THREE.Scene();

    // table
    
    table.forEach((row, index) =>{
        const netWorth = Number(String(row['Net Worth']).replace(/\$|,|\.\d{2}/gm,''));

        let color = '';
        if(netWorth < 100000){
            color = 'rgba(239,48,34,0.4)';
        }else if(netWorth > 100000 && netWorth < 200000){
            color = 'rgba(253,202,53,0.4)';
        }else{
            color = 'rgba(58,159,72,0.4)';
        }

        const employee = document.createElement('div');
        employee.className = 'employee';
        employee.style.backgroundColor = color;

        const details = document.createElement('div');
        details.className = 'details';
        details.innerHTML = '<span>' + row.Country + '</span>' + '<span>' + row.Age + '</span>';
        employee.appendChild(details);

        const photo = document.createElement('div');
        photo.className = 'photo';
        const photoImg = document.createElement('img');
        photoImg.src = row.Photo;
        photoImg.alt = row.Name;
        photoImg.loading = 'lazy';
        photo.appendChild(photoImg);
        employee.appendChild(photo);

        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = row.Name;
        employee.appendChild(name);

        const interest = document.createElement('div');
        interest.className = 'interest';
        interest.textContent = row.Interest;
        employee.appendChild(interest);

        const objectCSS = new CSS3DObject( employee );
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;
        scene.add( objectCSS );

        objects.push( objectCSS );

        // 

        const colIndex = (index % 20) + 1;
        const rowIndex = Math.floor(index / 20) + 1;

        const object = new THREE.Object3D();
        object.position.x = ( colIndex * 140 ) - 1400;
        object.position.y = - ( rowIndex * 180 ) + 1000;

        targets.table.push( object );

    });


    // sphere

    const vector = new THREE.Vector3();

    for ( let i = 0, l = objects.length; i < l; i ++ ) {

        const phi = Math.acos( - 1 + ( 2 * i ) / l );
        const theta = Math.sqrt( l * Math.PI ) * phi;

        const object = new THREE.Object3D();

        object.position.setFromSphericalCoords( 800, phi, theta );

        vector.copy( object.position ).multiplyScalar( 2 );

        object.lookAt( vector );

        targets.sphere.push( object );

    }

    // helix

    for ( let i = 0, l = objects.length; i < l; i ++ ) {

        const strand = i % 2; // split into even/odd strands
        const step = Math.floor(i/2);

        const theta = step * 0.175 + strand * Math.PI;
        const y = - (step * 32) + 450; 

        const object = new THREE.Object3D();

        object.position.setFromCylindricalCoords( 900, theta, y );

        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;

        object.lookAt( vector );

        targets.helix.push( object );

    }

    // grid

    for ( let i = 0; i < objects.length; i ++ ) {

        const object = new THREE.Object3D();

        object.position.x = ( ( i % 5 ) * 400 ) - 800;
        object.position.y = ( - ( Math.floor( i / 5 ) % 4 ) * 400 ) + 600;
        object.position.z = ( Math.floor( i / 20 ) ) * 1000 - 4500;

        targets.grid.push( object );

    }

    //

    renderer = new CSS3DRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById( 'container' ).appendChild( renderer.domElement );

    //

    controls = new TrackballControls( camera, renderer.domElement );
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener( 'change', render );

    const buttonTable = document.getElementById( 'table' );
    buttonTable.addEventListener( 'click', function () {

        transform( targets.table, 2000 );

    } );

    const buttonSphere = document.getElementById( 'sphere' );
    buttonSphere.addEventListener( 'click', function () {

        transform( targets.sphere, 2000 );

    } );

    const buttonHelix = document.getElementById( 'helix' );
    buttonHelix.addEventListener( 'click', function () {

        transform( targets.helix, 2000 );

    } );

    const buttonGrid = document.getElementById( 'grid' );
    buttonGrid.addEventListener( 'click', function () {

        transform( targets.grid, 2000 );

    } );

    transform( targets.table, 2000 );

    //

    window.addEventListener( 'resize', onWindowResize );

}

function transform( targets, duration ) {

    TWEEN.removeAll();

    for ( let i = 0; i < objects.length; i ++ ) {

        const object = objects[ i ];
        const target = targets[ i ];

        new TWEEN.Tween( object.position )
            .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        new TWEEN.Tween( object.rotation )
            .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

    }

    new TWEEN.Tween( this )
        .to( {}, duration * 2 )
        .onUpdate( render )
        .start();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

function animate() {

    requestAnimationFrame( animate );

    TWEEN.update();

    controls.update();

}

function render() {

    renderer.render( scene, camera );

}