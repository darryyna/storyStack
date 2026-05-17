const { ValidationError } = require('../errorsHandling/errors');

const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.flatten().fieldErrors;
    const firstField = Object.keys(details)[0];
    const message = firstField
      ? `${firstField}: ${details[firstField][0]}`
      : 'Validation failed';
    return next(new ValidationError(message));
  }
  req[source] = result.data;
  next();
};

module.exports = { validate };