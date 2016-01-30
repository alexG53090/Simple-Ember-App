var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import Association from './association';
import { capitalize } from 'ember-cli-mirage/utils/inflector';

var BelongsTo = (function (_Association) {
  _inherits(BelongsTo, _Association);

  function BelongsTo() {
    _classCallCheck(this, BelongsTo);

    _get(Object.getPrototypeOf(BelongsTo.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(BelongsTo, [{
    key: 'getForeignKeyArray',

    /*
      The belongsTo association adds a fk to the owner of the association
    */
    value: function getForeignKeyArray() {
      return [this.owner, this.target + 'Id'];
    }
  }, {
    key: 'getForeignKey',
    value: function getForeignKey() {
      return this.target + 'Id';
    }
  }, {
    key: 'addMethodsToModelClass',
    value: function addMethodsToModelClass(ModelClass, key, schema) {
      var modelPrototype = ModelClass.prototype;
      var association = this;
      var foreignKey = this.getForeignKey();

      var associationHash = {};
      associationHash[key] = this;
      modelPrototype.belongsToAssociations = _.assign(modelPrototype.belongsToAssociations, associationHash);
      modelPrototype.associationKeys.push(key);
      modelPrototype.associationIdKeys.push(foreignKey);

      Object.defineProperty(modelPrototype, this.getForeignKey(), {

        /*
          object.parentId
            - returns the associated parent's id
        */
        get: function get() {
          return this.attrs[foreignKey];
        },

        /*
          object.parentId = (parentId)
            - sets the associated parent (via id)
        */
        set: function set(id) {
          if (id && !schema[association.target].find(id)) {
            throw 'Couldn\'t find ' + association.target + ' with id = ' + id;
          }

          this.attrs[foreignKey] = id;
          return this;
        }
      });

      Object.defineProperty(modelPrototype, key, {
        /*
          object.parent
            - returns the associated parent
        */
        get: function get() {
          var foreignKeyId = this[foreignKey];
          if (foreignKeyId) {
            association._tempParent = null;
            return schema[association.target].find(foreignKeyId);
          } else if (association._tempParent) {
            return association._tempParent;
          } else {
            return null;
          }
        },

        /*
          object.parent = (parentModel)
            - sets the associated parent (via model)
        */
        set: function set(newModel) {
          if (newModel && newModel.isNew()) {
            this[foreignKey] = null;
            association._tempParent = newModel;
          } else if (newModel) {
            association._tempParent = null;
            this[foreignKey] = newModel.id;
          } else {
            association._tempParent = null;
            this[foreignKey] = null;
          }
        }
      });

      /*
        object.newParent
          - creates a new unsaved associated parent
      */
      modelPrototype['new' + capitalize(key)] = function (attrs) {
        var parent = schema[key]['new'](attrs);

        this[key] = parent;

        return parent;
      };

      /*
        object.createParent
          - creates an associated parent, persists directly to db,
            and updates the owner's foreign key
      */
      modelPrototype['create' + capitalize(key)] = function (attrs) {
        var parent = schema[key].create(attrs);

        this[foreignKey] = parent.id;

        return parent;
      };
    }
  }]);

  return BelongsTo;
})(Association);

export default BelongsTo;