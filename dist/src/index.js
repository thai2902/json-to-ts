"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var get_type_structure_1 = require("./get-type-structure");
var es7_shim_1 = require("es7-shim/es7-shim");
var get_interfaces_1 = require("./get-interfaces");
var get_names_1 = require("./get-names");
var util_1 = require("./util");
es7_shim_1.shim();
function JsonToTS(json, userOptions) {
    var defaultOptions = {
        rootName: "RootObject"
    };
    var options = __assign(__assign({}, defaultOptions), userOptions);
    /**
     * Parsing currently works with (Objects) and (Array of Objects) not and primitive types and mixed arrays etc..
     * so we shall validate, so we dont start parsing non Object type
     */
    var isArrayOfObjects = util_1.isArray(json) &&
        json.length > 0 &&
        json.reduce(function (a, b) { return a && util_1.isObject(b); }, true);
    if (!(util_1.isObject(json) || isArrayOfObjects)) {
        throw new Error("Only (Object) and (Array of Object) are supported");
    }
    var typeStructure = get_type_structure_1.getTypeStructure(json);
    /**
     * due to merging array types some types are switched out for merged ones
     * so we delete the unused ones here
     */
    get_type_structure_1.optimizeTypeStructure(typeStructure);
    var names = get_names_1.getNames(typeStructure, options.rootName);
    return get_interfaces_1.getInterfaceDescriptions(typeStructure, names).map(get_interfaces_1.getInterfaceStringFromDescription);
}
exports.default = JsonToTS;
JsonToTS.default = JsonToTS;
module.exports = JsonToTS;
