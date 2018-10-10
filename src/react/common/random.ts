import wordlist = require("./wordlist5a.json");
import randomNumber = require("random-number-csprng");

function capitalizeFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function randomWord() {
  return wordlist[await randomNumber(0, wordlist.length - 1)];
}

export async function randomPassword(length: number = 3) {
  let r = "";
  for (let i = 0; i < length; i++) {
    r += capitalizeFirstLetter(await randomWord());
  }
  return r;
}
