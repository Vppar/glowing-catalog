'use strict';

describe('Service: EventKeeperReadSpec', function() {

    // instantiate service
    var EventKeeper = null;
    var events = [
        {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            title : 'VISITA 1',
            type : 'VISITA'
        }, {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000002',
            name : 'VISTA 2',
            type : 'VISITA'
        }
    ];

    // load the service's module
    beforeEach(function() {
    	module('tnt.vpsa.appointments.entity');
        module('tnt.vpsa.appointments.events.entity');
        module('tnt.vpsa.appointments.events.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    beforeEach(inject(function(_EventKeeper_, _Event_, _JournalEntry_) {
        EventKeeper = _EventKeeper_;
    }));

    /**
     * <pre>
     * @spec EventKeeper.read#1
     * Given a valid uuid of event
     * when read is triggered
     * then the correct entity must be returned
     * </pre>
     */
    it('return the correct event', function() {
        // given
        spyOn(EventKeeper, 'list').andReturn(events);
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000002';
        // when
        var event = EventKeeper.read(uuid);
        // then
        expect(event.title).toEqual(events[1].title);
        expect(event.type).toEqual(events[1].type);
    });

    /**
     * <pre>
     * @spec EventKeeper.read#1
     * Given a invalid uuid of event
     * when read is triggered
     * then return must be null
     * </pre>
     */
    it('return null', function() {
        // given
        spyOn(EventKeeper, 'list').andReturn(events);
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000003';
        // when
        var event = EventKeeper.read(uuid);
        // then
        expect(event).toEqual(null);
    });

});
