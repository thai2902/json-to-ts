"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
function isKeyNameValid(keyName) {
    var regex = /^[a-zA-Z_][a-zA-Z\d_]*$/;
    return regex.test(keyName);
}
function parseKeyMetaData(key) {
    var isOptional = key.endsWith("--?");
    if (isOptional) {
        return {
            isOptional: isOptional,
            keyValue: key.slice(0, -3)
        };
    }
    else {
        return {
            isOptional: isOptional,
            keyValue: key
        };
    }
}
function findNameById(id, names) {
    return names.find(function (_) { return _.id === id; }).name;
}
function removeNullFromUnion(unionTypeName) {
    var typeNames = unionTypeName.split(" | ");
    var nullIndex = typeNames.indexOf("null");
    typeNames.splice(nullIndex, 1);
    return typeNames.join(" | ");
}
function replaceTypeObjIdsWithNames(typeObj, names) {
    return (Object.entries(typeObj)
        // quote key if is invalid and question mark if optional from array merging
        .map(function (_a) {
        var key = _a[0], type = _a[1];
        var _b = parseKeyMetaData(key), isOptional = _b.isOptional, keyValue = _b.keyValue;
        var isValid = isKeyNameValid(keyValue);
        var validName = isValid ? keyValue : "'" + keyValue + "'";
        return isOptional ? [validName + "?", type, isOptional] : [validName, type, isOptional];
    })
        // replace hashes with names referencing the hashes
        .map(function (_a) {
        var key = _a[0], type = _a[1], isOptional = _a[2];
        if (!util_1.isHash(type)) {
            return [key, type, isOptional];
        }
        var newType = findNameById(type, names);
        return [key, newType, isOptional];
    })
        // if union has null, remove null and make type optional
        .map(function (_a) {
        var key = _a[0], type = _a[1], isOptional = _a[2];
        if (!(util_1.isNonArrayUnion(type) && type.includes("null"))) {
            return [key, type, isOptional];
        }
        var newType = removeNullFromUnion(type);
        var newKey = isOptional ? key : key + "?"; // if already optional dont add question mark
        return [newKey, newType, isOptional];
    })
        // make null optional and set type as any
        .map(function (_a) {
        var key = _a[0], type = _a[1], isOptional = _a[2];
        if (type !== "null") {
            return [key, type, isOptional];
        }
        var newType = "any";
        var newKey = isOptional ? key : key + "?"; // if already optional dont add question mark
        return [newKey, newType, isOptional];
    })
        .reduce(function (agg, _a) {
        var key = _a[0], value = _a[1];
        agg[key] = value;
        return agg;
    }, {}));
}
var NO_SRLZ = [
    'null',
    'string',
    'boolean',
    'any',
    'number',
    'string[]',
    'boolean[]',
    'any[]',
    'number[]',
];
function getInterfaceStringFromDescription(_a) {
    var name = _a.name, typeMap = _a.typeMap;
    var stringTypeMap = Object.entries(typeMap)
        .map(function (_a) {
        var key = _a[0], name = _a[1];
        var exposeProp = "  @Expose({name: '" + key + "'})\n";
        var typeSrlz = '';
        if (!NO_SRLZ.some(function (_type) { return name.indexOf(_type) !== -1; })) {
            typeSrlz = "  @Type(serializeType(" + name.replace('[]', '').replace('?', '') + "))\n";
        }
        var isDateTime = false;
        var keyLower = key.toLowerCase();
        if ((keyLower.indexOf('datetime') != -1) || (keyLower.indexOf('datelocal') != -1) || (keyLower.indexOf('timelocal') != -1)) {
            isDateTime = true;
            name = 'Date';
            typeSrlz = "  @ServerDateTime()\n";
        }
        return "" + exposeProp + typeSrlz + "  " + key + ": " + name + ";\n\n";
    })
        .reduce(function (a, b) { return (a += b); }, "");
    var interfaceString = "export class " + name + " {\n";
    interfaceString += stringTypeMap;
    interfaceString += "}";
    return interfaceString;
}
exports.getInterfaceStringFromDescription = getInterfaceStringFromDescription;
function getInterfaceDescriptions(typeStructure, names) {
    return names
        .map(function (_a) {
        var id = _a.id, name = _a.name;
        var typeDescription = util_1.findTypeById(id, typeStructure.types);
        if (typeDescription.typeObj) {
            var typeMap = replaceTypeObjIdsWithNames(typeDescription.typeObj, names);
            return { name: name, typeMap: typeMap };
        }
        else {
            return null;
        }
    })
        .filter(function (_) { return _ !== null; });
}
exports.getInterfaceDescriptions = getInterfaceDescriptions;
