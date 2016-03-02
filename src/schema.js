'use strict';

const Joi = require('joi');

const optionName = Joi.string();

const Option = Joi.object({
  name: optionName, // option name
  description: Joi.string(), // service description
  required: Joi.boolean(),
  optional: Joi.boolean(),
  default: Joi.any()
}).xor('required', 'optional');

const Service = Joi.object({
  name: Joi.string(), // service name
  format: Joi.string().allow(['env']), // expose as
  description: Joi.string(), // service description
  files: Joi.array().items(Joi.object({
    dst: Joi.string().required(),
    template: Joi.string().required()
  })),
  run: Joi.object({
    cmd: Joi.string(),
    env: Joi.object().pattern(/.*/, optionName)
  })
});

const Config = Joi.object({
  providers: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    config: Joi.object()
  }))
}).unknown(false);

module.exports = {
  Option: Option,
  Service: Service,
  Config: Config
};
