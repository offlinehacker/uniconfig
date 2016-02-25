'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;
const Promise = require('bluebird');

const Provider = require('./provider');
const Errors = require('./errors');

class Resolver {
  constructor(providers) {
    if (!_.isArray(providers)) providers = [providers];

    assert(
      _.every(providers, provider => provider instanceof Provider),
      'providers must be instance of Provider'
    );

    this.providers = providers;
    this._regex = /\{\{([a-z.A-Z]+)\}\}/g;
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

  _getOption(providers, name, env) {
    if (_.isEmpty(providers)) {
      return Promise.reject(new Errors.OptionNotFound(name));
    }

    return providers[0]
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
        return this._getOption(providers.splice(1), name, env);
      });
  }

  get(option, env) {
    const name = ['services', option.config.name, option.name].join('.');
    return this._getOption(this.providers, name, env);
  }
}

module.exports = Resolver;
