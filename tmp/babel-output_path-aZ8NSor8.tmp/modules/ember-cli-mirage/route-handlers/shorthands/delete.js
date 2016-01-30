var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import BaseShorthandRouteHandler from './base';
import { pluralize, singularize } from 'ember-cli-mirage/utils/inflector';
import Db from 'ember-cli-mirage/db';

var DeleteShorthandRouteHandler = (function (_BaseShorthandRouteHandler) {
  _inherits(DeleteShorthandRouteHandler, _BaseShorthandRouteHandler);

  function DeleteShorthandRouteHandler() {
    _classCallCheck(this, DeleteShorthandRouteHandler);

    _get(Object.getPrototypeOf(DeleteShorthandRouteHandler.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DeleteShorthandRouteHandler, [{
    key: 'handleStringShorthand',

    /*
      Remove the model from the db of type *type*.
       This would remove the user with id :id:
        Ex: this.stub('delete', '/contacts/:id', 'user');
    */
    value: function handleStringShorthand(type, dbOrSchema, request) {
      var id = this._getIdForRequest(request);
      var collection = pluralize(type);

      if (dbOrSchema instanceof Db) {
        var db = dbOrSchema;
        if (!db[collection]) {
          console.error("Mirage: The route handler for " + request.url + " is trying to remove data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
        }

        db[collection].remove(id);
      } else {
        var schema = dbOrSchema;

        return schema[type].find(id).destroy();
      }

      return undefined;
    }

    /*
      Remove the model and child related models from the db.
       This would remove the contact with id `:id`, and well
      as this contact's addresses and phone numbers.
        Ex: this.stub('delete', '/contacts/:id', ['contact', 'addresses', 'numbers');
    */
  }, {
    key: 'handleArrayShorthand',
    value: function handleArrayShorthand(array, dbOrSchema, request) {
      var id = this._getIdForRequest(request);
      var parentType = array[0];
      var parentCollection = pluralize(parentType);
      var types = array.slice(1);

      if (dbOrSchema instanceof Db) {
        var query;
        var parentIdKey;

        (function () {
          var db = dbOrSchema;
          if (!db[parentCollection]) {
            console.error("Mirage: The route handler for " + request.url + " is trying to remove data from the " + parentCollection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
          }

          db[parentCollection].remove(id);

          query = {};
          parentIdKey = parentType + '_id';

          query[parentIdKey] = id;

          types.forEach(function (type) {
            var collection = pluralize(type);

            if (!db[collection]) {
              console.error("Mirage: The route handler for " + request.url + " is trying to remove data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
            }

            db[collection].remove(query);
          });
        })();
      } else {
        (function () {
          var schema = dbOrSchema;

          var parent = schema[parentType].find(id);

          // Delete related children
          types.forEach(function (type) {
            parent[type].destroy();
          });

          // Delete the parent
          parent.destroy();
        })();
      }

      return undefined;
    }

    /*
      Remove the model from the db based on singular version
      of the last portion of the url.
       This would remove contact with id :id:
        Ex: this.stub('delete', '/contacts/:id');
    */
  }, {
    key: 'handleUndefinedShorthand',
    value: function handleUndefinedShorthand(undef, dbOrSchema, request) {
      var id = this._getIdForRequest(request);
      var url = this._getUrlForRequest(request);
      var urlNoId = id ? url.substr(0, url.lastIndexOf('/')) : url;
      var type = singularize(urlNoId.substr(urlNoId.lastIndexOf('/') + 1));

      return this.handleStringShorthand(type, dbOrSchema, request);
    }
  }]);

  return DeleteShorthandRouteHandler;
})(BaseShorthandRouteHandler);

export default DeleteShorthandRouteHandler;