define('super-rentals/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'super-rentals/config/environment'], function (exports, _emberCliAppVersionComponentsAppVersion, _superRentalsConfigEnvironment) {

  var name = _superRentalsConfigEnvironment['default'].APP.name;
  var version = _superRentalsConfigEnvironment['default'].APP.version;

  exports['default'] = _emberCliAppVersionComponentsAppVersion['default'].extend({
    version: version,
    name: name
  });
});