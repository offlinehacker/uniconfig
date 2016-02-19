'use strict';

const assert = require('hoek').assert;
const _ = require('lodash');

const schema = require('./schema');
const Option = require('./option');

class Config {
  constructor(config) {
    const result = schema.Config.validate(config);
    assert(!result.err, 'Config not valid');

    this.config = result.value;
  }

  get name() {
    return this.config.name
  }

  get description() {
    return this.config.description;
  }

  get expose() {
    return this.config.expose;
  }

  get run() {
    return this.config.run;
  }

  get options() {
    return _.map(this.config.options, option => new Option(option));
  }
}

module.exports = Config;
