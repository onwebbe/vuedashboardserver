function getRandomChars(size) {
  let chars = '';
  for (let i = 0; i < size; i++) {
    var ascii = Math.random() * 78 + 47;
    if (ascii === 92) {
      ascii = 93;
    }
    chars += String.fromCharCode(ascii);
  }
  return chars;
}
function enc(str) {
  let middle = Math.ceil(str.length / 2);
  let begin = getRandomChars(10);
  let end = getRandomChars(8);
  let mid = getRandomChars(7);
  let tmpStr1 = str.substring(0,middle);
  let tmpStr2 = str.substring(middle, str.length);
  let finalString = begin + tmpStr1 + mid + tmpStr2 + end;
  return finalString
  // str.length / 2 - 6 / 2
}
console.log(enc(''));