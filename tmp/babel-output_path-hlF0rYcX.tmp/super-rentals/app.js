define('super-rentals/app', ['exports', 'ember', 'ember-resolver', 'ember/load-initializers', 'super-rentals/config/environment'], function (exports, _ember, _emberResolver, _emberLoadInitializers, _superRentalsConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _superRentalsConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _superRentalsConfigEnvironment['default'].podModulePrefix,
    Resolver: _emberResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _superRentalsConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});