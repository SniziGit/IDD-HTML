async function setupViewer() {
    const canvas = document.getElementById('web-canvas');
    const section = document.getElementById('combined-model-section');
    if (!canvas || !section) return;

    // Scene
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        75,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );

    // Keep camera fixed (DO NOT move model)
    camera.position.set(0.5, 0.7, 2);
    camera.rotation.set(-0.3, 0.2, 0)

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(5, 5, 5);

    scene.add(ambient);
    scene.add(directional);

    // Load GLB
    const loader = new THREE.GLTFLoader();
    const gltf = await loader.loadAsync('./assets/OpenAnimationRAM.glb');

    const model = gltf.scene;

    // Only center & scale (NO rotation changes)
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = 2.5 / Math.max(size.x, size.y, size.z);

    model.position.sub(center);
    model.scale.multiplyScalar(scale);

    // Rotate upright
    model.rotation.x = -Math.PI / 2;

    scene.add(model);

    // Animation setup
    let mixer;
    let animationStarted = false;
    let animationFinished = false;
    let animationDuration = 0;
    let animationStartTime = 0;

    if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);

        const clip = gltf.animations[0];
        const action = mixer.clipAction(clip);

        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;

        animationDuration = clip.duration;

        model.userData.action = action;
    }

    // Scroll lock functions
    function lockScroll() {
        document.body.style.overflow = 'hidden';
    }

    function unlockScroll() {
        document.body.style.overflow = '';
    }

    // Detect when section is visible
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (
                entry.isIntersecting &&
                !animationStarted &&
                !animationFinished
            ) {
                animationStarted = true;
                lockScroll();

                if (model.userData.action) {
                    model.userData.action.play();
                }

                animationStartTime = performance.now();
            }
        });
    }, { threshold: 0.6 });

    observer.observe(section);

    // Render loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);

        // Unlock AFTER full animation duration
        if (animationStarted && !animationFinished) {
            const elapsed = (performance.now() - animationStartTime) / 1000;

            if (elapsed >= animationDuration) {
                unlockScroll();
                animationFinished = true;
            }
        }

        renderer.render(scene, camera);
    }

    animate();

    // Resize handling
    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
}

// Init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupViewer);
} else {
    setupViewer();
}