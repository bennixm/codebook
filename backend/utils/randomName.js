// utils/randomName.js
const ADJECTIVES = ['Sunny', 'Curious', 'Brave', 'Quiet', 'Nimble'];
const ANIMALS    = ['Fox', 'Hedgehog', 'Otter', 'Swan', 'Falcon'];

function randomGuestName() {
  const adj    = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num    = Math.floor(Math.random() * 1000);
  return `${adj}${animal}${num}`; // e.g. "BraveOtter742"
}

module.exports = randomGuestName;
