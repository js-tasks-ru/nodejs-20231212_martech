function sum(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a + b;
  }
  throw new TypeError(`function arguments must be of type 'number'`);
}

module.exports = sum;
