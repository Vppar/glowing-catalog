describe('Service: EventServiceAddSpec', function() {

    var EventService = {};
    var EventKeeper = {};

    // load the service's module
    beforeEach(function() {
    	module('tnt.vpsa.appointments.events.service');
        module('tnt.vpsa.appointments.entity');
        module('tnt.vpsa.appointments.events.keeper');
    });
    
    beforeEach(function() {
        EventKeeper.read = jasmine.createSpy('EventKeeper.read');
        module(function($provide) {
            $provide.value('EventKeeper', EventKeeper);
        });
    });
    
    beforeEach(inject(function(_EventKeeper_, _Event_, _JournalEntry_, _EventService_) {
        Event = _Event_; 
        EventService = _EventService_;
    }));
    
    /**
     * <pre>
     * @spec EventService.read#1
     * Given a valid uuid of event
     * when read is triggered
     * then the keeper must be call
     * </pre>
     */
    it('must call eventKeeper', function() {
        // given
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000002';
        // when
        EventService.read(uuid);
        // then
        expect(EventKeeper.read).toHaveBeenCalledWith(uuid);
        expect(EventService.read).not.toThrow();
    });

});
