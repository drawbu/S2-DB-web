const layoutButton = document.getElementById('layout-btn');
const imagesGrid = document.getElementById('images-grid');

layoutButton.addEventListener('click', () => {
  const images = imagesGrid.querySelectorAll('a.image');
  if (imagesGrid.classList.contains('grid')) {
    imagesGrid.classList.remove('grid');
  }

  const imageStyle = images[0].style.display === 'block' ? 'inline' : 'block';
  images.forEach(image => {
    image.style.display = imageStyle;
  });

  layoutButton.querySelector('span.description').textContent = `Current: ${imageStyle}`;
});

// Load more images when the user is close to the bottom of the page
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    addNextImage();
  }
});

// Fill the window if the client can't scroll
const interval = setInterval(() => {
  if (window.innerHeight === document.body.offsetHeight) {
    addNextImage();
  }
}, 100);

function addNextImage() {
  const images = imagesGrid.querySelectorAll('a.image');
  const lastImage = images[images.length - 1];
  const imageId = parseInt(
    lastImage.href.replace('/image/', '')
                  .replace(window.location.origin, '')
  );
  if (isNaN(imageId) || imageId >= 53) {
    clearInterval(interval);
    return;
  }
  const nextImage = lastImage.cloneNode(true);
  const imageThumbnail = nextImage.querySelector('img');
  nextImage.href = `/image/${imageId + 1}`;
  imageThumbnail.alt = `Image ${imageId + 1}`;
  imageThumbnail.src = `./public/images/image${imageId + 1}_small.jpg`;
  imagesGrid.appendChild(nextImage);
}


