/*
  An array of models, returned from one of the schema query
  methods (all, find, where). Knows how to update and destroy its models.
*/
var Collection = function Collection(type) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (!type || typeof type !== 'string') {
    throw 'You must pass a type into a Collection';
  }
  this.type = type;

  if (_.isArray(args[0])) {
    args = args[0];
  }
  this.push.apply(this, args);

  this.update = function (key, val) {
    this.forEach(function (model) {
      model.update(key, val);
    });
  };

  this.destroy = function () {
    this.forEach(function (model) {
      model.destroy();
    });
  };

  this.save = function () {
    this.forEach(function (model) {
      model.save();
    });
  };

  this.reload = function () {
    this.forEach(function (model) {
      model.reload();
    });
  };

  this.mergeCollection = function (collection) {
    var _this = this;

    collection.forEach(function (model) {
      _this.push(model);
    });

    return this;
  };

  return this;
};

Collection.prototype = Object.create(Array.prototype);

export default Collection;