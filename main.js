import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI({width: 300})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Generate galaxy
 */

const parameters = {}
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'

let geometry = null
let points = null
let material = null

function genereateGalaxy(){
  if (points !== null){
    geometry.dispose()
    material.dispose()
    scene.remove(points)
  }

  geometry = new THREE.BufferGeometry()
  const position = new Float32Array( parameters.count * 3 )
  const color = new Float32Array( parameters.count * 3 )

  const colorInside = new THREE.Color(parameters.insideColor)
  const colorOutside = new THREE.Color(parameters.outsideColor)

  for( let i = 0; i < parameters.count * 3; i++){

    const radius = Math.random() * parameters.radius 
    const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
    const i3 = i * 3
    const randomnessX = Math.pow( Math.random(), parameters.randomnessPower) *( Math.random() < 0.5?  -1 : 1)  // <- if the parthesisis are removed you get strange result
    const randomnessY = Math.pow( Math.random(), parameters.randomnessPower) * (Math.random() < 0.5?  -1 : 1 )
    const randomnessZ =Math.pow( Math.random(), parameters.randomnessPower) * (Math.random() < 0.5?  -1 : 1 ) 
    position[i3] = (Math.cos(branchAngle + (parameters.spin * radius)) * radius) + randomnessX
    position[i3 + 1] = randomnessY
    position[i3 + 2] = Math.sin(branchAngle + (parameters.spin * radius)) * radius + randomnessZ

    const mixedColor = colorInside.clone()
    mixedColor.lerp( colorOutside, radius/parameters.radius)
    color[i3] = mixedColor.r
    color[i3 + 1] = mixedColor.g
    color[i3 + 2]  = mixedColor.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(color, 3))

  material = new THREE.PointsMaterial()
  material.size = parameters.size
  material.sizeAttenuation = true
  material.depthWrite = false
  material.blending = THREE.AdditiveBlending
  material.vertexColors = true

  points = new THREE.Points( geometry, material )
  scene.add(points)
  
}

genereateGalaxy()


gui.add(parameters, 'count').min(100).max(1000000).step(1).onFinishChange(genereateGalaxy)
gui.add(parameters, 'size').min(0).max(0.5).step(0.001).onFinishChange(genereateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(genereateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(genereateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.01).onFinishChange(genereateGalaxy)
gui.add(parameters, 'randomness').min(0).max(10).step(0.001).onFinishChange(genereateGalaxy)
gui.add(parameters, 'randomnessPower').min(0).max(10).step(0.001).onFinishChange(genereateGalaxy)
gui.addColor(parameters, 'insideColor')
gui.addColor(parameters, 'outsideColor')



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// renderer.setPixelRatio(5)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()