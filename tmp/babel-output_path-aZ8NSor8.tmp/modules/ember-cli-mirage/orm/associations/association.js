function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Association = function Association(type) {
  _classCallCheck(this, Association);

  this.type = type;

  // The model type that owns this association
  this.owner = '';

  // The model type this association refers to
  this.target = '';
};

export default Association;