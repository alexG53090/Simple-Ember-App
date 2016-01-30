var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import BaseShorthandRouteHandler from './base';
import { pluralize } from 'ember-cli-mirage/utils/inflector';
import Db from 'ember-cli-mirage/db';

var PutShorthandRouteHandler = (function (_BaseShorthandRouteHandler) {
  _inherits(PutShorthandRouteHandler, _BaseShorthandRouteHandler);

  function PutShorthandRouteHandler() {
    _classCallCheck(this, PutShorthandRouteHandler);

    _get(Object.getPrototypeOf(PutShorthandRouteHandler.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PutShorthandRouteHandler, [{
    key: 'handleStringShorthand',

    /*
      Update an object from the db, specifying the type.
         this.stub('put', '/contacts/:id', 'user');
    */
    value: function handleStringShorthand(type, dbOrSchema, request) {
      var id = this._getIdForRequest(request);
      var collection = pluralize(type);

      if (dbOrSchema instanceof Db) {
        var payload = this._getJsonBodyForRequest(request);
        var attrs = payload[type];
        var db = dbOrSchema;
        if (!db[collection]) {
          console.error("Mirage: The route handler for " + request.url + " is trying to modify data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
        }

        var data = db[collection].update(id, attrs);

        var response = {};
        response[type] = data;

        return response;
      } else {
        var attrs = this._getAttrsForRequest(request);
        var schema = dbOrSchema;

        return schema[type].find(id).update(attrs);
      }
    }

    /*
      Update an object from the db based on singular version
      of the last portion of the url.
         this.stub('put', '/contacts/:id');
    */
  }, {
    key: 'handleUndefinedShorthand',
    value: function handleUndefinedShorthand(undef, dbOrSchema, request) {
      var id = this._getIdForRequest(request);
      var url = this._getUrlForRequest(request);
      var type = this._getTypeFromUrl(url, id);

      return this.handleStringShorthand(type, dbOrSchema, request);
    }
  }]);

  return PutShorthandRouteHandler;
})(BaseShorthandRouteHandler);

export default PutShorthandRouteHandler;