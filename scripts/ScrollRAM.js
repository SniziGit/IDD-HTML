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
    camera.position.set(0, .9, 1.6);
    camera.rotation.set(-0.5, 0, 0.5)

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
    let animationDuration = 0;
    let animationProgress = 0; // 0 to 1
    // autoplay target behavior: when user scrolls once, continue to 0 or 1
    let autoPlayTarget = null; // null | 0 | 1
    const autoPlaySpeed = 0.8; // progress units per second when auto-playing to target

    if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);

        const clip = gltf.animations[0];
        const action = mixer.clipAction(clip);

        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;

        animationDuration = clip.duration;

        model.userData.action = action;
        // Start the action but freeze its time progression so it doesn't play automatically
        model.userData.action.play();
        model.userData.action.timeScale = 0;
        // Start by setting time to 0
        action.time = 0;
    }

    // Require section to be at least 50% visible before allowing playback
    let sectionHalfVisible = false;
    const io = new IntersectionObserver((entries) => {
        for (const e of entries) sectionHalfVisible = e.intersectionRatio >= 0.5;
    }, { threshold: [0, 0.5, 1] });
    io.observe(section);

    // Global wheel handler: one-shot play-to-target per scroll direction.
    // Scrolling down (deltaY > 0) -> play forward to end (1).
    // Scrolling up (deltaY < 0) -> play backward to start (0).
    // While an autoplay is in progress, further wheel events are ignored.
    window.addEventListener('wheel', (event) => {
        if (animationDuration === 0) return;

        // Only allow starting playback when section is at least half visible
        if (!sectionHalfVisible) return;

        const direction = event.deltaY > 0 ? 1 : -1; // down -> 1 (forward), up -> -1 (backward)

        // If already autoplaying, ignore further input until it finishes
        if (autoPlayTarget !== null) return;

        if (direction === 1 && animationProgress < 1) {
            event.preventDefault();
            autoPlayTarget = 1;
        } else if (direction === -1 && animationProgress > 0) {
            event.preventDefault();
            autoPlayTarget = 0;
        }
    }, { passive: false });

    // Render loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        // If an autoplay target is set, drive progress toward that target until reached
        if (autoPlayTarget !== null) {
            const diff = autoPlayTarget - animationProgress;
            if (Math.abs(diff) < 1e-4) {
                animationProgress = autoPlayTarget;
                autoPlayTarget = null;
            } else {
                const dir = Math.sign(diff);
                animationProgress += dir * autoPlaySpeed * delta;
                // If we overshot, clamp and finish
                if ((dir > 0 && animationProgress >= autoPlayTarget) || (dir < 0 && animationProgress <= autoPlayTarget)) {
                    animationProgress = autoPlayTarget;
                    autoPlayTarget = null;
                }
            }
        }

        // Clamp progress
        animationProgress = Math.max(0, Math.min(1, animationProgress));

        // Apply animation time from progress. Use mixer.update(0) so we apply
        // the action pose immediately based on the manually-set time.
        if (model.userData.action) {
            model.userData.action.time = animationProgress * animationDuration;
            if (mixer) mixer.update(0);
        } else {
            if (mixer) mixer.update(delta);
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