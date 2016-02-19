'use strict';

const Joi = require('joi');

const Option = Joi.object({
  name: Joi.string(), // option name
  description: Joi.string(), // service description
  as: Joi.string(), // option value
  global: Joi.boolean(),
  store: Joi.string().default('services')
});

const Config = Joi.object({
  name: Joi.string(), // service name
  expose: Joi.string().allow(['env']), // expose as
  description: Joi.string(), // service description
  run: Joi.string()
});

module.exports = {
  Option: Option,
  Config: Config
};
