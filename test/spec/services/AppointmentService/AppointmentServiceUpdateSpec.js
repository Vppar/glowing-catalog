describe('Service: EventServiceUpdateSpec', function() {

    var log = {};
    var fakeNow = 1386444467895;
    var EventKeeper = {};

    // load the service's module
    beforeEach(function() {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        log.debug = jasmine.createSpy('log.debug');

        module('tnt.vpsa.appointments.events.service');
        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('EventKeeper', EventKeeper);
        });
    });
    beforeEach(inject(function(_Event_, _EventService_) {
    	Event = _Event_;
    	EventService = _EventService_;
    }));

    it('should update a event instance', function() {
        // given
    	EventKeeper.update = jasmine.createSpy('EventKeeper.update');
    	EventService.isValid = jasmine.createSpy('EventService.isValid').andReturn([]);
        
    	var event = {
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

        // when
        var result = EventService.update(event);

        // then
        expect(EventKeeper.update).toHaveBeenCalledWith(event);
        expect(result.length).toBe(0);
    });
  
    it('shouldn\'t update a event instance', function() {
        // given
        EventService.isValid = jasmine.createSpy('EventKeeper.isValid').andReturn([]);
        EventKeeper.update = jasmine.createSpy('EventKeeper.update').andCallFake(function() {
            throw 'my exception';
        });
        var event = {
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
        // when
        var createCall = function() {
            EventService.update(event);
        };

        // then
        expect(createCall).toThrow();
    });
    
    it('should done an event', function() {
    	var event = {
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
    	
    	var eventDone = {
                uuid : 1,
                title : 'VISITA NO CLIENTE',
                description : 'VISITA DIA 12/01/2014',
                date: '12/01/2014',
                startTime: '12:00',
                endTime: '12:30',
                address : {street: 'rua', number: 555, cep: '12222-000'},
                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
                type : 'VISITA',
                status: 'DONE'
        };
    	
        // given
    	EventKeeper.update = jasmine.createSpy('EventKeeper.update');
        EventService.isValid = jasmine.createSpy('EventKeeper.isValid').andReturn([]);
        EventKeeper.read = jasmine.createSpy('EventKeeper.read').andReturn(event);
        
        // when
        var result = EventService.done(1);

        // then
        expect(EventKeeper.update).toHaveBeenCalledWith(eventDone);
        expect(result.length).toBe(0);
    });

    it('should cancel an event', function() {
    	var event = {
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
    	
    	var eventCancel = {
                uuid : 1,
                title : 'VISITA NO CLIENTE',
                description : 'VISITA DIA 12/01/2014',
                date: '12/01/2014',
                startTime: '12:00',
                endTime: '12:30',
                address : {street: 'rua', number: 555, cep: '12222-000'},
                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
                type : 'VISITA',
                status: 'CANCELLED'
        };
    	
        // given
    	EventKeeper.update = jasmine.createSpy('EventKeeper.update');
        EventService.isValid = jasmine.createSpy('EventKeeper.isValid').andReturn([]);
        EventKeeper.read = jasmine.createSpy('EventKeeper.read').andReturn(event);
        
        // when
        var result = EventService.cancel(1);

        // then
        expect(EventKeeper.update).toHaveBeenCalledWith(eventCancel);
        expect(result.length).toBe(0);
    });
    

});
