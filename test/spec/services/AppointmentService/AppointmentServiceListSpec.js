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
    
    it('should list since 01/01/2000 upon 05/01/2000',function()
    {
    	// given
        var dummyReceivables = [
            {
            	uuid:1,
                startDate : '01/01/2000'
            },
            {
            	uuid:2,
            	startDate : '05/01/2000'
            },
            {
            	uuid:3,
            	startDate : '03/01/2000'
            },
            {
            	uuid:4,
            	startDate : '06/01/2000'
            },
            {
            	uuid:5,
            	startDate : '04/01/1999'
            }
        ];
        AppointmentKeeper.list = jasmine.createSpy('AppointmentKeeper.list').andReturn(dummyReceivables);
        var since = new Date('01/01/2000');
        since.setHours(0);
        since.setMinutes(0);
        
        var upon = new Date('05/01/2000');
        upon.setHours(0);
        upon.setMinutes(0);
    	// when
        var appointments = AppointmentService.listAppointmentsByPeriod(since,upon);

        // then
    	expect(appointments.length).toEqual(3);
    	expect(appointments[0].uuid).toEqual(1);
    	expect(appointments[1].uuid).toEqual(2);
    	expect(appointments[2].uuid).toEqual(3);
    });
    
    
});