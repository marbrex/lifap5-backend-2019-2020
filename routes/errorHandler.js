const createError = require('http-errors');
const { logger, config } = require('../utils');

function notFoundHandler(req, res, next) {
  next(createError.NotFound(`${req.url}`));
}

// curl -I -H'Accept: application/json' http://localhost:3000/doesnotexists/
// curl -I -H'Accept: application/json' http://localhost:3000/error/
// curl -I -H'Accept: text/*' http://localhost:3000/doesnotexists/
// curl -I -H'Accept: text/*' http://localhost:3000/error/
function defaultErrorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
  }
  const { name, message, status = 500 } = err;
  const stack = config.env === 'development' ? err.stack : undefined;
  res.status(status);
  res.format({
    html() {
      res.render('error', { stack, name, message, status });
    },

    json() {
      res.send({ name, message, status });
    },
  });

  const msg = `${status} - ${req.method} ${req.url} - ${req.ip} : ${name} - ${message}`;
  if (status >= 500) {
    logger.error(msg);
  } else {
    logger.info(msg);
  }
}

module.exports = { notFoundHandler, defaultErrorHandler };
