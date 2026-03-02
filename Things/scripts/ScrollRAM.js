function createModel(canvasId, rotationType) {
    const canvas = document.getElementById(canvasId);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        45,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1, 5);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 1.5);
    directional.position.set(5, 10, 7);
    scene.add(directional);

    let model;

    const loader = new THREE.GLTFLoader();
    loader.load("./assets/ScrollRAM.glb", (gltf) => {
        model = gltf.scene;
        model.scale.set(1.5, 1.5, 1.5);
        scene.add(model);
        console.log('ScrollRAM model loaded successfully');
    }, undefined, (error) => {
        console.error('Error loading ScrollRAM model:', error);
    });

    function animate() {
        requestAnimationFrame(animate);

        if (model) {
            if (rotationType === "horizontal") {
                model.rotation.y += 0.01;
            }

            if (rotationType === "tilt") {
                model.rotation.x += 0.01;
                model.rotation.y += 0.005;
            }
        }

        renderer.render(scene, camera);
    }

    animate();

    // Resize handling
    window.addEventListener("resize", () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}

// Create model for each section
createModel("canvas-view2", "horizontal");
createModel("canvas-view4", "tilt");