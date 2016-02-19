'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;
const winston = require('winston');

class File {
  constructor(options, config) {
    assert(options.path, 'path not provided');

    this.path = options.path;
    this.config = config;

    try {
      this.file = JSON.parse(require('fs').readFileSync(this.path, 'utf8'));
    } catch(e) {
      throw new Error('Cannot load file: ' + e.toString());
    }
  }

  get(option, config) {
    var path;

    if (option.global) {
      path = [config.env, option.store, option.name].join('.');
    } else {
      path = [config.env, option.store, this.config.name, option.name].join('.');
    }

    winston.info('getting option %s from file %s', path, this.path);

    const value = _.get(this.file, path);
    return Promise.resolve(value);
  }
}

module.exports = File;
