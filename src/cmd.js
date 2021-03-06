'use strict';

const exec = require('child_process').exec;
const fs = require('fs');
const argv = require('yargs');
const _ = require('lodash');

const util = require('./util');
const errors = require('./errors');
const Runner = require('./runner');
const Resolver = require('./resolver');
const Config = require('./config');
const Service = require('./service');
const Provider = require('./provider');

const args = argv
  .option('provider', { desc: 'Provider name', nargs: 1})
  .option('config', { desc: 'Uniconfig configuration file', nargs: 1})
  .options('service', { desc: 'Uniconfig service config', default: './service.yaml'})
  .options('run', { desc: 'Run service' })
  .command('options [name]', '', yargs => {
    return yargs
      .option('add', { desc: 'Add option', type: 'boolean' })
      .option('remove', { desc: 'Remove option', type: 'boolean' })
      .option('provider', { desc: 'Provider name', nargs: 1})
      .option('config', { desc: 'Uniconfig configuration file', nargs: 1})
      .options('service', { desc: 'Uniconfig service config', default: './service.yaml'})
  })
  .help()
  .argv;

var config;
if (args.config) {
  config = util.load(args.config);
} else if(process.env.UNICONFIG_CONFIG) {
  config = util.load(process.env.UNICONFIG_CONFIG);
} else{
  const path = util.findParent(process.cwd());
  if (path) config = util.load(path);
}

const service = new Service(util.load(args.service));
const resolver = new Resolver();

if(config && !args.providers) {
  _.forEach(this.config.providers, provider => resolver.register(provider));
} else if(args.provider) {
  const providers = _.isArray(args.provider) ? args.provider : [args.provider];
  _.forEach(providers, name => {
    const provider = Provider.create(name, args[name]);
    resolver.register(provider);
  });
} else {
  if(process.env.KUBERNETES_SERVICE_HOST) {
    resolver.register(Provider.create('uniconfig-k8s'));
  }
}

const runner = new Runner(service, resolver, {
  namespace: process.env.NODE_ENV
});

if (args._[0] == 'options') {
  runner.showOptions();
} else {
  runner.generateConfigFiles().then(() => {
    if (service.shouldRun || args.run) {
      runner.executeService({ run: args.run });
    }
  });
}
