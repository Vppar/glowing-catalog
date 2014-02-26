describe('Service: AppointmentServiceListSpec', function() {

    var AppointmentKeeper = {};
    var log = {};

    // load the service's module
    beforeEach(function() {
    	module('tnt.catalog.appointments.service');
        log.debug = jasmine.createSpy('log.debug');

        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('AppointmentKeeper', AppointmentKeeper);
        });
    });
    beforeEach(inject(function(_AppointmentService_) {
        AppointmentService = _AppointmentService_;
    }));

    it('should return full list copy', function() {
        // given
        var dummyReceivables = [
            {
                bla : 'bla'
            }
        ];
        AppointmentKeeper.list = jasmine.createSpy('AppointmentKeeper.list').andReturn(dummyReceivables);

        // when
        var appointments = AppointmentService.list();

        // then
        expect(AppointmentKeeper.list).toHaveBeenCalled();
        expect(appointments).toEqual(dummyReceivables);
    });

    it('shouldn\'t return full list copy', function() {
        // given
    	AppointmentKeeper.list = jasmine.createSpy('AppointmentKeeper.list').andCallFake(function() {
            throw 'my exception';
        });

        // when
        var result = {};
        var eventCall = function() {
            result = AppointmentService.list();
        };

        // then
        expect(eventCall).not.toThrow();
        expect(log.debug).toHaveBeenCalledWith('AppointmentService.list: Unable to recover the list of appointments. Err=my exception');
        expect(result).toEqual(null);
    });
});