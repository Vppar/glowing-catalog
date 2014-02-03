'use strict';

describe('Service: EntityKeeperReadSpec', function() {

    // instantiate service
    var EntityKeeper = null;
    var entities = [
        {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            name : 'Pedro de Lara',
            customerId : 12
        }, {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000002',
            name : 'Obina',
            customerId : 13
        }
    ];

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.entity');
        module('tnt.catalog.entity.keeper');
    });

    beforeEach(inject(function(_EntityKeeper_, _Entity_, _JournalEntry_) {
        EntityKeeper = _EntityKeeper_;
    }));

    /**
     * <pre>
     * @spec EntityKeeper.read#1
     * Given a valid uuid of entity
     * when read is triggered
     * then the correct entity must be returned
     * </pre>
     */
    it('return the correct entity', function() {
        // given
        spyOn(EntityKeeper, 'list').andReturn(entities);
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000002';
        // when
        var entity = EntityKeeper.read(uuid);
        // then
        expect(entity.name).toEqual(entities[1].name);
    });

    /**
     * <pre>
     * @spec EntityKeeper.read#1
     * Given a invalid uuid of entity
     * when read is triggered
     * then return must be null
     * </pre>
     */
    it('return null', function() {
        // given
        spyOn(EntityKeeper, 'list').andReturn(entities);
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000003';
        // when
        var entity = EntityKeeper.read(uuid);
        // then
        expect(entity).toEqual(null);
    });

});
