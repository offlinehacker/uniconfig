'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;
const Promise = require('bluebird');

const Provider = require('./provider');
const Errors = require('./errors');
const Option = require('./option');

class Resolver {
  constructor() {
    this.providers = [];
    this._regex = /\{\{([a-z.A-Z-]+)\}\}/g;
  }

  register(provider) {
    if(_.isArray(provider)) {
      return _.forEach(provider, resolver => this.register(resolver));
    }

    assert(provider instanceof Provider, "provider not instance of Provider");

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

  _getOption(providers, option, env) {
    if (_.isEmpty(providers)) {
      return Promise.reject(new Errors.OptionNotFound(_.get(option, 'name') || option));
    }

    const provider = providers[0];

    var name;
    if (option instanceof Option) {
      if (provider.global) {
        name = ['services', option.config.name, option.name].join('.');
      } else {
        name = option.name;
      }
    } else {
      name = option;
      if(!provider.global) throw new Errors.OptionNotFound(name);
    }

    return provider
      // get option from current provider
      .get(name, env).then(value => {
        const variables = this._parseTemplate(value);
        const values = _.map(variables, variable => {
          return this._getOption(this.providers, variable, env);
        });

        return Promise.props(values).then(values => {
          return this._generateTemplate(value, values);
        });
      })

      // try next provider
      .catch(Errors.OptionNotFound, err => {
        return this._getOption(providers.splice(1), option, env);
      });
  }

  get(option, env) {
    return this._getOption(this.providers, option, env);
  }
}

module.exports = Resolver;
