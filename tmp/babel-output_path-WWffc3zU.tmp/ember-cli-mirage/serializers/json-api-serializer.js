define('ember-cli-mirage/serializers/json-api-serializer', ['exports', 'ember-cli-mirage/serializer', 'ember-cli-mirage/utils/inflector'], function (exports, _emberCliMirageSerializer, _emberCliMirageUtilsInflector) {
  'use strict';

  exports['default'] = _emberCliMirageSerializer['default'].extend({

    keyForAttribute: function keyForAttribute(attr) {
      return (0, _emberCliMirageUtilsInflector.decamelize)(attr);
    },

    keyForRelatedCollection: function keyForRelatedCollection(type) {
      return (0, _emberCliMirageUtilsInflector.pluralize)((0, _emberCliMirageUtilsInflector.decamelize)(type));
    },

    keyForRelationshipIds: function keyForRelationshipIds(type) {
      return (0, _emberCliMirageUtilsInflector.decamelize)(type) + '_ids';
    },

    normalize: function normalize(json) {
      return json;
    }

  });
});