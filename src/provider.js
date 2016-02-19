'use strict';

const assert = require('hoek').assert;

class Provider {
  constructor(config) {
    this.config = config;
  }

  get(name, env) {
    return new Error('Not implemented error');
  }

  static create(name, config) {
    assert(name, 'Provider name not provided');

    if (name == 'node') {
      const providers = require('./providers');

      assert(config.module, 'Module name not defined');

      var Module;
      if (providers[config.module]) {
        Module = providers[config.module];
      } else {
        try {
          Module = require(config.module);
        } catch(e) {
          throw new Error('Cannot load provider: ' + e.toString());
        }
      }

      return new Module(config);
    }

    throw new Error('Provider "' + name + '" not supported');
  }
}

module.exports = Provider;
