define('ember-cli-mirage/index', ['exports', 'ember-cli-mirage/factory', 'ember-cli-mirage/response', 'ember-cli-mirage/faker', 'ember-cli-mirage/orm/model', 'ember-cli-mirage/serializer', 'ember-cli-mirage/orm/associations/has-many', 'ember-cli-mirage/orm/associations/belongs-to'], function (exports, _emberCliMirageFactory, _emberCliMirageResponse, _emberCliMirageFaker, _emberCliMirageOrmModel, _emberCliMirageSerializer, _emberCliMirageOrmAssociationsHasMany, _emberCliMirageOrmAssociationsBelongsTo) {
  'use strict';

  function hasMany(type) {
    return new _emberCliMirageOrmAssociationsHasMany['default'](type);
  }
  function belongsTo(type) {
    return new _emberCliMirageOrmAssociationsBelongsTo['default'](type);
  }

  exports.Factory = _emberCliMirageFactory['default'];
  exports.Response = _emberCliMirageResponse['default'];
  exports.faker = _emberCliMirageFaker['default'];
  exports.Model = _emberCliMirageOrmModel['default'];
  exports.Serializer = _emberCliMirageSerializer['default'];
  exports.hasMany = hasMany;
  exports.belongsTo = belongsTo;
  exports['default'] = {
    Factory: _emberCliMirageFactory['default'],
    Response: _emberCliMirageResponse['default'],
    hasMany: hasMany,
    belongsTo: belongsTo
  };
});