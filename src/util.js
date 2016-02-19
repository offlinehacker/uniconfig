'use strict';

const _ = require('lodash');

module.exports = {
  envToObject: (vars, prefix) => {
    var result = {};

    vars = _.transform(vars, (result, val, key) => {
      if (_.startsWith(key, prefix))
        result[_.replace(key, prefix, '')] = val;
    });

    _.forEach(vars, (val, key) => {
      _.set(result, _.toLower(key.replace(/_/g, '.')), val);
    });

    return result;
  }
};
