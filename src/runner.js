'use strict';

const Promise = require('bluebird');
const fs = require('fs');
const exec = require('child_process').exec;
const assert = require('hoek').assert;
const _ = require('lodash');
const winston = require('winston');

const errors = require('./errors');
const Service = require('./service');
const Resolver = require('./resolver');

class Runner {
  constructor(service, resolver, env) {
    assert(service instanceof Service, "service not instance of Service");
    assert(resolver instanceof Resolver, "resolver not instance of Resolver");

    this.service = service;
    this.resolver = resolver;
    this.env = env;
  }

  _resolveOptions() {
    if (this._options) return this._options;
    return this._options =  Promise.props(_.fromPairs(_.map(this.service.options, option => {
      return [
        option.name,
        this.resolver.get(option, this.env).catch(errors.OptionNotFound, err => {
          if (option.default) return option.default;
          else if (option.optional) return undefined;
          else throw err;
        })
      ];
    })));
  }

  showOptions() {
    return this._resolveOptions().then(options => {
      _.forEach(options, (value, name) => {
        if (_.isUndefined(value)) {
          console.log(`${name} -> OptionNotFound`);
        } else {
          console.log(`${name} -> ${value}`)
        }
      });
    })
  }

  executeService(options) {
    const cmd = options.run || this.service.cmd;

    return this._resolveOptions().then(options => {
      console.log('executing process', cmd);

      const envOptions = _
        .chain(this.service.env)
        .map((env, name) => [env, options[name]])
        .fromPairs()
        .omitBy(_.isUndefined)
        .value();

      const process = exec(cmd, {
        env: _.extend(global.process.env, envOptions)
      });

      process.stdout.pipe(global.process.stdout);
      process.stderr.pipe(global.process.stderr);

      process.on('exit', code => global.process.exit(code));

      return process;
    });
  }

  generateConfigFiles() {
    return this._resolveOptions().then(options => {
      _.forEach(this.service.files, file => {
        console.log('generating config file', file.dst);

        const content = file.template(
          _.mapValues(options, option => option.value)
        );

        fs.writeFileSync(file.dst, content);
      });
    });
  }
}

module.exports = Runner;
