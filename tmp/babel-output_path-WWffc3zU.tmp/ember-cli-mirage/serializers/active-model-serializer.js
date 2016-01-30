define('ember-cli-mirage/serializers/active-model-serializer', ['exports', 'ember-cli-mirage/serializer', 'ember-cli-mirage/utils/inflector'], function (exports, _emberCliMirageSerializer, _emberCliMirageUtilsInflector) {
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

    normalize: function normalize(payload) {
      // let payload = {contact: {id: 1, name: "Linkz0r"}};
      var type = Object.keys(payload)[0];
      var attrs = payload[type];

      var jsonApiPayload = {
        data: {
          type: (0, _emberCliMirageUtilsInflector.pluralize)(type),
          attributes: {}
        }
      };
      if (attrs.id) {
        jsonApiPayload.data.id = attrs.id;
      }
      Object.keys(attrs).forEach(function (key) {
        if (key !== 'id') {
          jsonApiPayload.data.attributes[key] = attrs[key];
        }
      });

      return jsonApiPayload;
    }

  });
});