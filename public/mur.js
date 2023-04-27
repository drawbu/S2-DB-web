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
