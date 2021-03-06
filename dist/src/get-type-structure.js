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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var hash = require("hash.js");
var util_1 = require("./util");
var model_1 = require("./model");
function createTypeDescription(typeObj, isUnion) {
    if (util_1.isArray(typeObj)) {
        return {
            id: Hash(JSON.stringify(__spreadArrays(typeObj, [isUnion]))),
            arrayOfTypes: typeObj,
            isUnion: isUnion
        };
    }
    else {
        return {
            id: Hash(JSON.stringify(typeObj)),
            typeObj: typeObj
        };
    }
}
function getIdByType(typeObj, types, isUnion) {
    if (isUnion === void 0) { isUnion = false; }
    var typeDesc = types.find(function (el) {
        return typeObjectMatchesTypeDesc(typeObj, el, isUnion);
    });
    if (!typeDesc) {
        typeDesc = createTypeDescription(typeObj, isUnion);
        types.push(typeDesc);
    }
    return typeDesc.id;
}
function Hash(content) {
    return hash
        .sha1()
        .update(content)
        .digest("hex");
}
function typeObjectMatchesTypeDesc(typeObj, typeDesc, isUnion) {
    if (util_1.isArray(typeObj)) {
        return arraysContainSameElements(typeObj, typeDesc.arrayOfTypes) && typeDesc.isUnion === isUnion;
    }
    else {
        return objectsHaveSameEntries(typeObj, typeDesc.typeObj);
    }
}
function arraysContainSameElements(arr1, arr2) {
    if (arr1 === undefined || arr2 === undefined)
        return false;
    return arr1.sort().join("") === arr2.sort().join("");
}
function objectsHaveSameEntries(obj1, obj2) {
    if (obj1 === undefined || obj2 === undefined)
        return false;
    var entries1 = Object.entries(obj1);
    var entries2 = Object.entries(obj2);
    var sameLength = entries1.length === entries2.length;
    var sameTypes = entries1.every(function (_a) {
        var key = _a[0], value = _a[1];
        return obj2[key] === value;
    });
    return sameLength && sameTypes;
}
function getSimpleTypeName(value) {
    if (value === null) {
        return "null";
    }
    else if (value instanceof Date) {
        return "Date";
    }
    else {
        return typeof value;
    }
}
function getTypeGroup(value) {
    if (util_1.isDate(value)) {
        return model_1.TypeGroup.Date;
    }
    else if (util_1.isArray(value)) {
        return model_1.TypeGroup.Array;
    }
    else if (util_1.isObject(value)) {
        return model_1.TypeGroup.Object;
    }
    else {
        return model_1.TypeGroup.Primitive;
    }
}
function createTypeObject(obj, types) {
    return Object.entries(obj).reduce(function (typeObj, _a) {
        var _b;
        var key = _a[0], value = _a[1];
        var rootTypeId = getTypeStructure(value, types).rootTypeId;
        return __assign(__assign({}, typeObj), (_b = {}, _b[key] = rootTypeId, _b));
    }, {});
}
function getMergedObjects(typesOfArray, types) {
    var typeObjects = typesOfArray.map(function (typeDesc) { return typeDesc.typeObj; });
    var allKeys = typeObjects
        .map(function (typeObj) { return Object.keys(typeObj); })
        .reduce(function (a, b) { return __spreadArrays(a, b); }, [])
        .filter(util_1.onlyUnique);
    var commonKeys = typeObjects.reduce(function (commonKeys, typeObj) {
        var keys = Object.keys(typeObj);
        return commonKeys.filter(function (key) { return keys.includes(key); });
    }, allKeys);
    var getKeyType = function (key) {
        var typesOfKey = typeObjects
            .filter(function (typeObj) {
            return Object.keys(typeObj).includes(key);
        })
            .map(function (typeObj) { return typeObj[key]; })
            .filter(util_1.onlyUnique);
        if (typesOfKey.length === 1) {
            return typesOfKey.pop();
        }
        else {
            return getInnerArrayType(typesOfKey, types);
        }
    };
    var typeObj = allKeys.reduce(function (obj, key) {
        var _a;
        var isMandatory = commonKeys.includes(key);
        var type = getKeyType(key);
        var keyValue = isMandatory ? key : toOptionalKey(key);
        return __assign(__assign({}, obj), (_a = {}, _a[keyValue] = type, _a));
    }, {});
    return getIdByType(typeObj, types, true);
}
function toOptionalKey(key) {
    return key.endsWith("--?") ? key : key + "--?";
}
function getMergedArrays(typesOfArray, types) {
    var idsOfArrayTypes = typesOfArray
        .map(function (typeDesc) { return typeDesc.arrayOfTypes; })
        .reduce(function (a, b) { return __spreadArrays(a, b); }, [])
        .filter(util_1.onlyUnique);
    if (idsOfArrayTypes.length === 1) {
        return getIdByType([idsOfArrayTypes.pop()], types);
    }
    else {
        return getIdByType([getInnerArrayType(idsOfArrayTypes, types)], types);
    }
}
// we merge union types example: (number | string), null -> (number | string | null)
function getMergedUnion(typesOfArray, types) {
    var innerUnionsTypes = typesOfArray
        .map(function (id) {
        return util_1.findTypeById(id, types);
    })
        .filter(function (_) { return !!_ && _.isUnion; })
        .map(function (_) { return _.arrayOfTypes; })
        .reduce(function (a, b) { return __spreadArrays(a, b); }, []);
    var primitiveTypes = typesOfArray.filter(function (id) { return !util_1.findTypeById(id, types) || !util_1.findTypeById(id, types).isUnion; }); // primitives or not union
    return getIdByType(__spreadArrays(innerUnionsTypes, primitiveTypes), types, true);
}
function getInnerArrayType(typesOfArray, types) {
    // return inner array type
    var containsNull = typesOfArray.includes("null");
    var arrayTypesDescriptions = typesOfArray.map(function (id) { return util_1.findTypeById(id, types); }).filter(function (_) { return !!_; });
    var allArrayType = arrayTypesDescriptions.filter(function (typeDesc) { return util_1.getTypeDescriptionGroup(typeDesc) === model_1.TypeGroup.Array; }).length ===
        typesOfArray.length;
    var allArrayTypeWithNull = arrayTypesDescriptions.filter(function (typeDesc) { return util_1.getTypeDescriptionGroup(typeDesc) === model_1.TypeGroup.Array; }).length + 1 ===
        typesOfArray.length && containsNull;
    var allObjectTypeWithNull = arrayTypesDescriptions.filter(function (typeDesc) { return util_1.getTypeDescriptionGroup(typeDesc) === model_1.TypeGroup.Object; }).length + 1 ===
        typesOfArray.length && containsNull;
    var allObjectType = arrayTypesDescriptions.filter(function (typeDesc) { return util_1.getTypeDescriptionGroup(typeDesc) === model_1.TypeGroup.Object; }).length ===
        typesOfArray.length;
    if (typesOfArray.length === 0) {
        // no types in array -> empty union type
        return getIdByType([], types, true);
    }
    if (typesOfArray.length === 1) {
        // one type in array -> that will be our inner type
        return typesOfArray.pop();
    }
    if (typesOfArray.length > 1) {
        // multiple types in merge array
        // if all are object we can merge them and return merged object as inner type
        if (allObjectType)
            return getMergedObjects(arrayTypesDescriptions, types);
        // if all are array we can merge them and return merged array as inner type
        if (allArrayType)
            return getMergedArrays(arrayTypesDescriptions, types);
        // all array types with posibble null, result type = null | (*mergedArray*)[]
        if (allArrayTypeWithNull) {
            return getMergedUnion([getMergedArrays(arrayTypesDescriptions, types), "null"], types);
        }
        // all object types with posibble null, result type = null | *mergedObject*
        if (allObjectTypeWithNull) {
            return getMergedUnion([getMergedObjects(arrayTypesDescriptions, types), "null"], types);
        }
        // if they are mixed or all primitive we cant merge them so we return as mixed union type
        return getMergedUnion(typesOfArray, types);
    }
}
function getTypeStructure(targetObj, // object that we want to create types for
types) {
    if (types === void 0) { types = []; }
    switch (getTypeGroup(targetObj)) {
        case model_1.TypeGroup.Array:
            var typesOfArray = targetObj.map(function (_) { return getTypeStructure(_, types).rootTypeId; }).filter(util_1.onlyUnique);
            var arrayInnerTypeId = getInnerArrayType(typesOfArray, types); // create "union type of array types"
            var typeId = getIdByType([arrayInnerTypeId], types); // create type "array of union type"
            return {
                rootTypeId: typeId,
                types: types
            };
        case model_1.TypeGroup.Object:
            var typeObj = createTypeObject(targetObj, types);
            var objType = getIdByType(typeObj, types);
            return {
                rootTypeId: objType,
                types: types
            };
        case model_1.TypeGroup.Primitive:
            return {
                rootTypeId: getSimpleTypeName(targetObj),
                types: types
            };
        case model_1.TypeGroup.Date:
            var dateType = getSimpleTypeName(targetObj);
            return {
                rootTypeId: dateType,
                types: types
            };
    }
}
exports.getTypeStructure = getTypeStructure;
function getAllUsedTypeIds(_a) {
    var rootTypeId = _a.rootTypeId, types = _a.types;
    var typeDesc = types.find(function (_) { return _.id === rootTypeId; });
    var subTypes = function (typeDesc) {
        switch (util_1.getTypeDescriptionGroup(typeDesc)) {
            case model_1.TypeGroup.Array:
                var arrSubTypes = typeDesc.arrayOfTypes
                    .filter(util_1.isHash)
                    .map(function (typeId) {
                    var typeDesc = types.find(function (_) { return _.id === typeId; });
                    return subTypes(typeDesc);
                })
                    .reduce(function (a, b) { return __spreadArrays(a, b); }, []);
                return __spreadArrays([typeDesc.id], arrSubTypes);
            case model_1.TypeGroup.Object:
                var objSubTypes = Object.values(typeDesc.typeObj)
                    .filter(util_1.isHash)
                    .map(function (typeId) {
                    var typeDesc = types.find(function (_) { return _.id === typeId; });
                    return subTypes(typeDesc);
                })
                    .reduce(function (a, b) { return __spreadArrays(a, b); }, []);
                return __spreadArrays([typeDesc.id], objSubTypes);
        }
    };
    return subTypes(typeDesc);
}
function optimizeTypeStructure(typeStructure) {
    var usedTypeIds = getAllUsedTypeIds(typeStructure);
    var optimizedTypes = typeStructure.types.filter(function (typeDesc) { return usedTypeIds.includes(typeDesc.id); });
    typeStructure.types = optimizedTypes;
}
exports.optimizeTypeStructure = optimizeTypeStructure;
