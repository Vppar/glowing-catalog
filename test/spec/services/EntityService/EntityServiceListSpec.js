describe('Service: EntityServiceListSpec', function() {

    var EntityKeeper = {};
    var log = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.entity.service');
        log.debug = jasmine.createSpy('log.debug');

        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('EntityKeeper', EntityKeeper);
        });
    });
    beforeEach(inject(function(_EntityService_) {
        EntityService = _EntityService_;
    }));

    it('should return full list copy', function() {
        // given
        var dummyReceivables = [
            {
                bla : 'bla'
            }
        ];
        EntityKeeper.list = jasmine.createSpy('EntityKeeper.list').andReturn(dummyReceivables);

        // when
        var entities = EntityService.list();

        // then
        expect(EntityKeeper.list).toHaveBeenCalled();
        expect(entities).toEqual(dummyReceivables);
    });

    it('shouldn\'t return full list copy', function() {
        // given
        EntityKeeper.list = jasmine.createSpy('EntityKeeper.list').andCallFake(function() {
            throw 'my exception';
        });

        // when
        var result = {};
        var entityCall = function() {
            result = EntityService.list();
        };

        // then
        expect(entityCall).not.toThrow();
        expect(log.debug).toHaveBeenCalledWith('EntityService.list: Unable to recover the list of entity. Err=my exception');
        expect(result).toEqual(null);
    });
    
    it('should list births 01/01/2000 upon 03/01/2000 ',function()
    	    {
    	    	// given
    	        var dummyReceivables = [
    	            {
    	            	uuid:1,
    	            	birthDate : {month : 01, day: 01}
    	            },
    	            {
    	            	uuid:2,
    	            	birthDate : {month : 01, day: 05}
    	            },
    	            {
    	            	uuid:3,
    	            	birthDate : {month : 01, day: 03}
    	            },
    	            {
    	            	uuid:4,
    	            	birthDate : {month : 01, day: 06}
    	            },
    	            {
    	            	uuid:5,
    	            	birthDate : {month : 01, day: 04}
    	            }
    	        ];
    	        
    	        EntityKeeper.list = jasmine.createSpy('EntityKeeper.list').andReturn(dummyReceivables);
    	        
    	        var since = new Date('01/01/2000');
    	        since.setHours(0);
    	        since.setMinutes(0);
    	        
    	        var upon = new Date('01/03/2000');
    	        upon.setHours(0);
    	        upon.setMinutes(0);
    	        
    	    	// when
    	        var entities = EntityService.listByBirthDate(since,upon);

    	        // then
    	    	expect(entities.length).toEqual(2);
    	    	expect(entities[0].uuid).toEqual(1);
    	    	expect(entities[1].uuid).toEqual(3);
    });
    
});