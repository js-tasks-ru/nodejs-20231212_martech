const { URL } = require('node:url');
const { Server } = require('node:http');
const { join } = require('node:path');
const { access, constants, unlink } = require('node:fs');

const setHTTPAnswer = (res, code = 200, msg = '') => {
  res.statusCode = code;
  msg = msg instanceof Error ? `${msg.code}, ${msg.message}` : msg;
  res.end(msg);
};

const server = new Server();
server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const fileName = decodeURIComponent(url.pathname.slice(1)).trim();
  const filePath = join(__dirname, 'files', fileName);

  switch (req.method) {
    case 'DELETE':
      if (!new RegExp('^[a-zа-я@()0-9_.-]+$', 'i').test(fileName)) {
        setHTTPAnswer(res, 400, 'File name is invalid');
      } else {
        access(filePath, constants.W_OK, (err) => {
          if (!err) {
            unlink(filePath, (err) => {
              if (err) {
                setHTTPAnswer(res, 500, 'Some kind of internal error');
              }
              setHTTPAnswer(res, 200, 'File has been deleted successfully');
            });
          } else {
            setHTTPAnswer(res, 404, `File doesn't exist`);
          }
        });
      }
      break;

    default:
      setHTTPAnswer(res, 501, 'Not implemented');
  }
});

module.exports = server;
