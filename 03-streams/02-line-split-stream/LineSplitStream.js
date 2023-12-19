const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    chunk = chunk.toString();
    if (chunk.indexOf(os.EOL) !== -1) {
      const parts = chunk.split(os.EOL);
      parts.forEach((part) => {
        if (part !== parts.at(-1)) {
          this.push(this.buffer + part);
          this.buffer = '';
        } else {
          this.buffer = part;
        }
      });
    } else {
      this.buffer += chunk;
    }
    callback();
  }

  _flush(callback) {
    if (this.buffer) {
      this.push(this.buffer);
    }
    callback();
  }
}

module.exports = LineSplitStream;
