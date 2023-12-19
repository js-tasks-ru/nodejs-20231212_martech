const { URL } = require('node:url');
const { Server } = require('node:http');
const { join } = require('node:path');
const { createReadStream, access, constants } = require('node:fs');

const setHTTPAnswer = (res, code = 200, msg = '') => {
  res.statusCode = code;
  msg = msg instanceof Error ? `${msg.code}, ${msg.message}` : msg;
  res.end(msg);
};

const server = new Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  const fileName = decodeURIComponent(url.pathname.slice(1));
  const filePath = join(__dirname, 'files', fileName);

  switch (req.method) {
    case 'GET':
      if (fileName.indexOf('/') !== -1) {
        setHTTPAnswer(res, 400, 'Wrong file name');
      } else {
        access(filePath, constants.R_OK, (err) => {
          if (err) {
            setHTTPAnswer(res, 404, `File doesn't exist`);
          } else {
            const readFile = createReadStream(filePath);
            readFile.pipe(res);

            readFile.on('error', (err) => {
              setHTTPAnswer(res, 500, err);
            });
            req.on('aborted', () => {
              readFile.destroy();
            });
          }
        });
      }

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
