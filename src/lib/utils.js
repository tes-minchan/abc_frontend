

export const convertFloatDigit = (number,digit) =>{

  return Math.floor(number * Math.pow(10,digit)) / Math.pow(10,digit);

}

export const paddingZero = (num,n) => {
  return parseFloat(Math.round(num * Math.pow(10, n)) /Math.pow(10,n)).toFixed(n);
}