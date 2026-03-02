// Get elements
const mainImage = document.getElementById("main-product-image");
const thumbnails = document.querySelectorAll(".thumbnail-item");

// Initialize main image with the first thumbnail
if (thumbnails.length > 0) {
    const firstSrc = thumbnails[0].dataset.fullImage;
    mainImage.style.backgroundImage = `url(${firstSrc})`;
    mainImage.style.backgroundSize = "cover";
    mainImage.style.backgroundPosition = "center";
}

// Add click event to thumbnails
thumbnails.forEach((thumb) => {
    thumb.addEventListener("click", () => {
        // Update main image
        const newSrc = thumb.dataset.fullImage;
        mainImage.style.backgroundImage = `url(${newSrc})`;

        // Remove active class from all thumbnails
        thumbnails.forEach((t) => t.classList.remove("active"));

        // Add active class to clicked thumbnail
        thumb.classList.add("active");
    });
});