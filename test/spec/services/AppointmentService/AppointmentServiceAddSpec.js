describe('Service: EventServiceAddSpec', function() {

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

    it('should create a event instance', function() {
        // given
        EventKeeper.create = jasmine.createSpy('EventKeeper.create');
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
        var result = EventService.create(event);

        // then
        expect(EventKeeper.create).toHaveBeenCalledWith(new Event(event));
        expect(result).toBe(undefined);
    });
  
    it('shouldn\'t create a event instance', function() {
        // given
        EventService.isValid = jasmine.createSpy('EventService.isValid').andReturn([]);
        EventKeeper.create = jasmine.createSpy('EventKeeper.create').andCallFake(function() {
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
            EventService.create(event);
        };

        // then
        expect(createCall).toThrow();
    });

});
