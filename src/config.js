'use strict';

const assert = require('hoek').assert;
const _ = require('lodash');

const schema = require('./schema');
const Provider = require('./provider');

class Config {
  constructor(specs) {
    const result = schema.Config.validate(specs);
    assert(!result.err, 'Config not valid');

    this.specs = result.value;
  }

  get providers() {
    return _.map(this.specs.providers, provider => {
      return Provider.create(provider.name, provider.config);
    });
  }
}

module.exports = Config;
