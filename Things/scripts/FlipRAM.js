// Three.js-based scrollable FlipRAM viewer (more reliable)
async function setupFlipViewer() {
    console.log('Setting up Three.js viewer...');
    
    const canvas = document.getElementById('flip-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    const modelWrapper = document.querySelector('.feature-model-wrapper');
    const modelSection = document.getElementById('feature-model-section');
    const homeSection = document.getElementById('home');
    if (!modelWrapper || !modelSection) {
        console.error('Feature model layout elements not found');
        return;
    }

    let hasAutoSnappedToFeature = false;
    let isAutoSnapping = false;
    let lastScrollY = window.scrollY || window.pageYOffset || 0;

    function triggerOneTimeSnapToFeature() {
        if (!homeSection || hasAutoSnappedToFeature || isAutoSnapping) {
            return;
        }

        const currentScroll = window.scrollY || window.pageYOffset || 0;
        const homeTop = homeSection.offsetTop;
        const homeBottom = homeTop + homeSection.offsetHeight;
        const featureTop = modelSection.offsetTop;

        if (currentScroll >= homeTop && currentScroll <= homeBottom && currentScroll < featureTop) {
            hasAutoSnappedToFeature = true;
            isAutoSnapping = true;
            window.scrollTo({ top: featureTop, behavior: 'smooth' });
            window.setTimeout(() => {
                isAutoSnapping = false;
            }, 700);
        }
    }

    function triggerSnapToHomeTop() {
        if (!homeSection || isAutoSnapping) {
            return;
        }

        const currentScroll = window.scrollY || window.pageYOffset || 0;
        const homeTop = homeSection.offsetTop;
        const homeBottom = homeTop + homeSection.offsetHeight;

        if (currentScroll > homeTop && currentScroll <= homeBottom + 40) {
            isAutoSnapping = true;
            window.scrollTo({ top: homeTop, behavior: 'smooth' });
            window.setTimeout(() => {
                hasAutoSnappedToFeature = false;
                isAutoSnapping = false;
            }, 700);
        }
    }

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY || window.pageYOffset || 0;

        if (!isAutoSnapping && homeSection) {
            const homeTop = homeSection.offsetTop;
            const homeBottom = homeTop + homeSection.offsetHeight;
            const isInHomeRange = currentScroll >= homeTop && currentScroll <= homeBottom;

            if (isInHomeRange && currentScroll > lastScrollY + 2) {
                triggerOneTimeSnapToFeature();
            } else if (isInHomeRange && currentScroll < lastScrollY - 2) {
                triggerSnapToHomeTop();
            }
        }

        if (!isAutoSnapping && currentScroll <= 8) {
            hasAutoSnappedToFeature = false;
        }

        lastScrollY = currentScroll;
    }, { passive: true });

    window.addEventListener('wheel', (event) => {
        if (event.deltaY > 0) {
            triggerOneTimeSnapToFeature();
        } else if (event.deltaY < 0) {
            triggerSnapToHomeTop();
        }
    }, { passive: true });

    let touchStartY = null;
    window.addEventListener('touchstart', (event) => {
        if (event.touches && event.touches.length > 0) {
            touchStartY = event.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (event) => {
        if (touchStartY === null || !event.touches || event.touches.length === 0) {
            return;
        }

        const currentY = event.touches[0].clientY;
        if (touchStartY - currentY > 8) {
            triggerOneTimeSnapToFeature();
        } else if (currentY - touchStartY > 8) {
            triggerSnapToHomeTop();
        }
    }, { passive: true });
    
    function syncCanvasSize() {
        const wrapperRect = modelWrapper.getBoundingClientRect();
        const targetWidth = Math.max(1, Math.floor(wrapperRect.width));
        const targetHeight = Math.max(1, Math.floor(wrapperRect.height));
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        renderer.setSize(targetWidth, targetHeight, false);
        camera.aspect = targetWidth / targetHeight;
        camera.updateProjectionMatrix();
    }
    
    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    syncCanvasSize();
    
    // Position camera
    camera.position.set(0, 0, 5);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Load the FlipRAM model
    const loader = new THREE.GLTFLoader();
    let model = null;
    try {
        console.log('Loading FlipRAM model...');
        const gltf = await loader.loadAsync('./assets/ScrollRAM.glb');
        model = gltf.scene;
        
        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4.5 / maxDim;
        
        model.position.sub(center);
        model.scale.multiplyScalar(scale);
        scene.add(model);
        
        console.log('FlipRAM model loaded successfully');
        
        // Remove red background once model is loaded
        canvas.style.background = 'transparent';
        
    } catch (error) {
        console.error('Error loading FlipRAM model:', error);
        
        // Try fallback model
        try {
            console.log('Trying fallback model...');
            const gltf = await loader.loadAsync('./assets/WraithRAMBlack.glb');
            model = gltf.scene;
            
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 4.5 / maxDim;
            
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
        const modelSection = document.getElementById('feature-model-section');
        const quantumStep = document.getElementById('quantum-step');
        const coolingStep = document.getElementById('cooling-step');
        if (!modelSection) {
            return;
        }

        const rect = modelSection.getBoundingClientRect();

        if (rect.bottom < 0 || rect.top > window.innerHeight) {
            return;
        }

        const currentScroll = window.scrollY || window.pageYOffset || 0;
        const sectionScrollTop = currentScroll + modelSection.getBoundingClientRect().top;
        const coolingScrollTop = coolingStep
            ? currentScroll + coolingStep.getBoundingClientRect().top
            : sectionScrollTop + window.innerHeight;
        const startPoint = sectionScrollTop - 0;
        const endPoint = Math.max(coolingScrollTop - window.innerHeight * 0.5, startPoint + 1);
        const stepRange = Math.max(1, endPoint - startPoint);
        let progress = Math.max(0, Math.min(1, (currentScroll - startPoint) / stepRange));

        if (progress < 0.01) {
            progress = 0;
        } else if (progress > 0.99) {
            progress = 1;
        }

        const cameraStartX = 0;
        const cameraEndX = 0;
        const cameraStartY = 0;
        const cameraEndY = 0;

        camera.position.x = cameraStartX + (cameraEndX - cameraStartX) * progress;
        camera.position.y = cameraStartY + (cameraEndY - cameraStartY) * progress;
        camera.position.z = 5;
        camera.lookAt(0, 0, 0);

        if (model) {
            const startModelX = -1.9;
            const endModelX = 1.85;
            const startModelY = 0.95;
            const endModelY = -1.45;
            const rotationProgress = progress;

            model.position.x = startModelX + (endModelX - startModelX) * progress;
            model.position.y = startModelY + (endModelY - startModelY) * progress;
            model.rotation.y = Math.PI * rotationProgress;
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
    
    observer.observe(modelSection);
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        syncCanvasSize();
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFlipViewer);
} else {
    setupFlipViewer();
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