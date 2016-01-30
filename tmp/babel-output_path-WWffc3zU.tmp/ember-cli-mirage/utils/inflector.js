define('ember-cli-mirage/utils/inflector', ['exports', 'ember', 'ember-inflector'], function (exports, _ember, _emberInflector) {
  'use strict';

  Object.defineProperty(exports, 'singularize', {
    enumerable: true,
    get: function get() {
      return _emberInflector.singularize;
    }
  });
  Object.defineProperty(exports, 'pluralize', {
    enumerable: true,
    get: function get() {
      return _emberInflector.pluralize;
    }
  });

  var capitalize = _ember['default'].String.capitalize;
  exports.capitalize = capitalize;

  var camelize = _ember['default'].String.camelize;
  exports.camelize = camelize;

  var decamelize = _ember['default'].String.decamelize;
  exports.decamelize = decamelize;
});