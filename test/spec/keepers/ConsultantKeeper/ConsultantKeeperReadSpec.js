'use strict';

describe('Service: ConsultantKeeperReadSpec', function() {

    // instantiate service
    var ConsultantKeeper = null;
    var consultants = [
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
        module('tnt.catalog.consultant');
        module('tnt.catalog.consultant.keeper');
    });

    beforeEach(inject(function(_ConsultantKeeper_, _Consultant_, _JournalEntry_) {
        ConsultantKeeper = _ConsultantKeeper_;
    }));

    /**
     * <pre>
     * @spec ConsultantKeeper.read#1
     * Given a valid uuid of consultant
     * when read is triggered
     * then the correct consultant must be returned
     * </pre>
     */
    it('return the correct consultant', function() {
        // given
        spyOn(ConsultantKeeper, 'list').andReturn(consultants);
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000002';
        // when
        var consultant = ConsultantKeeper.read(uuid);
        // then
        expect(consultant.name).toEqual(consultants[1].name);
    });

    /**
     * <pre>
     * @spec consultantKeeper.read#1
     * Given a invalid uuid of consultant
     * when read is triggered
     * then return must be null
     * </pre>
     */
    it('return null', function() {
        // given
        spyOn(ConsultantKeeper, 'list').andReturn(consultants);
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000003';
        // when
        var consultant = ConsultantKeeper.read(uuid);
        // then
        expect(consultant).toEqual(null);
    });

});
