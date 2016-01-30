var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

import Model from 'ember-cli-mirage/orm/model';
import Collection from 'ember-cli-mirage/orm/collection';
import ActiveModelSerializer from 'ember-cli-mirage/serializers/active-model-serializer';
import { pluralize } from './utils/inflector';

var _ref3 = _;
var isArray = _ref3.isArray;
var assign = _ref3.assign;

var SerializerRegistry = (function () {
  function SerializerRegistry(schema) {
    var serializerMap = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, SerializerRegistry);

    this.schema = schema;
    this.baseSerializer = new ActiveModelSerializer();
    this._serializerMap = serializerMap;
  }

  _createClass(SerializerRegistry, [{
    key: 'serialize',
    value: function serialize(response) {
      var _this = this;

      this.alreadySerialized = {};

      if (this._isModelOrCollection(response)) {
        var serializer = this._serializerFor(response);

        if (serializer.embed) {
          var json = undefined;

          if (this._isModel(response)) {
            json = this._serializeModel(response);
          } else {
            json = response.reduce(function (allAttrs, model) {
              allAttrs.push(_this._serializeModel(model));
              _this._resetAlreadySerialized();

              return allAttrs;
            }, []);
          }

          return this._formatResponse(response, json);
        } else {
          return this._serializeSideloadedModelOrCollection(response);
        }

        /*
          Special case for an array of assorted collections (e.g. different types).
           The array shorthand can return this, e.g.
            this.get('/home', ['authors', 'photos'])
        */
      } else if (isArray(response) && response.filter(function (item) {
          return _this._isCollection(item);
        }).length) {
          return response.reduce(function (json, collection) {
            var serializer = _this._serializerFor(collection);

            if (serializer.embed) {
              json[pluralize(collection.type)] = _this._serializeModelOrCollection(collection);
            } else {
              json = assign(json, _this._serializeSideloadedModelOrCollection(collection));
            }

            return json;
          }, {});
        } else {
          return response;
        }
    }
  }, {
    key: '_serializeSideloadedModelOrCollection',
    value: function _serializeSideloadedModelOrCollection(modelOrCollection) {
      var _this2 = this;

      if (this._isModel(modelOrCollection)) {
        return this._serializeSideloadedModelResponse(modelOrCollection);
      } else if (modelOrCollection.length) {

        return modelOrCollection.reduce(function (allAttrs, model) {
          _this2._augmentAlreadySerialized(model);
          return _this2._serializeSideloadedModelResponse(model, true, allAttrs);
        }, {});

        // We have an empty collection
      } else {
          return _defineProperty({}, pluralize(modelOrCollection.type), []);
        }
    }
  }, {
    key: '_serializeSideloadedModelResponse',
    value: function _serializeSideloadedModelResponse(model) {
      var topLevelIsArray = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var _this3 = this;

      var allAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
      var root = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

      var serializer = this._serializerFor(model);

      // Add this model's attrs
      this._augmentAlreadySerialized(model);
      var modelAttrs = this._attrsForModel(model, false, true);
      var key = model.type;
      if (topLevelIsArray) {
        key = root ? root : pluralize(key);
        allAttrs[key] = allAttrs[key] || [];
        allAttrs[key].push(modelAttrs);
      } else {
        allAttrs[key] = modelAttrs;
      }

      // Traverse this model's relationships
      serializer.relationships.map(function (key) {
        return model[key];
      }).forEach(function (relationship) {
        var relatedModels = _this3._isModel(relationship) ? [relationship] : relationship;

        relatedModels.forEach(function (relatedModel) {
          if (_this3._hasBeenSerialized(relatedModel)) {
            return;
          }

          _this3._serializeSideloadedModelResponse(relatedModel, true, allAttrs, serializer.keyForRelatedCollection(relatedModel.type));
        });
      });

      return allAttrs;
    }
  }, {
    key: '_formatResponse',
    value: function _formatResponse(modelOrCollection, attrs) {
      var serializer = this._serializerFor(modelOrCollection);
      var key = modelOrCollection.type;

      if (this._isCollection(modelOrCollection)) {
        key = pluralize(key);
      }

      return serializer.root ? _defineProperty({}, key, attrs) : attrs;
    }
  }, {
    key: '_serializeModelOrCollection',
    value: function _serializeModelOrCollection(modelOrCollection, removeForeignKeys, serializeRelationships) {
      var _this4 = this;

      if (this._isModel(modelOrCollection)) {
        return this._serializeModel(modelOrCollection, removeForeignKeys, serializeRelationships);
      } else {
        return modelOrCollection.map(function (model) {
          return _this4._serializeModel(model, removeForeignKeys, serializeRelationships);
        });
      }
    }
  }, {
    key: '_serializeModel',
    value: function _serializeModel(model) {
      var removeForeignKeys = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
      var serializeRelationships = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      if (this._hasBeenSerialized(model)) {
        return;
      }

      var attrs = this._attrsForModel(model, removeForeignKeys);

      this._augmentAlreadySerialized(model);
      var relatedAttrs = serializeRelationships ? this._attrsForRelationships(model) : {};

      return _.assign(attrs, relatedAttrs);
    }
  }, {
    key: '_attrsForModel',
    value: function _attrsForModel(model, removeForeignKeys, embedRelatedIds) {
      var _this5 = this;

      var serializer = this._serializerFor(model);
      var attrs = serializer.serialize(model);

      if (removeForeignKeys) {
        model.fks.forEach(function (key) {
          delete attrs[key];
        });
      }

      if (embedRelatedIds) {
        serializer.relationships.map(function (key) {
          return model[key];
        }).filter(function (relatedCollection) {
          return _this5._isCollection(relatedCollection);
        }).forEach(function (relatedCollection) {
          attrs[serializer.keyForRelationshipIds(relatedCollection.type)] = relatedCollection.map(function (obj) {
            return obj.id;
          });
        });
      }

      return attrs;
    }
  }, {
    key: '_attrsForRelationships',
    value: function _attrsForRelationships(model) {
      var _this6 = this;

      var serializer = this._serializerFor(model);

      return serializer.relationships.reduce(function (attrs, key) {
        var relatedAttrs = _this6._serializeModelOrCollection(model[key]);

        if (relatedAttrs) {
          attrs[key] = relatedAttrs;
        }

        return attrs;
      }, {});
    }
  }, {
    key: '_hasBeenSerialized',
    value: function _hasBeenSerialized(model) {
      var relationshipKey = model.type + 'Ids';

      return this.alreadySerialized[relationshipKey] && this.alreadySerialized[relationshipKey].indexOf(model.id) > -1;
    }
  }, {
    key: '_augmentAlreadySerialized',
    value: function _augmentAlreadySerialized(model) {
      var modelKey = model.type + 'Ids';

      this.alreadySerialized[modelKey] = this.alreadySerialized[modelKey] || [];
      this.alreadySerialized[modelKey].push(model.id);
    }
  }, {
    key: '_resetAlreadySerialized',
    value: function _resetAlreadySerialized() {
      this.alreadySerialized = {};
    }
  }, {
    key: '_serializerFor',
    value: function _serializerFor(modelOrCollection) {
      var type = modelOrCollection.type;
      var ModelSerializer = this._serializerMap && (this._serializerMap[type] || this._serializerMap['application']);

      if (ModelSerializer && !ModelSerializer.prototype.embed && !ModelSerializer.prototype.root) {
        throw 'Mirage: You cannot have a serializer that sideloads (embed: false) and disables the root (root: false).';
      }

      return ModelSerializer ? new ModelSerializer() : this.baseSerializer;
    }
  }, {
    key: '_isModel',
    value: function _isModel(object) {
      return object instanceof Model;
    }
  }, {
    key: '_isCollection',
    value: function _isCollection(object) {
      return object instanceof Collection;
    }
  }, {
    key: '_isModelOrCollection',
    value: function _isModelOrCollection(object) {
      return this._isModel(object) || this._isCollection(object);
    }
  }]);

  return SerializerRegistry;
})();

export default SerializerRegistry;