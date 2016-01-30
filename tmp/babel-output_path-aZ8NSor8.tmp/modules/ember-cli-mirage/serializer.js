var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/* global _ */
import Model from './orm/model';
import extend from './utils/extend';
import { singularize, pluralize } from './utils/inflector';

var Serializer = (function () {
  function Serializer() {
    _classCallCheck(this, Serializer);
  }

  // Defaults

  _createClass(Serializer, [{
    key: 'serialize',
    value: function serialize(response, request) {
      if (response instanceof Model) {
        return this._attrsForModel(response);
      } else {
        return response;
      }
    }
  }, {
    key: 'keyForAttribute',
    value: function keyForAttribute(attr) {
      return attr;
    }
  }, {
    key: 'keyForRelatedCollection',
    value: function keyForRelatedCollection(type) {
      return pluralize(type);
    }
  }, {
    key: 'keyForRelationshipIds',
    value: function keyForRelationshipIds(type) {
      return singularize(type) + 'Ids';
    }
  }, {
    key: 'normalize',
    value: function normalize(json) {
      return json;
    }
  }, {
    key: '_attrsForModel',
    value: function _attrsForModel(model) {
      var attrs = {};

      if (this.attrs) {
        attrs = this.attrs.reduce(function (memo, attr) {
          memo[attr] = model[attr];
          return memo;
        }, {});
      } else {
        attrs = _.assign(attrs, model.attrs);
      }

      return this._formatAttributeKeys(attrs);
    }
  }, {
    key: '_formatAttributeKeys',
    value: function _formatAttributeKeys(attrs) {
      var formattedAttrs = {};

      for (var key in attrs) {
        var formattedKey = this.keyForAttribute(key);
        formattedAttrs[formattedKey] = attrs[key];
      }

      return formattedAttrs;
    }
  }]);

  return Serializer;
})();

Serializer.prototype.relationships = [];
Serializer.prototype.root = true;
Serializer.prototype.embed = false;

Serializer.extend = extend;

export default Serializer;