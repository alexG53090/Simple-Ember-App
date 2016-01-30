var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import Association from './association';
import Collection from '../collection';
import { capitalize } from 'ember-cli-mirage/utils/inflector';

var HasMany = (function (_Association) {
  _inherits(HasMany, _Association);

  function HasMany() {
    _classCallCheck(this, HasMany);

    _get(Object.getPrototypeOf(HasMany.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(HasMany, [{
    key: 'getForeignKeyArray',

    /*
      The hasMany association adds a fk to the target of the association
    */
    value: function getForeignKeyArray() {
      return [this.target, this.owner + 'Id'];
    }
  }, {
    key: 'getForeignKey',
    value: function getForeignKey() {
      return this.owner + 'Id';
    }
  }, {
    key: 'addMethodsToModelClass',
    value: function addMethodsToModelClass(ModelClass, key, schema) {
      var modelPrototype = ModelClass.prototype;
      this._model = modelPrototype;
      this._key = key;

      var association = this;
      var foreignKey = this.getForeignKey();
      var relationshipIdsKey = association.target + 'Ids';

      var associationHash = _defineProperty({}, key, this);
      modelPrototype.hasManyAssociations = _.assign(modelPrototype.hasManyAssociations, associationHash);
      modelPrototype.associationKeys.push(key);
      modelPrototype.associationIdKeys.push(relationshipIdsKey);

      Object.defineProperty(modelPrototype, relationshipIdsKey, {

        /*
          object.childrenIds
            - returns an array of the associated children's ids
        */
        get: function get() {
          var models = association._cachedChildren || [];

          if (!this.isNew()) {
            var query = _defineProperty({}, foreignKey, this.id);
            var savedModels = schema[association.target].where(query);

            models = savedModels.mergeCollection(models);
          }

          return models.map(function (model) {
            return model.id;
          });
        },

        /*
          object.childrenIds = ([childrenIds...])
            - sets the associated parent (via id)
        */
        set: function set(ids) {
          ids = ids || [];

          if (this.isNew()) {
            association._cachedChildren = schema[association.target].find(ids);
          } else {
            // Set current children's fk to null
            var query = _defineProperty({}, foreignKey, this.id);
            schema[association.target].where(query).update(foreignKey, null);

            // Associate the new childrens to this model
            schema[association.target].find(ids).update(foreignKey, this.id);

            // Clear out any old cached children
            association._cachedChildren = [];
          }

          return this;
        }
      });

      Object.defineProperty(modelPrototype, key, {

        /*
          object.children
            - returns an array of associated children
        */
        get: function get() {
          var tempModels = association._cachedChildren || [];

          if (this.isNew()) {
            return tempModels;
          } else {
            var query = {};
            query[foreignKey] = this.id;
            var savedModels = schema[association.target].where(query);

            return savedModels.mergeCollection(tempModels);
          }
        },

        /*
          object.children = [model1, model2, ...]
            - sets the associated children (via array of models)
            - note: this method will persist unsaved chidren
              + (why? because rails does)
        */
        set: function set(models) {
          models = models ? _.compact(models) : [];

          if (this.isNew()) {
            association._cachedChildren = models instanceof Collection ? models : new Collection(association.target, models);
          } else {

            // Set current children's fk to null
            var query = _defineProperty({}, foreignKey, this.id);
            schema[association.target].where(query).update(foreignKey, null);

            // Save any children that are new
            models.filter(function (model) {
              return model.isNew();
            }).forEach(function (model) {
              return model.save();
            });

            // Associate the new children to this model
            schema[association.target].find(models.map(function (m) {
              return m.id;
            })).update(foreignKey, this.id);

            // Clear out any old cached children
            association._cachedChildren = [];
          }
        }
      });

      /*
        object.newChild
          - creates a new unsaved associated child
      */
      modelPrototype['new' + capitalize(association.target)] = function (attrs) {
        if (!this.isNew()) {
          attrs = _.assign(attrs, _defineProperty({}, foreignKey, this.id));
        }

        var child = schema[association.target]['new'](attrs);

        association._cachedChildren = association._cachedChildren || new Collection(association.target);
        association._cachedChildren.push(child);

        return child;
      };

      /*
        object.createChild
          - creates an associated child, persists directly to db, and
            updates the target's foreign key
          - parent must be saved
      */
      modelPrototype['create' + capitalize(association.target)] = function (attrs) {
        if (this.isNew()) {
          throw 'You cannot call create unless the parent is saved';
        }

        var augmentedAttrs = _.assign(attrs, _defineProperty({}, foreignKey, this.id));
        var child = schema[association.target].create(augmentedAttrs);

        return child;
      };
    }
  }]);

  return HasMany;
})(Association);

export default HasMany;