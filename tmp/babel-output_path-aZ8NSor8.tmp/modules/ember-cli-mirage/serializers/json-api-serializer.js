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

  normalize: function normalize(json) {
    return json;
  }

});