var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FunctionRouteHandler = (function () {
  function FunctionRouteHandler(dbOrSchema, serializerOrRegistry, userFunction) {
    _classCallCheck(this, FunctionRouteHandler);

    this.dbOrSchema = dbOrSchema;
    this.serializerOrRegistry = serializerOrRegistry;
    this.userFunction = userFunction;
  }

  _createClass(FunctionRouteHandler, [{
    key: "handle",
    value: function handle(request) {
      return this.userFunction(this.dbOrSchema, request);
    }
  }]);

  return FunctionRouteHandler;
})();

export default FunctionRouteHandler;