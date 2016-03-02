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
    return _.get(this.specs, 'run.cmd');
  }

  get env() {
    return _.get(this.specs, 'run.env');
  }

  get shouldRun() {
    return this.specs.run;
  }

  get options() {
    return _.map(this.specs.options, option => new Option(option, this));
  }

  get files() {
    return _.map(this.specs.files, file => {
      return {
        dst: file.dst,
        template: _.template(file.template)
      };
    });
  }
}

module.exports = Service;
