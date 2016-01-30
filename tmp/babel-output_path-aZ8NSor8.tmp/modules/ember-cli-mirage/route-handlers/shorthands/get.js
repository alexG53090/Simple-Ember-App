var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import BaseShorthandRouteHandler from './base';
import Response from 'ember-cli-mirage/response';
import { singularize, pluralize } from 'ember-cli-mirage/utils/inflector';
import Db from 'ember-cli-mirage/db';

var GetShorthandRouteHandler = (function (_BaseShorthandRouteHandler) {
  _inherits(GetShorthandRouteHandler, _BaseShorthandRouteHandler);

  function GetShorthandRouteHandler() {
    _classCallCheck(this, GetShorthandRouteHandler);

    _get(Object.getPrototypeOf(GetShorthandRouteHandler.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(GetShorthandRouteHandler, [{
    key: 'handleStringShorthand',

    /*
      Retrieve *key* from the db. If it's singular,
      retrieve a single model by id.
       Examples:
        this.stub('get', '/contacts', 'contacts');
        this.stub('get', '/contacts/:id', 'contact');
    */
    value: function handleStringShorthand(string, dbOrSchema, request) {
      var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      var id = this._getIdForRequest(request);

      if (dbOrSchema instanceof Db) {
        var db = dbOrSchema;
        var key = string;
        var collection = pluralize(string);
        var data = {};
        var record = undefined;

        if (!db[collection]) {
          console.error("Mirage: The route handler for " + request.url + " is requesting data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
        }

        if (id) {
          record = db[collection].find(id);
          if (!record) {
            return new Response(404, {}, {});
          }
          data[key] = record;
        } else if (options.coalesce && request.queryParams && request.queryParams.ids) {
          data[key] = db[collection].find(request.queryParams.ids);
        } else {
          data[key] = db[collection];
        }
        return data;
      } else {
        var schema = dbOrSchema;
        var type = singularize(string);

        if (id) {
          return schema[type].find(id);
        } else if (options.coalesce && request.queryParams && request.queryParams.ids) {
          return schema[type].find(request.queryParams.ids);
        } else {
          return schema[type].all();
        }
      }
    }

    /*
      Retrieve *keys* from the db.
       If all keys plural, retrieve all objects from db.
        Ex: this.stub('get', '/contacts', ['contacts', 'pictures']);
        If first is singular, find first by id, and filter all
      subsequent models by related.
        Ex: this.stub('get', '/contacts/:id', ['contact', 'addresses']);
    */
  }, {
    key: 'handleArrayShorthand',
    value: function handleArrayShorthand(array, dbOrSchema, request) {
      var _this = this;

      var keys = array;
      var owner;
      var ownerKey;

      if (dbOrSchema instanceof Db) {
        var _ret = (function () {
          var data = {};
          var db = dbOrSchema;

          keys.forEach(function (key) {
            var collection = pluralize(key);

            if (!db[collection]) {
              console.error("Mirage: The route handler for " + request.url + " is requesting data from the " + collection + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.");
            }

            // There's an owner. Find only related.
            if (ownerKey) {
              var ownerIdKey = singularize(ownerKey) + '_id';
              var query = {};
              query[ownerIdKey] = owner.id;
              data[key] = db[collection].where(query);
            } else {

              // TODO: This is a crass way of checking if we're looking for a single model, doens't work for e.g. sheep
              if (singularize(key) === key) {
                ownerKey = key;
                var id = _this._getIdForRequest(request);
                var model = db[collection].find(id);
                data[key] = model;
                owner = model;
              } else {
                data[key] = db[collection];
              }
            }
          });

          return {
            v: data
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      } else {
        var _ret2 = (function () {
          var schema = dbOrSchema;
          var id = _this._getIdForRequest(request);

          /*
          If the first key is singular and we have an id param in
          the request, we're dealing with the version of the shorthand
          that has a parent model and several has-many relationships.
          We throw an error, because the serializer is the appropriate
          place for this now.
          */
          if (id && singularize(keys[0]) === keys[0]) {
            throw 'Mirage: It looks like you\'re using the "Single record with\n        related records" version of the array shorthand, in addition to opting\n        in to the model layer. This shorthand was made when there was no\n        serializer layer. Now that you\'re using models, please ensure your\n        relationships are defined, and create a serializer for the parent\n        model, adding the relationships there.';
          } else {
            return {
              v: keys.map(function (type) {
                return schema[singularize(type)].all();
              })
            };
          }
        })();

        if (typeof _ret2 === 'object') return _ret2.v;
      }
    }

    /*
      Retrieve objects from the db based on singular version
      of the last portion of the url.
       This would return all contacts:
        Ex: this.stub('get', '/contacts');
       If an id is present, return a single model by id.
        Ex: this.stub('get', '/contacts/:id');
       If the options contain a `coalesce: true` option and the queryParams have `ids`, it
      returns the models with those ids.
        Ex: this.stub('get', '/contacts/:id');
    */
  }, {
    key: 'handleUndefinedShorthand',
    value: function handleUndefinedShorthand(undef, dbOrSchema, request, options) {
      var id = this._getIdForRequest(request);
      var url = this._getUrlForRequest(request);
      var type = this._getTypeFromUrl(url, id);
      var str = id ? type : pluralize(type);

      return this.handleStringShorthand(str, dbOrSchema, request, options);
    }
  }]);

  return GetShorthandRouteHandler;
})(BaseShorthandRouteHandler);

export default GetShorthandRouteHandler;