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

    it('should create a new Type entity', function() {
        // given
        var tId = 23;
        var name = 'best type ever';
        var classification = 'a class';

        // when
        var actual = new Type(tId, name, classification);

        // then
        expect(tId).toEqual(actual.id);
        expect(name).toEqual(actual.name);
        expect(classification).toEqual(actual.classification);
    });

    it('should create a new Type entity even if null is passed at it\'s constructor', function() {
        // given
        var tId = 23;
        var name = null;
        var classification = 'a class';

        // when
        var actual = new Type(tId, name, classification);

        // then
        expect(tId).toEqual(actual.id);
        expect(name).toEqual(actual.name);
        expect(classification).toEqual(actual.classification);
    });

    it('should creat a new Type entity using a generic object', function() {
        var obj = {
                id : 23,
            name : 'best type ever',
            classification : 'a class'
        };

        var actual = new Type(obj);

        // then
        expect(obj.id).toEqual(actual.id);
        expect(obj.name).toEqual(actual.name);
        expect(obj.classification).toEqual(actual.classification);
    });

    it('should not creat a new Type entity using a generic object with less than the mandatory attributes', function() {
        var obj = {
                id : 23
        };

        var actual = new Type(obj);

        // then
        expect(obj.id).toEqual(actual.id);
        expect(obj.name).toEqual(actual.name);
    });

    it('should not creat a new Type entity using a generic object if it has more than the mandatory attributes', function() {
        // given
        var obj = {
                id : 23,
            name : 'best type ever',
            classification : 'a class',
            extra : 'I\'m not mandatory!'
        };

        var expectResult = function() {
            new Type(obj);
        };

        expect(expectResult).toThrow('Unexpected property extra');

    });

    it('should throw error without name', function() {
        var tId = 23;

        var expectResult = function() {
            new Type(tId);
        };

        expect(expectResult).toThrow('Type must be initialized with typeId, name and classification');
    });

    it('should throw an error if the constructor recieves more than the mandatory parameters', function() {
        var tId = 23;
        var name = 'best type ever';
        var classification = 'classification';
        var extra = 1;

        var expectResult = function() {
            new Type(tId, name, extra, classification);
        };

        expect(expectResult).toThrow('Type must be initialized with typeId, name and classification');
    });
});
