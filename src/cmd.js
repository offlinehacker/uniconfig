const argv = require('yargs');
const _ = require('lodash');

const util = require('./util');
const errors = require('./errors');
const Runner = require('./runner');
const Resolver = require('./resolver');
const Config = require('./config');
const Service = require('./service');

const args = argv
  .option('provider', { desc: 'Provider name', nargs: 1})
  .option('config', { desc: 'Uniconfig configuration file', nargs: 1})
  .options('service', { desc: 'Uniconfig service config', default: './service.yaml'})
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

// Try to get uniconfig configuration
var config;
if (args.config) {
  config = util.load(args.config);
} else if(process.env.UNICONFIG_CONFIG) {
  config = util.load(process.env.UNICONFIG_CONFIG);
} else{
  config = util.findParent(process.cwd());
}

// Try alternative methods to create configuration
if (!config) {
  if (process.env.KUBERNETES_SERVICE_HOST) {
    config = new Config({
      providers: [{
        name: 'uniconfig-k8s',
        config: { host: process.env.KUBERNETES_SERVICE_HOST }
      }]
    });
  } else {
    console.error("Config not provided");
    argv.showHelp();
    process.exit(1);
  }
} else {
  config = new Config(config);
}

const resolver = new Resolver(config.providers);
const service = new Service(util.load(args.service));
const env = { namespace: process.env.NODE_ENV || 'default' }

if (args._[0] == 'options') {
  _.forEach(service.options, option => {
    resolver.get(option, env).then(value => {
      console.log(`${option.name} -> ${value}`)
    }).catch(errors.OptionNotFound, err => {
      console.log(`${option.name} -> OptionNotFound`);
    });
  });
} else {
  if (service.shouldRun) {
    const runner = new Runner(service, resolver);
    runner.run(env).catch(err => {
      console.error(err);
      process.exit(1);
    });
  }
}
