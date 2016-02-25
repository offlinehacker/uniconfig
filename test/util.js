const expect = require('chai').expect;
const tmp = require('tmp');
const fs = require('fs');
const path = require('path');

const util = require('../src/util');

describe('Util', () => {
  it('should find file in parent folder', () => {
    var tmpFolder = tmp.dirSync().name;
    var subFolder = path.join(tmpFolder, 'base');
    fs.mkdirSync(subFolder);

    var configPath = path.join(tmpFolder, '.uniconfig.yaml');
    fs.writeFileSync(configPath, JSON.stringify({
      provider: 'test'
    }));

    const config = util.findParent(subFolder, '.uniconfig', ['.yaml']);

    expect(config).to.be.equal(configPath);
  });

  it('should return undefined if file not found', () => {
    var tmpFolder = tmp.dirSync().name;

    const config = util.findParent(tmpFolder);

    expect(config).to.not.be.defined;
  });
});
