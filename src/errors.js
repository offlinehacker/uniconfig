'use strict';

class BaseError extends Error {
  constructor() {
    super();
    Error.captureStackTrace(this, BaseError);
  }
}

class OptionNotFound extends BaseError {
  constructor(name) {
    super();
    this.name = 'OptionNotFound';
    this.description = 'Option "' + name + '" was not found';
  }
}

class NamespaceNotFound extends BaseError {
  constructor(name) {
    super();
    this.name = 'NamespaceNotFound';
    this.description = 'Namespace "' + name + '" was not found';
  }
}

module.exports = {
  OptionNotFound: OptionNotFound,
  NamespaceNotFound: NamespaceNotFound
};
