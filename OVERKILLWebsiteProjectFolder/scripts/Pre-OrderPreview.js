document.addEventListener("DOMContentLoaded", () => {
    const mainImage = document.getElementById("main-product-image");
    const thumbnails = document.querySelectorAll(".thumbnail-item");
    const indicators = document.querySelectorAll(".indicator");

    // Thumbnail click
    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener("click", () => {
            const fullImage = thumb.dataset.fullImage;
            mainImage.style.backgroundImage = `url('${fullImage}')`;

            // Update active states
            thumbnails.forEach(t => t.classList.remove("active"));
            thumb.classList.add("active");

            indicators.forEach(ind => ind.classList.remove("active"));
            if (indicators[index]) indicators[index].classList.add("active");
        });
    });

    // Indicator click
    indicators.forEach((ind, index) => {
        ind.addEventListener("click", () => {
            const fullImage = thumbnails[index].dataset.fullImage;
            mainImage.style.backgroundImage = `url('${fullImage}')`;

            thumbnails.forEach(t => t.classList.remove("active"));
            thumbnails[index].classList.add("active");

            indicators.forEach(i => i.classList.remove("active"));
            ind.classList.add("active");
        });
    });
});