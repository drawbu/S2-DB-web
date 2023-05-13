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
  lastImage.classList.remove('hidden');
}

addNextImage();

imagesGrid.querySelectorAll('div.image').forEach(image => {
  const id = image.dataset.value;
  const likeDiv = image.querySelector('div.likes');
  const button = likeDiv.querySelector('button');
  const text = likeDiv.querySelector('p');

  button.addEventListener('click', () => like(id, button, text));
});

function like(imageId, button, text) {
  fetch(`/j-aime/${imageId}`)
    .then(res => {
      if (!res || !res.ok) {
        return;
      }
      text.textContent = `${(parseInt(text.textContent) + 1)} likes`;
      button.style.display = 'none';
    });
}

const url = new URL(document.URL);
const select = document.getElementById('sort');
select.value = url.searchParams.get('sortby') || 'id';

select.addEventListener('change', () => {
  url.searchParams.set('sortby', select.value);
  window.location.href = url.toString();
});
