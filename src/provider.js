'use strict';

const assert = require('hoek').assert;

class Provider {
  constructor(config, global) {
    this.config = config || {};
    this.global = global;
  }

  get(name, env) {
    return new Error('Not implemented error');
  }

  static create(name, config) {
    assert(name, 'Module name not provided');

    const providers = require('./providers');

    var provider;
    if (providers[name]) {
      provider = providers[name];
    } else {
      try {
        provider = require(name);
      } catch(e) {
        throw new Error('Cannot load provider: ' + e.toString());
      }
    }

    assert(
      provider.prototype instanceof Provider,
      'provider not instance of Provider'
    );

    return new provider(config);
  }
}

module.exports = Provider;
