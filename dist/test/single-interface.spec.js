"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var index_1 = require("./util/index");
var index_2 = require("../src/index");
describe("Single interface", function () {
    it("should work with empty objects", function () {
        var json = {};
        var expected = "\n      interface RootObject {\n      }\n    ";
        var actual = index_2.default(json).pop();
        var _a = [expected, actual].map(index_1.removeWhiteSpace), a = _a[0], b = _a[1];
        assert.strictEqual(a, b);
    });
    it("should not quote underscore key names", function () {
        var json = {
            _marius: "marius"
        };
        var expected = "\n      interface RootObject {\n        _marius: string;\n      }\n    ";
        var actual = index_2.default(json).pop();
        var _a = [expected, actual].map(index_1.removeWhiteSpace), a = _a[0], b = _a[1];
        assert.strictEqual(a, b);
    });
    it("should convert Date to Date type", function () {
        var json = {
            _marius: new Date()
        };
        var expected = "\n      interface RootObject {\n        _marius: Date;\n      }\n    ";
        var actual = index_2.default(json).pop();
        var _a = [expected, actual].map(index_1.removeWhiteSpace), a = _a[0], b = _a[1];
        assert.strictEqual(a, b);
    });
    it("should work with multiple key words", function () {
        var json = {
            "hello world": 42
        };
        var expected = "\ninterface RootObject {\n  'hello world': number;\n}";
        var actual = index_2.default(json).pop();
        assert.strictEqual(expected.trim(), actual.trim());
    });
    it("should work with multiple key words and optional fields", function () {
        var json = {
            "hello world": null
        };
        var expected = "\ninterface RootObject {\n  'hello world'?: any;\n}";
        var actual = index_2.default(json).pop();
        assert.strictEqual(expected.trim(), actual.trim());
    });
    it("should work with primitive types", function () {
        var json = {
            str: "this is string",
            num: 42,
            bool: true
        };
        var expected = "\n      interface RootObject {\n        str: string;\n        num: number;\n        bool: boolean;\n      }\n    ";
        var interfaceStr = index_2.default(json).pop();
        var _a = [expected, interfaceStr].map(index_1.removeWhiteSpace), expect = _a[0], actual = _a[1];
        assert.strictEqual(expect, actual);
    });
    it("should keep field order", function () {
        var json = {
            c: "this is string",
            a: 42,
            b: true
        };
        var expected = "\n      interface RootObject {\n        c: string;\n        a: number;\n        b: boolean;\n      }\n    ";
        var interfaceStr = index_2.default(json).pop();
        var _a = [expected, interfaceStr].map(index_1.removeWhiteSpace), expect = _a[0], actual = _a[1];
        assert.strictEqual(expect, actual);
    });
    it("should add optional field modifier on null values", function () {
        var json = {
            field: null
        };
        var expected = "\n      interface RootObject {\n        field?: any;\n      }\n    ";
        var actual = index_2.default(json).pop();
        var _a = [expected, actual].map(index_1.removeWhiteSpace), a = _a[0], b = _a[1];
        assert.strictEqual(a, b);
    });
    it('should name root object interface "RootObject"', function () {
        var json = {};
        var expected = "\n      interface RootObject {\n      }\n    ";
        var actual = index_2.default(json).pop();
        var _a = [expected, actual].map(index_1.removeWhiteSpace), a = _a[0], b = _a[1];
        assert.strictEqual(a, b);
    });
    it("should empty array should be any[]", function () {
        var json = {
            arr: []
        };
        var expected = "\n      interface RootObject {\n        arr: any[];\n      }\n    ";
        var actual = index_2.default(json).pop();
        var _a = [expected, actual].map(index_1.removeWhiteSpace), a = _a[0], b = _a[1];
        assert.strictEqual(a, b);
    });
});
