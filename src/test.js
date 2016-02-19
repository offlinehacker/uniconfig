const YAML = require('yamljs');

const Runner = require('./runner');
const Config = require('./config');
const Util = require('./util');
const Provider = require('./provider');

const options = YAML.load('options.yaml');
const config = new Config(options);

const providerSettings = Util.envToObject(process.env, 'UNICONFIG_PROVIDER_');
const provider = Provider.create(process.env.UNICONFIG_PROVIDER, providerSettings, config);

const runner = new Runner(config, provider);

runner.run({
  cmd: process.env.UNICONFIG_CMD,
  env: process.env.NODE_ENV
});
