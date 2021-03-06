"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var index_1 = require("./util/index");
var index_2 = require("../src/index");
describe("Multiple interfaces", function () {
    it("should create separate interface for nested objects", function () {
        var json = {
            a: {
                b: 42
            }
        };
        var expectedTypes = [
            "interface RootObject {\n        a: A;\n      }",
            "interface A {\n        b: number;\n      }"
        ].map(index_1.removeWhiteSpace);
        index_2.default(json).forEach(function (i) {
            var noWhiteSpaceInterface = index_1.removeWhiteSpace(i);
            assert(expectedTypes.includes(noWhiteSpaceInterface));
        });
    });
    it("should not create duplicate on same type object fields", function () {
        var json = {
            a: {
                b: 42
            },
            c: {
                b: 24
            }
        };
        var expectedTypes = [
            "interface RootObject {\n        a: A;\n        c: A;\n      }",
            "interface A {\n        b: number;\n      }"
        ].map(index_1.removeWhiteSpace);
        var interfaces = index_2.default(json);
        interfaces.forEach(function (i) {
            var noWhiteSpaceInterface = index_1.removeWhiteSpace(i);
            assert(expectedTypes.includes(noWhiteSpaceInterface));
        });
        assert(interfaces.length === 2);
    });
    it("should have multi keyword interfaces created without space", function () {
        var json = {
            "hello world": {
                b: 42
            }
        };
        var expectedTypes = [
            "interface RootObject {\n  'hello world': HelloWorld;\n}",
            "interface HelloWorld {\n  b: number;\n}"
        ].map(function (_) { return _.trim(); });
        var interfaces = index_2.default(json);
        interfaces.forEach(function (typeInterface) {
            assert(expectedTypes.includes(typeInterface));
        });
    });
    it("should have unique names for nested objects since they ", function () {
        var json = {
            name: "Larry",
            parent: {
                name: "Garry",
                parent: {
                    name: "Marry",
                    parent: null
                }
            }
        };
        var expectedTypes = [
            "interface RootObject {\n        name: string;\n        parent: Parent2;\n      }",
            "interface Parent {\n        name: string;\n        parent?: any;\n      }",
            "interface Parent2 {\n        name: string;\n        parent: Parent;\n      }"
        ].map(index_1.removeWhiteSpace);
        var interfaces = index_2.default(json);
        interfaces.forEach(function (i) {
            var noWhiteSpaceInterface = index_1.removeWhiteSpace(i);
            assert(expectedTypes.includes(noWhiteSpaceInterface));
        });
    });
    it("should support multi nested arrays", function () {
        var json = {
            cats: [
                [{ name: "Kittin" }, { name: "Kittin" }, { name: "Kittin" }],
                [{ name: "Kittin" }, { name: "Kittin" }, { name: "Kittin" }]
            ]
        };
        var expectedTypes = [
            "interface RootObject {\n        cats: Cat[][];\n      }",
            "interface Cat {\n        name: string;\n      }"
        ].map(index_1.removeWhiteSpace);
        index_2.default(json).forEach(function (i) {
            var noWhiteSpaceInterface = index_1.removeWhiteSpace(i);
            assert(expectedTypes.includes(noWhiteSpaceInterface));
        });
    });
    it("should singularize array types (dogs: [...] => dogs: Dog[] )", function () {
        var json = {
            dogs: [{ name: "sparky" }, { name: "goodboi" }]
        };
        var expectedTypes = [
            "interface RootObject {\n        dogs: Dog[];\n      }",
            "interface Dog {\n        name: string;\n      }"
        ].map(index_1.removeWhiteSpace);
        var interfaces = index_2.default(json);
        interfaces.forEach(function (i) {
            var noWhiteSpaceInterface = index_1.removeWhiteSpace(i);
            assert(expectedTypes.includes(noWhiteSpaceInterface));
        });
    });
    it("should not singularize if not array type (dogs: {} => dogs: Dogs )", function () {
        var json = {
            cats: {
                popularity: "very popular"
            }
        };
        var expectedTypes = [
            "interface RootObject {\n        cats: Cats;\n      }",
            "interface Cats {\n        popularity: string;\n      }"
        ].map(index_1.removeWhiteSpace);
        var interfaces = index_2.default(json);
        interfaces.forEach(function (i) {
            var noWhiteSpaceInterface = index_1.removeWhiteSpace(i);
            assert(expectedTypes.includes(noWhiteSpaceInterface));
        });
    });
    it("should capitalize interface names", function () {
        var json = {
            cat: {}
        };
        var expectedTypes = [
            "interface RootObject {\n        cat: Cat;\n      }",
            "interface Cat {\n      }"
        ].map(index_1.removeWhiteSpace);
        var interfaces = index_2.default(json);
        interfaces.forEach(function (i) {
            var noWhiteSpaceInterface = index_1.removeWhiteSpace(i);
            assert(expectedTypes.includes(noWhiteSpaceInterface));
        });
    });
    it("should start unique names increment with 2", function () {
        var json = {
            a: {
                human: { legs: 4 }
            },
            b: {
                human: { arms: 2 }
            }
        };
        var expectedTypes = [
            "interface RootObject {\n        a: A;\n        b: B;\n      }",
            "interface A {\n        human: Human;\n      }",
            "interface B {\n        human: Human2;\n      }",
            "interface Human {\n        legs: number;\n      }",
            "interface Human2 {\n        arms: number;\n      }"
        ].map(index_1.removeWhiteSpace);
        var interfaces = index_2.default(json);
        interfaces.forEach(function (i) {
            var noWhiteSpaceInterface = index_1.removeWhiteSpace(i);
            assert(expectedTypes.includes(noWhiteSpaceInterface));
        });
    });
    it("should normalize invalid interface names 1", function () {
        var json = {
            "#@#123#@#": {
                name: "dummy string"
            }
        };
        var expectedTypes = [
            "interface RootObject {\n        '#@#123#@#': _123;\n      }",
            "interface _123 {\n        name: string;\n      }"
        ].map(index_1.removeWhiteSpace);
        var interfaces = index_2.default(json);
        interfaces.forEach(function (i) {
            var noWhiteSpaceInterface = index_1.removeWhiteSpace(i);
            assert(expectedTypes.includes(noWhiteSpaceInterface));
        });
    });
    it("should normalize invalid interface names 2", function () {
        var json = {
            "hello#@#123#@#": {
                name: "dummy string"
            }
        };
        var expectedTypes = [
            "interface RootObject {\n        'hello#@#123#@#': Hello123;\n      }",
            "interface Hello123 {\n        name: string;\n      }"
        ].map(index_1.removeWhiteSpace);
        var interfaces = index_2.default(json);
        interfaces.forEach(function (i) {
            var noWhiteSpaceInterface = index_1.removeWhiteSpace(i);
            assert(expectedTypes.includes(noWhiteSpaceInterface));
        });
    });
    it("should normalize invalid interface names to pascal case", function () {
        var json = {
            "%#hello#@#123#@#": {
                name: "dummy string"
            }
        };
        var expectedTypes = [
            "interface RootObject {\n        '%#hello#@#123#@#': Hello123;\n      }",
            "interface Hello123 {\n        name: string;\n      }"
        ].map(index_1.removeWhiteSpace);
        var interfaces = index_2.default(json);
        interfaces.forEach(function (i) {
            var noWhiteSpaceInterface = index_1.removeWhiteSpace(i);
            assert(expectedTypes.includes(noWhiteSpaceInterface));
        });
    });
    it("should have question mark after optional invalid interface name", function () {
        var json = [{ "hello#123": "sample" }, {}];
        var expectedTypes = [
            "interface RootObject {\n        'hello#123'?: string;\n      }"
        ].map(index_1.removeWhiteSpace);
        var interfaces = index_2.default(json);
        interfaces.forEach(function (i) {
            var noWhiteSpaceInterface = index_1.removeWhiteSpace(i);
            assert(expectedTypes.includes(noWhiteSpaceInterface));
        });
    });
    it("should have question mark after null value invalid interface name", function () {
        var json = {
            "hello#123": null
        };
        var expectedTypes = [
            "interface RootObject {\n        'hello#123'?: any;\n      }"
        ].map(index_1.removeWhiteSpace);
        var interfaces = index_2.default(json);
        interfaces.forEach(function (i) {
            var noWhiteSpaceInterface = index_1.removeWhiteSpace(i);
            assert(expectedTypes.includes(noWhiteSpaceInterface));
        });
    });
    it("should have question mark after null value invalid optional interface name", function () {
        var json = [{ "hello#123": null }, {}];
        var expectedTypes = [
            "interface RootObject {\n        'hello#123'?: any;\n      }"
        ].map(index_1.removeWhiteSpace);
        var interfaces = index_2.default(json);
        interfaces.forEach(function (i) {
            var noWhiteSpaceInterface = index_1.removeWhiteSpace(i);
            assert(expectedTypes.includes(noWhiteSpaceInterface));
        });
    });
});
