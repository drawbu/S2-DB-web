const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function randomLetter() {
  return letters[Math.floor(Math.random() * 26)];
}

function shuffleLetters(target) {
  let iterations = 0;
  let original = target.dataset.value;
  const iter_letter = 3;
  const max_iterations = original.length * iter_letter;

  const interval = setInterval(() => {
    target.innerText = target.innerText.split('')
      .map((letter, index) => {
        return (index * iter_letter < iterations) ? original[index] : randomLetter();
      })
      .join('')

    if (iterations === max_iterations)
      clearInterval(interval);

    iterations += 1;

  }, 30);
}

const span = document.querySelector('.hacker-effect');

shuffleLetters(span)

span.onmouseover = event => {
  shuffleLetters(event.target);
}