'use strict';

const exec = require('child_process').exec;
const assert = require('hoek').assert;
const _ = require('lodash');
const winston = require('winston');

const errors = require('./errors');
const Service = require('./service');
const Resolver = require('./resolver');

class Runner {
  constructor(service, resolver) {
    assert(service instanceof Service, "service not instance of Service");
    assert(resolver instanceof Resolver, "resolver not instance of Resolver");

    this.service = service;
    this.resolver = resolver;
  }

  run(env) {
    return Promise.all(
      _.reject(_.map(this.service.options, option => {
        return this.resolver.get(option, env).then(value => {
          option = _.extend(option, {value: value});
          winston.info('exposing option', option);
          return option;
        }).catch(errors.OptionNotFound, err => {
          if (option.required) throw err;
        });
      }), _.isUndefined)
    ).then(options => {
      const envOptions = _
        .chain(this.service.env)
        .map((env, name) => {
          const option = _.find(options, ['name', name]) || {};
          return [env, option.value];
        })
        .fromPairs()
        .omitBy(_.isUndefined)
        .value();

      const process = exec(this.service.cmd, {
        env: _.extend(global.process.env, envOptions)
      });

      process.stdout.pipe(global.process.stdout);
      process.stderr.pipe(global.process.stderr);

      process.on('exit', code => global.process.exit(code));
    });
  }
}

module.exports = Runner;
