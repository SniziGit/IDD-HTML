/**
 * OVERKILL Website - 3D Model Viewer
 * Handles Three.js 3D model functionality for product customization
 * Author: OVERKILL Development Team
 * Created: 2026
 */

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================

let scene, camera, renderer, model, controls;
let modelMesh = null;
let emissiveMaterial = null;
let baseMaterial = null;
let emissiveColorAnimation = null;
let currentModelPath = './assets/WraithRAMBlack.glb'; // Default to black model
let originalEmissiveMap = null; // Store original emissive map

// =============================================================================
// 3D MODEL VIEWER INITIALIZATION
// =============================================================================

/**
 * Initialize 3D model viewer
 */
function initialize3DModel() {
    const container = document.getElementById('modelViewer');
    if (!container) return;

    // Initialize scene
    scene = new THREE.Scene();
    scene.background = null; // Transparent background

    // Initialize camera
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 2);

    // Initialize renderer
    renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Initialize controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Disable zoom with scroll wheel
    controls.enablePan = false; // Disable panning with right mouse button
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    // Add lighting
    setupLighting();

    // Load the 3D model
    load3DModel();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

/**
 * Setup lighting for the 3D scene
 */
function setupLighting() {
    // Ambient light for overall illumination (reduced from 1.2 to 0.6)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Main directional light (reduced from 3 to 1.5)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Fill light (reduced from 1 to 0.5)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    // Rim light for edge definition (reduced from 0.5 to 0.2)
    const rimLight = new THREE.DirectionalLight(0xff3366, 0.2);
    rimLight.position.set(0, -5, -5);
    scene.add(rimLight);
}

/**
 * Load the 3D model
 * @param {string} modelPath - Path to the model file
 */
function load3DModel(modelPath = currentModelPath) {
    const loader = new THREE.GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    
    // Determine emissive map path based on model
    let emissiveMapPath;
    if (modelPath.includes('WraithRAMBlack.glb')) {
        emissiveMapPath = './assets/Emissive_Black.png';
    } else if (modelPath.includes('WraithRAMWhite.glb')) {
        emissiveMapPath = './assets/Emissive_White.png';
    } else {
        emissiveMapPath = null;
    }
    
    loader.load(
        modelPath,
        function (gltf) {
            // Remove existing model if there is one
            if (model) {
                scene.remove(model);
                // Reset material references
                modelMesh = null;
                emissiveMaterial = null;
                baseMaterial = null;
                originalEmissiveMap = null;
            }
            
            model = gltf.scene;
            
            // Center the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            
            // Scale the model appropriately
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim; // Scale to fit in view
            model.scale.multiplyScalar(scale);
            
            scene.add(model);
            
            // Find and store mesh materials
            findModelMaterials(model);
            
            // Load and apply emissive map if available
            if (emissiveMapPath && emissiveMaterial) {
                textureLoader.load(
                    emissiveMapPath,
                    function (texture) {
                        console.log('Loading emissive map for RGB lighting parts');
                        originalEmissiveMap = texture;
                        
                        // Apply emissive map ONLY to the emissive material
                        emissiveMaterial.emissiveMap = texture;
                        emissiveMaterial.emissive = new THREE.Color(0xffffff); // White to show map colors
                        emissiveMaterial.emissiveIntensity = 0.8; // Reduced brightness
                        emissiveMaterial.needsUpdate = true;
                        
                        console.log('Emissive map applied to RGB lighting material');
                    },
                    undefined,
                    function (error) {
                        console.error('Error loading emissive map:', error);
                    }
                );
            } else {
                console.log('No emissive map path or emissive material found');
            }
            
            // Restart infinite emissive color animation
            startEmissiveColorAnimation();
            
            console.log('3D model loaded successfully:', modelPath);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('Error loading 3D model:', error);
        }
    );
}

/**
 * Find and store references to model materials
 * @param {THREE.Object3D} object - 3D object to search
 */
