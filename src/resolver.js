'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;
const Promise = require('bluebird');

const Provider = require('./provider');
const Errors = require('./errors');

class Resolver {
  constructor() {
    this.providers = [];
    this._regex = /\{\{([a-z.A-Z]+)\}\}/g;
  }

  register(provider) {
    assert(provider instanceof Provider, 'value not instance of provider');
    this.providers.push(provider);
  }

  _parseTemplate(value) {
    var results = [];
    var match;
    while(match = this._regex.exec(value)) {
      results.push(match[1]);
    }

    return results;
  }

  _generateTemplate(value, context) {
    var x = 0;
    var match;

    while(match = this._regex.exec(value)) {
      value = value.replace(match[0], context[x]);
      x++;
    }

    return value;
  }

  _getOption(providers, name) {
    if (_.isEmpty(providers)) {
      return Promise.reject(new Errors.OptionNotFound(name));
    }

    return providers[0]
      // get option from current provider
      .get(name).then(value => {
        const variables = this._parseTemplate(value);
        const values = _.map(variables, variable => {
          return this._getOption(this.providers, variable);
        });

        return Promise.props(values).then(values => {
          return this._generateTemplate(value, values);
        });
      })

      // try next provider
      .catch(Errors.OptionNotFound, err => {
        return this._getOption(providers.splice(1), name);
      });
  }

  get(option, env) {
    const name = [env.namespace, 'services', option.config.name, option.name].join('.');
    return this._getOption(this.providers, name);
  }
}

module.exports = Resolver;