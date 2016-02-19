'use strict';

const exec = require('child_process').exec;
const _ = require('lodash');
const winston = require('winston');

class Runner {
  constructor(config, provider) {
    this.config = config;
    this.provider = provider;
  }

  run(config) {
    return Promise.all(
      _.map(this.config.options, option => {
        return this.provider.get(option, config).then(value => {
          option = _.extend(option, {value: value});
          winston.info('exposing option', option);
          return option;
        });
      })
    ).then(options => {
      var env = global.process.env;

      if (this.config.expose == 'env') {
        options = _.fromPairs(_.map(options, option => {
          return [option.as, option.value];
        }));

        _.extend(env, options);
      }

      const process = exec(config.cmd, {
        env: env
      }).stdout.pipe(global.process.stdout);
      process.on('exit', code => {
        process.exit(code);
      });
    });
  }
}

module.exports = Runner;
