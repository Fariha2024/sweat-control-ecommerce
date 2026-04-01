const Joi = require('joi');
const { error } = require('../utils/response');

function validate(schema, property = 'body') {
  return (req, res, next) => {
    const dataToValidate = req[property];
    
    const { error: validationError, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: {
          label: ''
        }
      }
    });
    
    if (validationError) {
      const errors = validationError.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return error(res, 'Validation failed', 400, errors);
    }
    
    // Replace with validated value
    req[property] = value;
    next();
  };
}

module.exports = { validate };