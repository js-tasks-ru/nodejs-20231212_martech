const { URL } = require('node:url');
const { Server } = require('node:http');
const { join } = require('path');
const { createWriteStream, unlink, existsSync } = require('node:fs');
const LimitSizeStream = require('./LimitSizeStream');

const setHTTPAnswer = (res, code = 200, msg = '') => {
  res.statusCode = code;
  msg = msg instanceof Error ? `${msg.code}. ${msg.message}` : msg;
  res.end(msg);
};

const server = new Server();
server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const fileName = decodeURIComponent(url.pathname.slice(1)).trim();
  const filePath = join(__dirname, 'files', fileName);

  switch (req.method) {
    case 'POST':
      if (!new RegExp('^[a-zа-я0-9_.@()-]+$', 'i').test(fileName)) {
        setHTTPAnswer(res, 400, 'File name is invalid');
      } else if (existsSync(filePath)) {
        setHTTPAnswer(res, 409, 'File with the same name already exists');
      } else {
        // req
        req.on('aborted', () => {
          writeFile.destroy();
          limitSizeObserver.destroy();
          unlink(filePath, (err) => {
            if (err) console.log(err);
          });
        });

        // limitSizeObserver
        const limitSizeObserver = new LimitSizeStream({ limit: 1024 ** 2 });
        limitSizeObserver.on('error', (err) => {
          if (err.code === 'LIMIT_EXCEEDED') {
            unlink(filePath, (err) => {
              if (err) console.log(err);
            });
            setHTTPAnswer(res, 413, err);
          } else {
            setHTTPAnswer(res, 500, err);
          }
        });

        // writeFile
        const writeFile = createWriteStream(filePath);
        writeFile.on('error', (err) => {
          setHTTPAnswer(res, 500, err);
        });
        writeFile.on('finish', () => {
          setHTTPAnswer(res, 201, 'File has been uploaded successfully');
        });

        req.pipe(limitSizeObserver).pipe(writeFile);
      }
      break;

    default:
      setHTTPAnswer(res, 501, 'Not implemented');
  }
});

module.exports = server;
