describe('Service: EventServiceListSpec', function() {

    var EventKeeper = {};
    var log = {};

    // load the service's module
    beforeEach(function() {
    	module('tnt.vpsa.appointments.events.service');
        log.debug = jasmine.createSpy('log.debug');

        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('EventKeeper', EventKeeper);
        });
    });
    beforeEach(inject(function(_EventService_) {
        EventService = _EventService_;
    }));

    it('should return full list copy', function() {
        // given
        var dummyReceivables = [
            {
                bla : 'bla'
            }
        ];
        EventKeeper.list = jasmine.createSpy('EventKeeper.list').andReturn(dummyReceivables);

        // when
        var events = EventService.list();

        // then
        expect(EventKeeper.list).toHaveBeenCalled();
        expect(events).toEqual(dummyReceivables);
    });

    it('shouldn\'t return full list copy', function() {
        // given
    	EventKeeper.list = jasmine.createSpy('EventKeeper.list').andCallFake(function() {
            throw 'my exception';
        });

        // when
        var result = {};
        var eventCall = function() {
            result = EventService.list();
        };

        // then
        expect(eventCall).not.toThrow();
        expect(log.debug).toHaveBeenCalledWith('EventService.list: Unable to recover the list of events. Err=my exception');
        expect(result).toEqual(null);
    });
});