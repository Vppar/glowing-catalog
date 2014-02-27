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
                date : '01/01/2000'
            },
            {
            	uuid:2,
            	date : '05/01/2000'
            },
            {
            	uuid:3,
            	date : '03/01/2000'
            },
            {
            	uuid:4,
            	date : '06/01/2000'
            },
            {
            	uuid:5,
            	date : '04/01/1999'
            }
        ];
        AppointmentKeeper.list = jasmine.createSpy('AppointmentKeeper.list').andReturn(dummyReceivables);
    	// when
        var appointments = AppointmentService.listByPeriod('01/01/2000','05/01/2000');

        // then
    	expect(appointments.length).toEqual(3);
    	expect(appointments[0].uuid).toEqual(1);
    	expect(appointments[1].uuid).toEqual(2);
    	expect(appointments[2].uuid).toEqual(3);
    });
    
    it('should list since 01/01/2000 upon 03/01/2000 and especific entity',function()
    	    {
    	    	// given
    	        var dummyReceivables = [
    	            {
    	            	uuid:1,
    	                date : '01/01/2000',
    	                contacts : [{
    	                	uuid: 'not'
    	                }]
    	            },
    	            {
    	            	uuid:2,
    	            	date : '05/01/2000',
    	            	contacts : [{
    	                	uuid: 'not'
    	                }]
    	            },
    	            {
    	            	uuid:3,
    	            	date : '03/01/2000',
    	            	contacts : [{
    	                	uuid: 'entityuuid1'
    	                }]
    	            },
    	            {
    	            	uuid:4,
    	            	date : '06/01/2000',
    	            	contacts : [{
    	                	uuid: 'not'
    	                }]
    	            },
    	            {
    	            	uuid:5,
    	            	date : '04/01/1999',
    	            	contacts : [{
    	                	uuid: 'not'
    	                }]
    	            }
    	        ];
    	        AppointmentKeeper.list = jasmine.createSpy('AppointmentKeeper.list').andReturn(dummyReceivables);
    	    	// when
    	        var appointments = AppointmentService.listByPeriod('01/01/2000','03/01/2000','entityuuid1');

    	        // then
    	    	expect(appointments.length).toEqual(1);
    	    	expect(appointments[0].uuid).toEqual(3);
    	    });
    
});