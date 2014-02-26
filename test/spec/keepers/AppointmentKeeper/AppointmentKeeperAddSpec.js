'use strict';

describe('Service: EventKeeper', function() {

    var jKeeper = {};
    
    // load the service's module
    beforeEach(function() {
        module('tnt.vpsa.appointments.entity');
        module('tnt.vpsa.appointments.events.entity');
        module('tnt.vpsa.appointments.events.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    beforeEach(function() {
        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');
        
        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });
    });

    // instantiate service
    var EventKeeper = null;
    var Event = null;
    var JournalEntry = null;
    var IdentityService = null;
    beforeEach(inject(function(_EventKeeper_, _Event_, _JournalEntry_, _IdentityService_) {
    	EventKeeper = _EventKeeper_;
        Event = _Event_;
        JournalEntry =_JournalEntry_;
        IdentityService = _IdentityService_;
    }));
    
    it('should handle an add appointment event', function() {
        // given
        var validEntity = {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
                title : 'VISITA NO CLIENTE',
                description : 'VISITA DIA 12/01/2014',
                date: '12/01/2014',
                startTime: '12:00',
                endTime: '12:30',
                address : {street: 'rua', number: 555, cep: '12222-000'},
                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
                type : 'VISITA',
                status: 'PENDENTE'
        };
        var event = new Event(validEntity);

        // when
        EventKeeper.handlers['eventCreateV1'](event);
        var events = EventKeeper.list();

        // then
        expect(events[0]).not.toBe(event);
        expect(events[0]).toEqual(event);
    });
    
    /**
     * <pre>
     * @spec EventKeeper.add#1
     * Given a valid values
     * when and create is triggered
     * then a journal entry must be created
     * an the entry must be registered
     * </pre>
     */
    it('should add an appoitment', function() {

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
        spyOn(IdentityService, 'getUUID').andReturn('cc02b600-5d0b-11e3-96c3-0100ee000001');
        
        var uuid = 'cc02b600-5d0b-11e3-96c3-0100ee000001';
        var title = 'VISITA NO CLIENTE';
        var description = 'VISITA DIA 12/01/2014';
        var date = '12/01/2014';
        var startTime = '12:00';
        var endTime = '12:30';
        var address = {street: 'rua', number: 555, cep: '12222-000'};
        var contacts = [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}];
        var type = 'VISITA';
        var status = 'STATUS';
        
        var stp = fakeNow;
        var ev = new Event(uuid, title, description, date, startTime, endTime, address, contacts, type, status);
        ev.created = stp;
        
        var entry = new JournalEntry(null, stp, 'eventCreate', 1, ev); 
        
        expect(function() {
            EventKeeper.create(ev);}).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
});
