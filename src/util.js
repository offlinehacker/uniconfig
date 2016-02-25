'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const YAML = require('yamljs');

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
  },

  load: filePath => {
    const ext = path.extname(filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    if (ext == '.yml' || ext == '.yaml') {
      return YAML.parse(content);
    } else if (ext == '.json') {
      return JSON.parse(content);
    } else {
      throw new Error('Unknown config file extension: ' + ext);
    }
  },

  findParent: (basePath, file, extensions) => {
    var subPath = basePath;
    while(subPath != path.sep) {
      for (var ext in extensions) {
        try {
          const result = path.join(subPath, file + extensions[ext]);
          fs.accessSync(result, fs.R_OK);
          return result;
        } catch(e) {}
      }

      subPath = path.resolve(subPath, '..');
    }
  }
};
