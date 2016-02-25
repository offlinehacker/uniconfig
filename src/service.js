'use strict';

const assert = require('hoek').assert;
const _ = require('lodash');

const schema = require('./schema');
const Option = require('./option');

class Service {
  constructor(specs) {
    const result = schema.Service.validate(specs);
    assert(!result.err, 'Config not valid');

    this.specs = result.value;
  }

  get name() {
    return this.specs.name
  }

  get description() {
    return this.specs.description;
  }

  get cmd() {
    return this.specs.run.cmd;
  }

  get env() {
    return this.specs.run.env;
  }

  get shouldRun() {
    return this.specs.run.cmd;
  }

  get options() {
    return _.map(this.specs.options, option => new Option(option, this));
  }
}

module.exports = Service;
