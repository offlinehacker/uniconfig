'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;
const winston = require('winston');

const Errors = require('../errors');
const Provider = require('../provider');

class File extends Provider {
  constructor(config) {
    super(config);

    assert(this.config.path, 'path not provided');

    try {
      this.props = JSON.parse(require('fs').readFileSync(this.config.path, 'utf8'));
    } catch(e) {
      throw new Error('Cannot load file: ' + e.toString());
    }
  }

  get(name) {
    winston.info('getting option %s from file %s', name, this.config.path);

    if (!_.has(this.props, name)) {
      return Promise.reject(new Errors.OptionNotFound(name));
    }

    return Promise.resolve(_.get(this.file, name));
  }
}

module.exports = File;
