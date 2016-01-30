var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

import DbCollection from './db-collection';

/*
  The db, an identity map.
*/

var Db = (function () {
  function Db(initialData) {
    _classCallCheck(this, Db);

    this._collections = [];

    if (initialData) {
      this.loadData(initialData);
    }
  }

  _createClass(Db, [{
    key: 'loadData',
    value: function loadData(data) {
      for (var key in data) {
        this.createCollection(key, data[key]);
      }
    }
  }, {
    key: 'createCollection',
    value: function createCollection(name, initialData) {
      if (!this[name]) {
        var newCollection = new DbCollection(name, initialData);

        Object.defineProperty(this, name, {
          get: function get() {
            var recordsCopy = newCollection.all();

            ['insert', 'find', 'where', 'update', 'remove', 'firstOrCreate'].forEach(function (method) {
              recordsCopy[method] = newCollection[method].bind(newCollection);
            });

            return recordsCopy;
          }
        });

        this._collections.push(newCollection);
      } else if (initialData) {
        this[name].insert(initialData);
      }

      return this;
    }
  }, {
    key: 'createCollections',
    value: function createCollections() {
      var _this = this;

      for (var _len = arguments.length, collections = Array(_len), _key = 0; _key < _len; _key++) {
        collections[_key] = arguments[_key];
      }

      collections.forEach(function (c) {
        return _this.createCollection(c);
      });
    }
  }, {
    key: 'emptyData',
    value: function emptyData() {
      this._collections.forEach(function (c) {
        return c.remove();
      });
    }
  }]);

  return Db;
})();

export default Db;