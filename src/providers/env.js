'use strict';

const _ = require('lodash');

const Provider = require('../provider');
const Errors = require('../errors');
const Promise = require('bluebird');

class EnvProvider extends Provider {
  constructor(config) {
    super(config);

    this.prefix = _.get(config, 'prefix') || 'param_';
  }

  get(name, env) {
    const key = (this.prefix + name).toUpperCase();

    if (!_.has(process.env, key)) {
      return Promise.reject(new Errors.OptionNotFound(name));
    }

    return Promise.resolve(_.get(process.env, key));
  }
}

module.exports = EnvProvider;
