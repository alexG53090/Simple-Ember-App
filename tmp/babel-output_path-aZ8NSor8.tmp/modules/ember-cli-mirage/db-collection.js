var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function stringify(data) {
  return JSON.parse(JSON.stringify(data));
}

/*
  A collection of db records i.e. a database table.
*/

var DbCollection = (function () {
  function DbCollection(name, initialData) {
    _classCallCheck(this, DbCollection);

    this.name = name;
    this._records = [];

    if (initialData) {
      this.insert(initialData);
    }
  }

  /*
    Returns a copy of the data, to prevent inadvertant data manipulation.
  */

  _createClass(DbCollection, [{
    key: 'all',
    value: function all() {
      return stringify(this._records);
    }
  }, {
    key: 'insert',
    value: function insert(data) {
      var copy = data ? stringify(data) : {};
      var records = this._records;
      var returnData = undefined;

      if (!_.isArray(copy)) {
        var attrs = copy;
        if (attrs.id === undefined || attrs.id === null) {
          attrs.id = records.length + 1;
        }

        records.push(attrs);
        returnData = stringify(attrs);
      } else {
        returnData = [];
        copy.forEach(function (data) {
          if (data.id === undefined || data.id === null) {
            data.id = records.length + 1;
          }

          records.push(data);
          returnData.push(data);
          returnData = returnData.map(function (r) {
            return stringify(r);
          });
        });
      }

      return returnData;
    }
  }, {
    key: 'find',
    value: function find(ids) {
      if (_.isArray(ids)) {
        var records = this._findRecords(ids).filter(function (r) {
          return r !== undefined;
        });

        // Return a copy
        return records.map(function (r) {
          return stringify(r);
        });
      } else {
        var record = this._findRecord(ids);
        if (!record) {
          return null;
        }

        // Return a copy
        return stringify(record);
      }
    }
  }, {
    key: 'where',
    value: function where(query) {
      var records = this._findRecordsWhere(query);

      return records.map(function (r) {
        return stringify(r);
      });
    }
  }, {
    key: 'firstOrCreate',
    value: function firstOrCreate(query) {
      var attributesForNew = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var queryResult = this.where(query);
      var record = queryResult[0];

      if (record) {
        return record;
      } else {
        var mergedAttributes = _.assign(attributesForNew, query);
        var createdRecord = this.insert(mergedAttributes);

        return createdRecord;
      }
    }
  }, {
    key: 'update',
    value: function update(target, attrs) {
      var _this = this;

      var records = undefined;

      if (typeof attrs === 'undefined') {
        var _ret = (function () {
          attrs = target;
          var changedRecords = [];
          _this._records.forEach(function (record) {
            var oldRecord = _.assign({}, record);

            for (var attr in attrs) {
              record[attr] = attrs[attr];
            }

            if (!_.isEqual(oldRecord, record)) {
              changedRecords.push(record);
            }
          });

          return {
            v: changedRecords
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      } else if (typeof target === 'number' || typeof target === 'string') {
        var id = target;
        var record = this._findRecord(id);

        for (var attr in attrs) {
          record[attr] = attrs[attr];
        }

        return record;
      } else if (_.isArray(target)) {
        var ids = target;
        records = this._findRecords(ids);

        records.forEach(function (record) {
          for (var attr in attrs) {
            record[attr] = attrs[attr];
          }
        });

        return records;
      } else if (typeof target === 'object') {
        var query = target;
        records = this._findRecordsWhere(query);

        records.forEach(function (record) {
          for (var attr in attrs) {
            record[attr] = attrs[attr];
          }
        });

        return records;
      }
    }
  }, {
    key: 'remove',
    value: function remove(target) {
      var _this2 = this;

      var records = undefined;

      if (typeof target === 'undefined') {
        this._records = [];
      } else if (typeof target === 'number' || typeof target === 'string') {
        var record = this._findRecord(target);
        var index = this._records.indexOf(record);
        this._records.splice(index, 1);
      } else if (_.isArray(target)) {
        records = this._findRecords(target);
        records.forEach(function (record) {
          var index = _this2._records.indexOf(record);
          _this2._records.splice(index, 1);
        });
      } else if (typeof target === 'object') {
        records = this._findRecordsWhere(target);
        records.forEach(function (record) {
          var index = _this2._records.indexOf(record);
          _this2._records.splice(index, 1);
        });
      }
    }

    /*
      Private methods.
       These return the actual db objects, whereas the public
      API query methods return copies.
    */

  }, {
    key: '_findRecord',
    value: function _findRecord(id) {
      var allDigitsRegex = /^\d+$/;

      // If parses, coerce to integer
      if (typeof id === 'string' && allDigitsRegex.test(id)) {
        id = parseInt(id, 10);
      }

      var record = this._records.filter(function (obj) {
        return obj.id === id;
      })[0];

      return record;
    }
  }, {
    key: '_findRecords',
    value: function _findRecords(ids) {
      var _this3 = this;

      var records = ids.map(function (id) {
        return _this3._findRecord(id);
      });

      return records;
    }
  }, {
    key: '_findRecordsWhere',
    value: function _findRecordsWhere(query) {
      var records = this._records;

      var _loop = function (queryKey) {
        records = records.filter(function (r) {
          return String(r[queryKey]) === String(query[queryKey]);
        });
      };

      for (var queryKey in query) {
        _loop(queryKey);
      }

      return records;
    }
  }]);

  return DbCollection;
})();

export default DbCollection;