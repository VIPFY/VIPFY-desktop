/* wordlist generated from en_US dictionary from http://wordlist.aspell.net/other-dicts/
 using
 cat en_US.dic | sed -r 's/^(.*?)\//\1/' |  grep -P "^[a-z]{3,}$" | tr '[: upper:]' '[: lower:]' | sort | uniq > wordlist5a.txt
 for word in $(cat wordlist5a.txt); do echo "\"$word\"," >> wordlist5.json; done
*/
// wordlist is licenced BSD/MIT-Like
import randomNumber = require("random-number-csprng");

let wordlist: string[] | null = null;

function capitalizeFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function randomWord() {
  // lazy loading to improve loading to of app
  if (wordlist === null) {
    wordlist = require("./wordlist5a.json");
  }
  return wordlist![await randomNumber(0, wordlist!.length - 1)];
}

export async function randomPassword(length: number = 3) {
  let r = "";
  for (let i = 0; i < length; i++) {
    r += capitalizeFirstLetter(await randomWord());
  }
  return r;
}
