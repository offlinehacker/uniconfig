'use strict';

const assert = require('hoek').assert;

const schema = require('./schema');

class Option {
  constructor(option, config) {
    const result = schema.Option.validate(option);
    assert(!result.err, 'Option not valid');

    this.option = result.value;
    this.config = config;
  }

  get name() {
    return this.option.name
  }

  get description() {
    return this.option.description;
  }

  get as() {
    return this.option.as;
  }

  get global() {
    return this.option.global;
  }

  get store() {
    return this.option.store;
  }
}

module.exports = Option;
