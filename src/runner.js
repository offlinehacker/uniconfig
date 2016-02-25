'use strict';

const exec = require('child_process').exec;
const assert = require('hoek').assert;
const _ = require('lodash');
const winston = require('winston');

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
      _.map(this.service.options, option => {
        return this.resolver.get(option, env).then(value => {
          option = _.extend(option, {value: value});
          winston.info('exposing option', option);
          return option;
        });
      })
    ).then(options => {
      var env = global.process.env;

      _.extend(env, _.fromPairs(_.map(this.service.env, (env, name) => {
        const option = _.find(options, ['name', name]) || {};
        return [env, option.value];
      })));

      const process = exec(this.service.cmd, { env: env });

      process.stdout.pipe(global.process.stdout);
      process.stderr.pipe(global.process.stderr);

      process.on('exit', code => global.process.exit(code));
    });
  }
}

module.exports = Runner;
