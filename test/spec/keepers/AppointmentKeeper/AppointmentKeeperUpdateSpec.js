'use strict';

describe('Service: EventKeeper', function() {

    var jKeeper = {};
    var IdentityService ={};
    var fakeUUID = {};
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
        fakeUUID= '123456-4646231231-6465';
        IdentityService.getUUID = jasmine.createSpy('IdentityService.getUUID').andReturn(fakeUUID);
        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
            $provide.value('IdentityService', IdentityService);
        });
    });

    // instantiate service
    var EventKeeper = undefined;
    var Event = undefined;
    var JournalEntry = undefined;
    beforeEach(inject(function(_EventKeeper_, _Event_, _JournalEntry_) {
    	EventKeeper = _EventKeeper_;
        Event = _Event_;
        JournalEntry =_JournalEntry_;
    }));
    
    
    it('should handle an update an appointment event', function() {
        // given
    	var validEvent = {
                uuid : 1,
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
        var event = new Event(validEvent);

        // when
        expect(function() {
            EventKeeper.handlers['eventUpdateV1'](event);}).toThrow('Event not found.');

    });
    
    
    /**
     * <pre>
     * @spec EventKeeper.update#1
     * Given a valid values
     * when and create is triggered
     * then a journal entry must be created
     * an the entry must be registered
     * </pre>
     */
    
    it('should update', function() {

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
        var uuid = 1;
        var title = 'VISITA NO CLIENTE';
        var description = 'VISITA DIA 12/01/2014';
        var date = '12/01/2014';
        var startTime = '12:00';
        var endTime = '12:30';
        var address = {street: 'rua', number: 555, cep: '12222-000'};
        var contacts = [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}];
        var type = 'VISITA';
        var status = 'STATUS';
        
        var ev = new Event(uuid, title, description, date, startTime, endTime, address, contacts, type,status);
        var stp = fakeNow / 1000;
        var entry = new JournalEntry(null, stp, 'eventUpdate', 1, ev); 
        
        expect(function() {
            EventKeeper.update(ev);}).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
    
    /**
     * <pre>
     * @spec EventKeeper.update#2
     * Given a invalid document
     * when and update is triggered
     * then an error must be raised
     * </pre> 
     */
    it('should throw error', function() {
        
        EventKeeper.update = jasmine.createSpy('EventKeeper.update').andCallFake(function() {
            throw 'Event not found.';
        });
        var uuid = 1;
        var title = 'VISITA NO CLIENTE';
        var description = 'VISITA DIA 12/01/2014';
        var date = '12/01/2014';
        var startTime = '12:00';
        var endTime = '12:30';
        var address = {street: 'rua', number: 555, cep: '12222-000'};
        var contacts = [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}];
        var type = 'VISITA';
        var status = 'STATUS';

        expect(function() {
            EventKeeper.update(uuid, title, description, date, startTime, endTime, address, contacts, type,status);}).toThrow('Event not found.');
    });

});
