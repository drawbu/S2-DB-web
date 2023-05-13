const layoutButton = document.getElementById('layout-btn');
const imagesGrid = document.getElementById('images-grid');

layoutButton.addEventListener('click', () => {
  const images = imagesGrid.querySelectorAll('div.image');
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
  addNextImage();
});

const interval = setInterval(() => {
  if (document.body.offsetHeight - 100 > window.innerHeight) {
    clearInterval(interval);
    return;
  }
  addNextImage();
}, 100);


function addNextImage() {
  const hiddenImages = imagesGrid.querySelectorAll('div.image.hidden');
  if (hiddenImages.length === 0) {
    return;
  }
  const lastImage = hiddenImages[0];
  lastImage.style.display = 'block';
  lastImage.classList.remove('hidden');
}

addNextImage()
