'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;
const winston = require('winston');
const Promise = require('bluebird');

const Errors = require('../errors');
const Provider = require('../provider');

class Memory extends Provider {
  constructor(options) {
    super(options);

    this.settings = options.settings;
  }

  get(name) {
    if (!_.has(this.settings, name)) {
      return Promise.reject(new Errors.OptionNotFound(name));
    }

    return Promise.resolve(_.get(this.settings, name));
  }
}

module.exports = Memory;
