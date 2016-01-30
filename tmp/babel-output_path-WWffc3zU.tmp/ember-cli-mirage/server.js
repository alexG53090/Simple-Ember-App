define('ember-cli-mirage/server', ['exports', 'ember-cli-mirage/utils/inflector', 'pretender', 'ember-cli-mirage/db', 'ember-cli-mirage/orm/schema', 'ember-cli-mirage/serializers/active-model-serializer', 'ember-cli-mirage/serializer-registry', 'ember-cli-mirage/route-handler'], function (exports, _emberCliMirageUtilsInflector, _pretender, _emberCliMirageDb, _emberCliMirageOrmSchema, _emberCliMirageSerializersActiveModelSerializer, _emberCliMirageSerializerRegistry, _emberCliMirageRouteHandler) {
  'use strict';

  var _slicedToArray = (function () {
    function sliceIterator(arr, i) {
      var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;_e = err;
      } finally {
        try {
          if (!_n && _i['return']) _i['return']();
        } finally {
          if (_d) throw _e;
        }
      }return _arr;
    }return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError('Invalid attempt to destructure non-iterable instance');
      }
    };
  })();

  var _createClass = (function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
      }
    }return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
  })();

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }

  var _ref = _;
  var isArray = _ref.isArray;

  var Server = (function () {
    function Server() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, Server);

      this.environment = options.environment || 'development';
      this.options = options;
      this.timing = 400;
      this.namespace = '';
      this.urlPrefix = '';

      this._defineRouteHandlerHelpers();

      /*
        Bootstrap dependencies
         TODO: Inject / belongs in a container
      */
      this.db = new _emberCliMirageDb['default']();

      this.pretender = this.interceptor = new _pretender['default'](function () {
        this.prepareBody = function (body) {
          return body ? JSON.stringify(body) : '{"error": "not found"}';
        };

        this.unhandledRequest = function (verb, path) {
          path = decodeURI(path);
          console.error("Mirage: Your Ember app tried to " + verb + " '" + path + "', but there was no route defined to handle this " + "request. Define a route that matches this path in your " + "mirage/config.js file. Did you forget to add your namespace?");
        };
      });

      if (this._hasModulesOfType(options, 'models')) {
        // TODO: really should be injected into Controller, server doesn't need to know about schema
        this.schema = new _emberCliMirageOrmSchema['default'](this.db);
        this.schema.registerModels(options.models);
        this.serializerOrRegistry = new _emberCliMirageSerializerRegistry['default'](this.schema, options.serializers);
      } else {
        this.serializerOrRegistry = new _emberCliMirageSerializersActiveModelSerializer['default']();
      }

      // TODO: Better way to inject server into test env
      if (this.environment === 'test') {
        window.server = this;
      }

      var hasFactories = this._hasModulesOfType(options, 'factories');
      var hasDefaultScenario = options.scenarios && options.scenarios.hasOwnProperty('default');

      if (options.baseConfig) {
        this.loadConfig(options.baseConfig);
      }

      if (this.environment === 'test' && options.testConfig) {
        this.loadConfig(options.testConfig);
      }

      if (this.environment === 'test' && hasFactories) {
        this.loadFactories(options.factories);
      } else if (this.environment !== 'test' && hasDefaultScenario && hasFactories) {
        this.loadFactories(options.factories);
        options.scenarios['default'](this);
      } else {
        this.loadFixtures();
      }
    }

    _createClass(Server, [{
      key: 'loadConfig',
      value: function loadConfig(config) {
        config.call(this);
        this.timing = this.environment === 'test' ? 0 : this.timing || 0;
      }
    }, {
      key: 'passthrough',
      value: function passthrough() {
        var _this2 = this;

        for (var _len = arguments.length, paths = Array(_len), _key = 0; _key < _len; _key++) {
          paths[_key] = arguments[_key];
        }

        var verbs = ['get', 'post', 'put', 'delete', 'patch'];
        var lastArg = paths[paths.length - 1];

        if (paths.length === 0) {
          paths = ['/*catchall'];
        } else if (isArray(lastArg)) {
          verbs = paths.pop();
        }

        verbs.forEach(function (verb) {
          paths.map(function (path) {
            return _this2._getFullPath(path);
          }).forEach(function (path) {
            _this2.pretender[verb](path, _this2.pretender.passthrough);
          });
        });
      }
    }, {
      key: 'loadFixtures',
      value: function loadFixtures() {
        var fixtures = this.options.fixtures;

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        if (args.length) {
          var _ref2;

          fixtures = (_ref2 = _).pick.apply(_ref2, [fixtures].concat(args));
        }

        this.db.loadData(fixtures);
      }

      /*
        Factory methods
      */
    }, {
      key: 'loadFactories',
      value: function loadFactories(factoryMap) {
        var _this = this;
        // Store a reference to the factories
        this._factoryMap = factoryMap;

        // Create a collection for each factory
        _.keys(factoryMap).forEach(function (type) {
          _this.db.createCollection((0, _emberCliMirageUtilsInflector.pluralize)(type));
        });
      }
    }, {
      key: 'create',
      value: function create(type, overrides) {
        var collection = (0, _emberCliMirageUtilsInflector.pluralize)(type);
        var currentRecords = this.db[collection];
        var sequence = currentRecords ? currentRecords.length : 0;
        if (!this._factoryMap || !this._factoryMap[type]) {
          throw "You're trying to create a " + type + ", but no factory for this type was found";
        }
        var OriginalFactory = this._factoryMap[type];
        var Factory = OriginalFactory.extend(overrides);
        var factory = new Factory();

        var attrs = factory.build(sequence);
        return this.db[collection].insert(attrs);
      }
    }, {
      key: 'createList',
      value: function createList(type, amount, overrides) {
        var list = [];

        for (var i = 0; i < amount; i++) {
          list.push(this.create(type, overrides));
        }

        return list;
      }
    }, {
      key: 'shutdown',
      value: function shutdown() {
        this.pretender.shutdown();
        if (this.environment === 'test') {
          window.server = undefined;
        }
      }
    }, {
      key: '_defineRouteHandlerHelpers',
      value: function _defineRouteHandlerHelpers() {
        var _this3 = this;

        [['get'], ['post'], ['put'], ['delete', 'del'], ['patch']].forEach(function (_ref3) {
          var _ref32 = _slicedToArray(_ref3, 2);

          var verb = _ref32[0];
          var alias = _ref32[1];

          _this3[verb] = function (path) {
            for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
              args[_key3 - 1] = arguments[_key3];
            }

            _this3._registerRouteHandler(verb, path, args);
          };

          if (alias) {
            _this3[alias] = _this3[verb];
          }
        });
      }
    }, {
      key: '_registerRouteHandler',
      value: function _registerRouteHandler(verb, path, args) {
        var _this4 = this;

        var dbOrSchema = this.schema || this.db;
        var routeHandler = new _emberCliMirageRouteHandler['default'](dbOrSchema, verb, args, this.serializerOrRegistry);
        var fullPath = this._getFullPath(path);

        this.pretender[verb](fullPath, function (request) {
          var rackResponse = routeHandler.handle(request);

          var shouldLog = typeof _this4.logging !== 'undefined' ? _this4.logging : _this4.environment !== 'test';

          if (shouldLog) {
            console.log('Successful request: ' + verb.toUpperCase() + ' ' + request.url);
            console.log(rackResponse[2]);
          }

          return rackResponse;
        }, function () {
          return _this4.timing;
        });
      }
    }, {
      key: '_hasModulesOfType',
      value: function _hasModulesOfType(modules, type) {
        var modulesOfType = modules[type] || {};

        return _.keys(modulesOfType).length > 0;
      }

      /*
        Builds a full path for Pretender to monitor based on the `path` and
        configured options (`urlPrefix` and `namespace`).
      */
    }, {
      key: '_getFullPath',
      value: function _getFullPath(path) {
        path = path[0] === '/' ? path.slice(1) : path;
        var fullPath = '';
        var urlPrefix = this.urlPrefix ? this.urlPrefix.trim() : '';
        var namespace = this.namespace ? this.namespace.trim() : '';

        // check to see if path is a FQDN. if so, ignore any urlPrefix/namespace that was set
        if (/^https?:\/\//.test(path)) {
          fullPath += path;
        } else {

          // otherwise, if there is a urlPrefix, use that as the beginning of the path
          if (!!urlPrefix.length) {
            fullPath += urlPrefix[urlPrefix.length - 1] === '/' ? urlPrefix : urlPrefix + '/';
          }

          // if a namespace has been configured, add it before the path
          if (!!namespace.length) {
            fullPath += namespace ? namespace + '/' : namespace;
          }

          // finally add the configured path
          fullPath += path;
        }

        return fullPath;
      }
    }]);

    return Server;
  })();

  exports['default'] = Server;
});