function findModelMaterials(object) {
    console.log('Searching for materials in model...');
    emissiveMaterial = null;
    baseMaterial = null;
    originalEmissiveMap = null;

    object.traverse(function (child) {
        if (child.isMesh) {
            console.log('Found mesh:', child.name || 'unnamed');
            
            if (!modelMesh) {
                modelMesh = child;
            }
            
            // Handle both single materials and arrays of materials
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            
            materials.forEach(material => {
                if (!material) return;
                
                console.log('Material:', material.name || 'unnamed');
                console.log('- Has emissiveMap:', !!material.emissiveMap);
                console.log('- Has emissive:', !!material.emissive);
                console.log('- Emissive color:', material.emissive);
                
                // Look for material that has emissive properties (RGB lighting parts)
                if (material.emissiveMap || (material.emissive && material.emissive.getHex() !== 0x000000)) {
                    emissiveMaterial = material;
                    console.log('Found emissive material for RGB lighting');
                }
                // Look for base material (non-emissive parts)
                else if (material.color && !baseMaterial) {
                    baseMaterial = material;
                    console.log('Found base material');
                }
            });
        }
    });
    
    console.log('Final - emissiveMaterial:', !!emissiveMaterial, 'baseMaterial:', !!baseMaterial);
}

/**
 * Update emissive color of the model by modifying the emissive map texture
 * @param {string} color - Hex color value
 */
function updateEmissiveColor(color) {
    console.log('updateEmissiveColor called with:', color);
    console.log('emissiveMaterial:', emissiveMaterial);
    console.log('originalEmissiveMap:', originalEmissiveMap);
    
    if (emissiveMaterial) {
        if (originalEmissiveMap) {
            console.log('Using emissive map approach');
            // Create a canvas to modify the emissive map texture
            const canvas = document.createElement('canvas');
            canvas.width = originalEmissiveMap.image.width;
            canvas.height = originalEmissiveMap.image.height;
            const ctx = canvas.getContext('2d');
            
            // Draw the original emissive map
            ctx.drawImage(originalEmissiveMap.image, 0, 0);
            
            // Get image data and apply color overlay
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const targetColor = new THREE.Color(color);
            
            // Apply color to non-transparent pixels
            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] > 0) { // If alpha > 0 (not transparent)
                    data[i] = targetColor.r * 255;     // Red
                    data[i + 1] = targetColor.g * 255; // Green
                    data[i + 2] = targetColor.b * 255; // Blue
                    // Keep original alpha
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            // Create new texture from modified canvas
            const newTexture = new THREE.CanvasTexture(canvas);
            newTexture.wrapS = originalEmissiveMap.wrapS;
            newTexture.wrapT = originalEmissiveMap.wrapT;
            newTexture.magFilter = originalEmissiveMap.magFilter;
            newTexture.minFilter = originalEmissiveMap.minFilter;
            
            // Apply the modified emissive map
            emissiveMaterial.emissiveMap = newTexture;
            emissiveMaterial.emissive = new THREE.Color(0xffffff); // White emissive to show map color
            emissiveMaterial.emissiveIntensity = 5; // Reduced brightness
            emissiveMaterial.needsUpdate = true;
        } else {
            console.log('No emissive map found, using fallback emissive color');
            // Fallback to emissive color if no emissive map exists
            emissiveMaterial.emissive = new THREE.Color(color);
            emissiveMaterial.emissiveIntensity = 0.8; // Reduced brightness
            emissiveMaterial.needsUpdate = true;
        }
    } else {
        console.log('No emissive material found');
    }
}

/**
 * Start infinite color lerping animation for emissive material
 */
function startEmissiveColorAnimation() {
    if (!emissiveMaterial) return;
    
    const colors = [
        0xff3366, // Pink
        0x3366ff, // Blue
        0x33ff66, // Green
        0xffff33, // Yellow
        0xff33ff, // Magenta
        0x33ffff  // Cyan
    ];
    
    let currentColorIndex = 0;
    let nextColorIndex = 1;
    let lerpProgress = 0;
    const lerpSpeed = 0.005; // Speed of color transition
    
    emissiveColorAnimation = {
        update: function() {
            if (!emissiveMaterial) return;
            
            lerpProgress += lerpSpeed;
            
            if (lerpProgress >= 1) {
                lerpProgress = 0;
                currentColorIndex = nextColorIndex;
                nextColorIndex = (nextColorIndex + 1) % colors.length;
            }
            
            // Lerp between current and next color
            const currentColor = new THREE.Color(colors[currentColorIndex]);
            const nextColor = new THREE.Color(colors[nextColorIndex]);
            const lerpedColor = currentColor.clone().lerp(nextColor, lerpProgress);
            
            // Convert to hex for updateEmissiveColor function
            const hexColor = '#' + lerpedColor.getHexString();
            
            // Use the same updateEmissiveColor function to maintain consistency
            updateEmissiveColor(hexColor);
        }
    };
}

/**
 * Stop infinite color lerping animation
 */
function stopEmissiveColorAnimation() {
    emissiveColorAnimation = null;
}

/**
 * Update base color of the model
 * @param {string} color - Hex color value
 */
