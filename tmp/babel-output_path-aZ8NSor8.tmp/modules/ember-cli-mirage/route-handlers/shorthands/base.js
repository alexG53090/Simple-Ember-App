var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

import { singularize, capitalize, camelize } from 'ember-cli-mirage/utils/inflector';

var _ref = _;
var isArray = _ref.isArray;

var allDigitsRegex = /^\d+$/;

var BaseShorthandRouteHandler = (function () {
  function BaseShorthandRouteHandler(dbOrSchema, serializerOrRegistry, shorthand, options) {
    _classCallCheck(this, BaseShorthandRouteHandler);

    this.dbOrSchema = dbOrSchema;
    this.serializerOrRegistry = serializerOrRegistry;
    this.shorthand = shorthand;
    this.options = options;
  }

  _createClass(BaseShorthandRouteHandler, [{
    key: 'handle',
    value: function handle(request) {
      var type = isArray(this.shorthand) ? 'array' : typeof this.shorthand;
      var typeHandler = 'handle' + capitalize(type) + 'Shorthand';

      return this[typeHandler](this.shorthand, this.dbOrSchema, request, this.options);
    }
  }, {
    key: '_getIdForRequest',
    value: function _getIdForRequest(request) {
      var id = undefined;

      if (request && request.params && request.params.id) {
        id = request.params.id;
        // If parses, coerce to integer
        if (typeof id === "string" && allDigitsRegex.test(id)) {
          id = parseInt(request.params.id, 10);
        }
      }

      return id;
    }
  }, {
    key: '_getUrlForRequest',
    value: function _getUrlForRequest(request) {
      var url = undefined;

      if (request && request.url) {
        url = request.url;
      }

      return url;
    }
  }, {
    key: '_getTypeFromUrl',
    value: function _getTypeFromUrl(url, hasId) {
      var urlNoId = hasId ? url.substr(0, url.lastIndexOf('/')) : url;
      var urlSplit = urlNoId.split("?");
      var urlNoIdNoQuery = urlSplit[0].slice(-1) === '/' ? urlSplit[0].slice(0, -1) : urlSplit[0];
      var type = singularize(urlNoIdNoQuery.substr(urlNoIdNoQuery.lastIndexOf('/') + 1));

      return type;
    }
  }, {
    key: '_getJsonBodyForRequest',
    value: function _getJsonBodyForRequest(request) {
      var body = undefined;

      if (request && request.requestBody) {
        body = JSON.parse(request.requestBody);
      }

      return body;
    }
  }, {
    key: '_getAttrsForRequest',
    value: function _getAttrsForRequest(request) {
      var id = this._getIdForRequest(request);
      var json = this._getJsonBodyForRequest(request);
      var jsonApiDoc = this.serializerOrRegistry.normalize(json);
      var attrs = {};
      Object.keys(jsonApiDoc.data.attributes).forEach(function (key) {
        attrs[camelize(key)] = jsonApiDoc.data.attributes[key];
      });

      attrs.id = id;

      return attrs;
    }
  }]);

  return BaseShorthandRouteHandler;
})();

export default BaseShorthandRouteHandler;