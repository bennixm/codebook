
const ADJECTIVES = ['Clever', 'Swift', 'Curious', 'Brave', 'Quiet'];
const ANIMALS = ['Coder', 'Debugger', 'Algorithm', 'Pixel', 'Compiler'];

function randomGuestName() {
  const adj    = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num    = Math.floor(Math.random() * 1000);
  return `${adj}${animal}${num}`;
}

module.exports = randomGuestName;
