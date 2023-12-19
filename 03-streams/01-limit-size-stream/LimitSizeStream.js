const { Transform } = require('node:stream');
const { Buffer } = require('node:buffer');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends Transform {
  constructor(options = {}) {
    super(options);

    this.limit = options.limit;
    this.bufferBytes = 0;
  }

  _transform(chunk, encoding, callback) {
    this.bufferBytes += Buffer.byteLength(chunk);
    if (this.bufferBytes <= this.limit) {
      callback(null, chunk);
    } else {
      callback(new LimitExceededError(), chunk);
    }
  }
}

module.exports = LimitSizeStream;
