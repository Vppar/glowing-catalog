'use strict';

describe('Service: TypeKeeper', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.type');
        module('tnt.catalog.type.keeper');
        module('tnt.catalog.type.entity');
    });

    // instantiate service
    var Type = undefined;
    beforeEach(inject(function(_Type_) {
        Type = _Type_;
    }));

    it('should creat a new Type entity', function() {
        // given
        var tId = 23;
        var name = 'best type ever';

        // when
        var actual = new Type(tId, name);

        // then
        expect(tId).toEqual(actual.typeId);
        expect(name).toEqual(actual.name);
    });

    it('should creat a new Type entity even if null is passed at it\'s constructor', function() {
        // given
        var tId = 23;
        var name = null;

        // when
        var actual = new Type(tId, name);

        // then
        expect(tId).toEqual(actual.typeId);
        expect(name).toEqual(actual.name);
    });

    it('should creat a new Type entity using a generic object', function() {
        var obj = {
            typeId : 23,
            name : 'best type ever'
        };

        var actual = new Type(obj);

        // then
        expect(obj.typeId).toEqual(actual.typeId);
        expect(obj.name).toEqual(actual.name);
    });

    it('should not creat a new Type entity using a generic object with less than the mandatory attributes', function() {
        var obj = {
            typeId : 23
        };

        var actual = new Type(obj);

        // then
        expect(obj.typeId).toEqual(actual.typeId);
        expect(obj.name).toEqual(actual.name);
    });

    it('should not creat a new Type entity using a generic object if it has more than the mandatory attributes', function() {
        // given
        var obj = {
            typeId : 23,
            name : 'best type ever',
            extra : 'I\'m not mandatory!'
        };

        expect(function() {
            var actual = new Type(obj);
        }).toThrow('Unexpected property extra');

    });

    it('should throw error without name', function() {
        var tId = 23;
        expect(function() {
            new Type(tId);
        }).toThrow('Type must be initialized with typeId and name');
    });

    it('should throw an error if the constructor recieves more than the mandatory parameters', function() {
        var tId = 23;
        var name = 'best type ever';
        var extra = 1;
        expect(function() {
            new Type(tId, name, extra);
        }).toThrow('Type must be initialized with typeId and name');
    });
});