function updateBaseColor(color) {
    if (baseMaterial) {
        baseMaterial.color = new THREE.Color(color);
        baseMaterial.needsUpdate = true;
    }
}

/**
 * Handle window resize
 */
function onWindowResize() {
    const container = document.getElementById('modelViewer');
    if (!container) return;
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

/**
 * Animation loop
 */
function animate() {
    requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    // Update emissive color animation if active
    if (emissiveColorAnimation) {
        emissiveColorAnimation.update();
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// =============================================================================
// COLOR CONTROL FUNCTIONS
// =============================================================================

/**
 * Initialize color controls for the 3D model
 */
function initializeColorControls() {
    // Custom color wheel functionality
    const customColorWheel = document.getElementById('customColorWheel');
    const colorWheelCanvas = document.getElementById('colorWheelCanvas');
    const colorPreview = document.querySelector('.color-preview');
    
    if (customColorWheel && colorWheelCanvas && colorPreview) {
        // Set canvas dimensions explicitly
        colorWheelCanvas.width = 200;
        colorWheelCanvas.height = 200;
        
        const ctx = colorWheelCanvas.getContext('2d');
        const centerX = colorWheelCanvas.width / 2;
        const centerY = colorWheelCanvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        // Draw color wheel
        drawColorWheel(ctx, centerX, centerY, radius);
        
        // Initialize with default emissive color
        let currentEmissiveColor = '#ff3366';
        colorPreview.style.backgroundColor = currentEmissiveColor;
        
        // Handle color wheel interaction
        colorWheelCanvas.addEventListener('click', function(e) {
            // Stop the infinite animation when user selects a color
            stopEmissiveColorAnimation();
            
            const rect = colorWheelCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate angle and distance from center
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius) {
                // Calculate hue from angle
                let angle = Math.atan2(dy, dx);
                if (angle < 0) angle += 2 * Math.PI;
                const hue = Math.round(angle * 180 / Math.PI);
                
                // Calculate saturation from distance
                const saturation = Math.min(100, Math.round((distance / radius) * 100));
                
                // Convert HSL to Hex
                currentEmissiveColor = hslToHex(hue, saturation, 50);
                
                // Update preview and 3D model
                colorPreview.style.backgroundColor = currentEmissiveColor;
                updateEmissiveColor(currentEmissiveColor);
                updateColorPointer(x, y);
            }
        });
    }
    
    // Body color buttons
    const bodyColorButtons = document.querySelectorAll('.body-colors .color-btn');
    bodyColorButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            bodyColorButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get color from data attribute
            const selectedColor = this.dataset.color;
            
            // Determine which model to load based on color
            let newModelPath;
            if (selectedColor === '#000000') {
                newModelPath = './assets/WraithRAMBlack.glb';
            } else if (selectedColor === '#ffffff') {
                newModelPath = './assets/WraithRAMWhite.glb';
            }
            
            // Update current model path and load the new model
            if (newModelPath && newModelPath !== currentModelPath) {
                currentModelPath = newModelPath;
                load3DModel(newModelPath);
            }
        });
    });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Draw color wheel on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} centerX - Center X coordinate
 * @param {number} centerY - Center Y coordinate
 * @param {number} radius - Wheel radius
 */
function drawColorWheel(ctx, centerX, centerY, radius) {
    // Clear canvas first
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw color wheel using HSL color space
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            const distance = Math.sqrt(x * x + y * y);
            
            if (distance <= radius) {
                // Calculate angle and convert to degrees
                let angle = Math.atan2(y, x);
                if (angle < 0) angle += 2 * Math.PI;
                const degrees = Math.round(angle * 180 / Math.PI);
                
                // Calculate saturation based on distance from center
                const saturation = Math.min(100, Math.round((distance / radius) * 100));
                
                // Use fixed lightness for vibrant colors
                const lightness = 50;
                
                // Set pixel color
                ctx.fillStyle = `hsl(${degrees}, ${saturation}%, ${lightness}%)`;
                ctx.fillRect(centerX + x, centerY + y, 1, 1);
            }
        }
    }
    
    // Add a subtle border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

/**
 * Update color wheel pointer position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
function updateColorPointer(x, y) {
    const pointer = document.querySelector('.color-wheel-pointer');
    if (pointer) {
        pointer.style.left = x + 'px';
        pointer.style.top = y + 'px';
    }
}

/**
 * Convert HSL to Hex
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} - Hex color
 */
function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize 3D model viewer when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize 3D model viewer
    initialize3DModel();
    
    // Initialize color controls
    initializeColorControls();
});
