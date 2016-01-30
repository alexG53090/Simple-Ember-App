define('super-rentals/tests/helpers/resolver', ['exports', 'ember-resolver', 'super-rentals/config/environment'], function (exports, _emberResolver, _superRentalsConfigEnvironment) {

  var resolver = _emberResolver['default'].create();

  resolver.namespace = {
    modulePrefix: _superRentalsConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _superRentalsConfigEnvironment['default'].podModulePrefix
  };

  exports['default'] = resolver;
});