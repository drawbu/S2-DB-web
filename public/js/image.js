const image = document.getElementById('image');
const imageId = image.dataset.value;

const likeDiv = image.querySelector('div.likes');
const button = likeDiv.querySelector('button');
const text = likeDiv.querySelector('p');

button.addEventListener('click', () => {
  fetch(`/j-aime/${imageId}`)
    .then(res => {
      if (!res || !res.ok) {
        return;
      }
      text.textContent = `${(parseInt(text.textContent) + 1)} likes`;
      button.style.display = 'none';
    });
});
