

const generateCode = () => {
  let code = '';
  for (let i=0; i<4; i++) code += (Math.floor((Math.random() * 10) + 1)).toString();
  return code.substring(0, 4);
};
const cleanPhoneNumber = (string) => {
  if ( string === '' ) return string;

  let newString = '';
  for ( const char of string ) {
    if ( char === '+' ) continue;
    if ( char !== ' ') newString = `${ newString }${char}`;
  }


  let counterIndex = 0;
  let reversedString = '';
  for ( let i=newString.length-1; i>0; i-- ) {
    if ( counterIndex === 10 ) break;

    reversedString = `${reversedString}${newString[i]}`;
    counterIndex++;
  }

  reversedString = `234${reversedString.split('').reverse().join('')}`;

  return reversedString;
};


module.exports = {generateCode, cleanPhoneNumber};
