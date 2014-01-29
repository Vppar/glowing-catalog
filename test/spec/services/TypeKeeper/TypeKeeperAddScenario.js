'use strict';

describe('Service: TypeKeeper.add', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.type');
        module('tnt.catalog.type.keeper');
        module('tnt.catalog.type.entity');
    });

    // instantiate service
    var TypeKeeper = undefined;
    var Type = undefined;

    beforeEach(inject(function(_TypeKeeper_, _Type_) {
        TypeKeeper = _TypeKeeper_;
        Type = _Type_;
    }));

    /**
     * <pre>
     * @spec TypeKeeper.add#1
     * Given a valid type
     * when add is triggered
     * then a type must be created
     * and the handler must populate the list
     * </pre>
     */
    it('create a type', function() {
        var name = 'I\'m the type\`s name!';
        var classification = 'a class';
        var ev = new Type(null, name, classification);

        runs(function() {
            TypeKeeper.add(ev);
        });

        waitsFor(function() {
            return TypeKeeper.list(classification);
        }, 'JournalKeeper is taking too long', 300);

        runs(function() {
            expect(TypeKeeper.list(classification).length).toBe(1);
            expect(TypeKeeper.list(classification)[0].id).toBe(0);
        });
    });

});