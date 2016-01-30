import Serializer from '../serializer';
import { decamelize, pluralize } from '../utils/inflector';

export default Serializer.extend({

  keyForAttribute: function keyForAttribute(attr) {
    return decamelize(attr);
  },

  keyForRelatedCollection: function keyForRelatedCollection(type) {
    return pluralize(decamelize(type));
  },

  keyForRelationshipIds: function keyForRelationshipIds(type) {
    return decamelize(type) + '_ids';
  },

  normalize: function normalize(payload) {
    // let payload = {contact: {id: 1, name: "Linkz0r"}};
    var type = Object.keys(payload)[0];
    var attrs = payload[type];

    var jsonApiPayload = {
      data: {
        type: pluralize(type),
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