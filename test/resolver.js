const expect = require('chai').expect;

const Provider = require('../src/provider');
const Resolver = require('../src/resolver');
const Config = require('../src/config');

describe('resolver', () => {
  describe('with one provider', () => {
    before(() => {
      provider = Provider.create('node', {
        module: 'memory',
        settings: {
          staging: {
            services: {
              redis: {
                url: 'localhost'
              },
              server: {
                redis: 'redis://{{staging.services.redis.url}}',
                host: '{{undefined}}'
              }
            }
          }
        }
      });

      this.resolver = new Resolver();
      this.resolver.register(provider);
    });

    it('should resolve value', () => {
      var config = new Config({
        name: 'redis',
        options: [{
          name: 'url'
        }]
      });

      return this.resolver.get(config.options[0], {namespace: 'staging'}).then(value => {
        expect(value).to.be.equal('localhost');
      });
    });

    it('should resolve template value', () => {
      var config = new Config({
        name: 'server',
        options: [{
          name: 'redis'
        }]
      });

      return this.resolver.get(config.options[0], {namespace: 'staging'}).then(value => {
        expect(value).to.be.equal('redis://localhost');
      });
    });

    it('should error if not value is found', () => {
      var config = new Config({
        name: 'server',
        options: [{
          name: 'undefined'
        }]
      });

      return this.resolver.get(config.options[0], {namespace: 'staging'}).catch(err => {
        expect(err.name).to.be.equal('OptionNotFound');
      });
    });

    it('should error if template value not found', () => {
      var config = new Config({
        name: 'server',
        options: [{
          name: 'host'
        }]
      });

      return this.resolver.get(config.options[0], {namespace: 'staging'}).catch(err => {
        expect(err.name).to.be.equal('OptionNotFound');
      });
    })
  });
})
