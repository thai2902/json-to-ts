"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pluralize = require("pluralize");
var model_1 = require("./model");
var util_1 = require("./util");
function getName(_a, keyName, names, isInsideArray) {
    var rootTypeId = _a.rootTypeId, types = _a.types;
    var typeDesc = types.find(function (_) { return _.id === rootTypeId; });
    switch (util_1.getTypeDescriptionGroup(typeDesc)) {
        case model_1.TypeGroup.Array:
            typeDesc.arrayOfTypes.forEach(function (typeIdOrPrimitive, i) {
                getName({ rootTypeId: typeIdOrPrimitive, types: types }, 
                // to differenttiate array types
                i === 0 ? keyName : "" + keyName + (i + 1), names, true);
            });
            return {
                rootName: getNameById(typeDesc.id, keyName, isInsideArray, types, names),
                names: names
            };
        case model_1.TypeGroup.Object:
            Object.entries(typeDesc.typeObj).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                getName({ rootTypeId: value, types: types }, key, names, false);
            });
            return {
                rootName: getNameById(typeDesc.id, keyName, isInsideArray, types, names),
                names: names
            };
        case model_1.TypeGroup.Primitive:
            // in this case rootTypeId is primitive type string (string, null, number, boolean)
            return {
                rootName: rootTypeId,
                names: names
            };
    }
}
function getNames(typeStructure, rootName) {
    if (rootName === void 0) { rootName = "RootObject"; }
    return getName(typeStructure, rootName, [], false).names;
}
exports.getNames = getNames;
function getNameById(id, keyName, isInsideArray, types, nameMap) {
    var nameEntry = nameMap.find(function (_) { return _.id === id; });
    if (nameEntry) {
        return nameEntry.name;
    }
    var typeDesc = util_1.findTypeById(id, types);
    var group = util_1.getTypeDescriptionGroup(typeDesc);
    var name;
    switch (group) {
        case model_1.TypeGroup.Array:
            name = typeDesc.isUnion ? getArrayName(typeDesc, types, nameMap) : formatArrayName(typeDesc, types, nameMap);
            break;
        case model_1.TypeGroup.Object:
            /**
             * picking name for type in array requires to singularize that type name,
             * and if not then no need to singularize
             */
            name = [keyName]
                .map(function (key) { return util_1.parseKeyMetaData(key).keyValue; })
                .map(function (name) { return (isInsideArray ? pluralize.singular(name) : name); })
                .map(pascalCase)
                .map(normalizeInvalidTypeName)
                .map(pascalCase) // needed because removed symbols might leave first character uncapitalized
                .map(function (name) {
                return uniqueByIncrement(name, nameMap.map(function (_a) {
                    var name = _a.name;
                    return name;
                }));
            })
                .pop();
            break;
    }
    nameMap.push({ id: id, name: name });
    return name;
}
function pascalCase(name) {
    return name
        .split(/\s+/g)
        .filter(function (_) { return _ !== ""; })
        .map(capitalize)
        .reduce(function (a, b) { return a + b; });
}
function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}
function normalizeInvalidTypeName(name) {
    if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(name)) {
        return name;
    }
    else {
        var noSymbolsName = name.replace(/[^a-zA-Z0-9]/g, "");
        var startsWithWordCharacter = /^[a-zA-Z]/.test(noSymbolsName);
        return startsWithWordCharacter ? noSymbolsName : "_" + noSymbolsName;
    }
}
function uniqueByIncrement(name, names) {
    for (var i = 0; i < 1000; i++) {
        var nameProposal = i === 0 ? name : "" + name + (i + 1);
        if (!names.includes(nameProposal)) {
            return nameProposal;
        }
    }
}
function getArrayName(typeDesc, types, nameMap) {
    if (typeDesc.arrayOfTypes.length === 0) {
        return "any";
    }
    else if (typeDesc.arrayOfTypes.length === 1) {
        var idOrPrimitive = typeDesc.arrayOfTypes[0];
        return convertToReadableType(idOrPrimitive, types, nameMap);
    }
    else {
        return unionToString(typeDesc, types, nameMap);
    }
}
function convertToReadableType(idOrPrimitive, types, nameMap) {
    return util_1.isHash(idOrPrimitive)
        ? // array keyName makes no difference in picking name for type
            getNameById(idOrPrimitive, null, true, types, nameMap)
        : idOrPrimitive;
}
function unionToString(typeDesc, types, nameMap) {
    return typeDesc.arrayOfTypes.reduce(function (acc, type, i) {
        var readableTypeName = convertToReadableType(type, types, nameMap);
        return i === 0 ? readableTypeName : acc + " | " + readableTypeName;
    }, "");
}
function formatArrayName(typeDesc, types, nameMap) {
    var innerTypeId = typeDesc.arrayOfTypes[0];
    // const isMultipleTypeArray = findTypeById(innerTypeId, types).arrayOfTypes.length > 1
    var isMultipleTypeArray = util_1.isHash(innerTypeId) &&
        util_1.findTypeById(innerTypeId, types).isUnion &&
        util_1.findTypeById(innerTypeId, types).arrayOfTypes.length > 1;
    var readableInnerType = getArrayName(typeDesc, types, nameMap);
    return isMultipleTypeArray
        ? "(" + readableInnerType + ")[]" // add semicolons for union type
        : readableInnerType + "[]";
}
