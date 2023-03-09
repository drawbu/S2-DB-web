const urlParams = new URLSearchParams(window.location.search);
const index = parseInt(urlParams.get('id'));

document.querySelector('img#main').src = `./images/image${index}.jpg`
document.querySelector('p.description').textContent = `Image ${index}`

if (index > 1) {
  document.querySelector('img#previous').src = `./images/image${index - 1}_small.jpg`
  document.querySelector('a.previous').href = `/image?id=${index - 1}`
}

if (index < 53) {
  document.querySelector('img#next').src = `./images/image${index + 1}_small.jpg`
  document.querySelector('a.next').href = `/image?id=${index + 1}`
}
