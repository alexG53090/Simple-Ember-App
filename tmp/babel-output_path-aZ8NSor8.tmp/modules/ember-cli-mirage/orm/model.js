var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

import { pluralize } from '../utils/inflector';
import extend from '../utils/extend';

/*
  The Model class. Notes:

  - We need to pass in type, because models are created with
    .extend and anonymous functions, so you cannot use
    reflection to find the name of the constructor.
*/

/*
  Constructor
*/

var Model = (function () {
  function Model(schema, type, attrs, fks) {
    _classCallCheck(this, Model);

    if (!schema) {
      throw 'Mirage: A model requires a schema';
    }
    if (!type) {
      throw 'Mirage: A model requires a type';
    }

    this._schema = schema;
    this.type = type;
    this.fks = fks || [];
    attrs = attrs || {};

    this._setupAttrs(attrs);
    this._setupRelationships(attrs);

    return this;
  }

  /*
    Create or save the model
  */

  _createClass(Model, [{
    key: 'save',
    value: function save() {
      var collection = pluralize(this.type);

      if (this.isNew()) {
        // Update the attrs with the db response
        this.attrs = this._schema.db[collection].insert(this.attrs);

        // Ensure the id getter/setter is set
        this._definePlainAttribute('id');
      } else {
        this._schema.db[collection].update(this.attrs.id, this.attrs);
      }

      // Update associated children
      this._saveAssociations();

      return this;
    }

    /*
      Update the db record
    */
  }, {
    key: 'update',
    value: function update(key, val) {
      var _this = this;
      var attrs;
      if (key == null) {
        return this;
      }

      if (typeof key === 'object') {
        attrs = key;
      } else {
        (attrs = {})[key] = val;
      }

      Object.keys(attrs).forEach(function (attr) {
        _this[attr] = attrs[attr];
      });

      this.save();

      return this;
    }

    /*
      Destroy the db record
    */
  }, {
    key: 'destroy',
    value: function destroy() {
      var collection = pluralize(this.type);
      this._schema.db[collection].remove(this.attrs.id);
    }
  }, {
    key: 'isNew',
    value: function isNew() {
      return this.attrs.id === undefined || this.attrs.id === null;
    }
  }, {
    key: 'isSaved',
    value: function isSaved() {
      return this.attrs.id !== undefined && this.attrs.id !== null;
    }

    /*
      Reload data from the db
    */
  }, {
    key: 'reload',
    value: function reload() {
      var _this = this;
      var collection = pluralize(this.type);
      var attrs = this._schema.db[collection].find(this.id);

      Object.keys(attrs).filter(function (attr) {
        return attr !== 'id';
      }).forEach(function (attr) {
        _this[attr] = attrs[attr];
      });
    }

    // Private
    /*
      model.attrs represents the persistable attributes, i.e. your db
      table fields.
    */
  }, {
    key: '_setupAttrs',
    value: function _setupAttrs(attrs) {
      var _this = this;

      // Filter out association keys
      var hash = Object.keys(attrs).reduce(function (memo, attr) {
        if (_this.associationKeys.indexOf(attr) === -1 && _this.associationIdKeys.indexOf(attr) === -1) {
          memo[attr] = attrs[attr];
        }

        return memo;
      }, {});

      // Ensure fks are there
      this.fks.map(function (fk) {
        hash[fk] = attrs[fk] || null;
      });

      this.attrs = hash;

      // define plain getter/setters for non-association keys
      Object.keys(hash).forEach(function (attr) {
        if (_this.associationKeys.indexOf(attr) === -1 && _this.associationIdKeys.indexOf(attr) === -1) {
          _this._definePlainAttribute(attr);
        }
      });
    }

    /*
      Define getter/setter for a plain attribute
    */
  }, {
    key: '_definePlainAttribute',
    value: function _definePlainAttribute(attr) {
      if (this[attr] !== undefined) {
        return;
      }

      // Ensure the attribute is on the attrs hash
      if (!this.attrs.hasOwnProperty(attr)) {
        this.attrs[attr] = null;
      }

      // Define the getter/setter
      Object.defineProperty(this, attr, {
        get: function get() {
          return this.attrs[attr];
        },
        set: function set(val) {
          this.attrs[attr] = val;return this;
        }
      });
    }
  }, {
    key: '_setupRelationships',
    value: function _setupRelationships(attrs) {
      var _this = this;

      // Only want association keys and fks
      var hash = Object.keys(attrs).reduce(function (memo, attr) {
        if (_this.associationKeys.indexOf(attr) > -1 || _this.associationIdKeys.indexOf(attr) > -1 || _this.fks.indexOf(attr) > -1) {
          memo[attr] = attrs[attr];
        }

        return memo;
      }, {});

      Object.keys(hash).forEach(function (attr) {
        _this[attr] = hash[attr];
      });
    }
  }, {
    key: '_saveAssociations',
    value: function _saveAssociations() {
      var _this2 = this;

      Object.keys(this.belongsToAssociations).forEach(function (key) {
        var association = _this2.belongsToAssociations[key];
        var parent = _this2[key];
        if (parent.isNew()) {
          var fk = association.getForeignKey();
          parent.save();
          _this2.update(fk, parent.id);
        }
      });

      Object.keys(this.hasManyAssociations).forEach(function (key) {
        var association = _this2.hasManyAssociations[key];
        var children = _this2[key];
        children.update(association.getForeignKey(), _this2.id);
      });
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'model:' + this.type + '(' + this.id + ')';
    }
  }]);

  return Model;
})();

Model.extend = extend;

export default Model;