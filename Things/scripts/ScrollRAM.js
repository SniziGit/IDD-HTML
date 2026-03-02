// Three.js-based scrollable RAM viewer (more reliable)
async function setupViewer() {
    console.log('Setting up Three.js viewer...');
    
    const canvas = document.getElementById('web-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // Set canvas size to full viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.width, canvas.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Position camera
    camera.position.set(0, 0, 5);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Load the ScrollRAM.glb model
    const loader = new THREE.GLTFLoader();
    try {
        console.log('Loading ScrollRAM.glb...');
        const gltf = await loader.loadAsync('./assets/ScrollRAM.glb');
        const model = gltf.scene;
        
        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;
        
        model.position.sub(center);
        model.scale.multiplyScalar(scale);
        scene.add(model);
        
        console.log('ScrollRAM.glb loaded successfully');
        
        // Remove red background once model is loaded
        canvas.style.background = 'transparent';
        
    } catch (error) {
        console.error('Error loading ScrollRAM.glb:', error);
        
        // Try fallback model
        try {
            console.log('Trying fallback model...');
            const gltf = await loader.loadAsync('./assets/WraithRAMBlack.glb');
            const model = gltf.scene;
            
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;
            
            model.position.sub(center);
            model.scale.multiplyScalar(scale);
            scene.add(model);
            
            console.log('Fallback model loaded successfully');
            canvas.style.background = 'transparent';
        } catch (fallbackError) {
            console.error('Fallback model also failed:', fallbackError);
        }
    }
    
    // Scroll-based animation
    function updateCamera() {
        const modelSection = document.getElementById("combined-model-section");
        if (modelSection) {
            const rect = modelSection.getBoundingClientRect();
            
            // Calculate scroll progress within the combined section
            // When section starts (rect.top > 0): progress = 0 (top)
            // When section ends (rect.top < -rect.height): progress = 1 (bottom)
            const sectionHeight = rect.height;
            const currentDistance = Math.max(0, Math.min(sectionHeight, -rect.top));
            const progress = currentDistance / sectionHeight;
            
            // Move camera from top to bottom based on scroll
            // Start position (top): x=0, y=8, z=8 (looking down from above)
            // End position (bottom): x=0, y=-8, z=8 (looking up from below)
            camera.position.x = 0;  // Stay centered
            camera.position.y = 8 - (progress * 16);  // 8 to -8 (top to bottom)
            camera.position.z = 8;  // Fixed distance from model
            camera.lookAt(0, 0, 0);
        }
    }
    
    // Animation loop with visibility optimization
    let isAnimating = true;
    function animate() {
        if (!isAnimating) return;
        requestAnimationFrame(animate);
        updateCamera();
        renderer.render(scene, camera);
    }
    
    // Only animate when canvas is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isAnimating = entry.isIntersecting;
            if (isAnimating) animate();
        });
    }, { threshold: 0.1 });
    
    observer.observe(canvas);
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        camera.aspect = canvas.width / canvas.height;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.width, canvas.height);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupViewer);
} else {
    setupViewer();
}

// Back to top button functionality
window.onscroll = function() {
    if(document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) backToTop.style.display = 'block';
    } else {
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) backToTop.style.display = 'none';
    }
};