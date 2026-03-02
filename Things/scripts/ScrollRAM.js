async function setupViewer() {
    const canvas = document.getElementById('web-canvas');
    if (!canvas) return console.error('Canvas not found');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    camera.position.set(0, 2, 6);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.width, canvas.height);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Load model
    const loader = new THREE.GLTFLoader();
    let model;
    try {
        const gltf = await loader.loadAsync('./assets/ScrollRAM.glb');
        model = gltf.scene;
    } catch {
        const gltf = await loader.loadAsync('./assets/WraithRAMBlack.glb');
        model = gltf.scene;
    }

    // Center & scale
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = 3.5 / Math.max(size.x, size.y, size.z);
    model.position.sub(center);
    model.scale.multiplyScalar(scale);
    scene.add(model);

    let currentY = camera.position.y;
    const xOffset = 0;
    const yOffset = 0;

    const combinedSection = document.getElementById('combined-features-section');
    const combinedHeight = combinedSection.offsetHeight;

   function updateCamera() {
    const rect = combinedSection.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    // scrollProgress 0 → top of section, 1 → bottom of section
    let scrollProgress = (window.scrollY - combinedSection.offsetTop) / combinedSection.offsetHeight;
    scrollProgress = Math.min(Math.max(scrollProgress, 0), 1);

    // Camera Y moves from 2 → -6 for full section scroll
    const startY = 2;
    const endY = -6;
    currentY += (startY + scrollProgress * (endY - startY) - currentY) * 0.5; // faster smoothing

    camera.position.y = currentY;
    camera.position.x = 0;
    camera.position.z = 6 - scrollProgress * 3; // zoom in more aggressively
    camera.lookAt(model.position);
}

    function animate() {
        requestAnimationFrame(animate);
        updateCamera();
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        camera.aspect = canvas.width / canvas.height;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.width, canvas.height);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupViewer);
} else {
    setupViewer();
}