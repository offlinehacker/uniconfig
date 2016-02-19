'use strict';

const assert = require('hoek').assert;

class Provider {
  get(name) {
    return new Error('Not implemented error');
  }

  static create(name, settings, config) {
    assert(name, 'Provider name not provided');

    if (name == 'node') {
      const providers = require('./providers');

      assert(settings.module, 'Module name not defined');

      var Module;
      if (providers[settings.module]) {
        Module = providers[settings.module];
      } else {
        try {
          Module = require(settings.module);
        } catch(e) {
          throw new Error('Cannot load provider: ' + e.toString());
        }
      }

      return new Module(settings, config);
    }

    throw new Error('Provider "' + name + '" not supported');
  }
}

module.exports = Provider;
