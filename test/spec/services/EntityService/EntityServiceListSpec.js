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
    	            	birthDate : '01/01/1988'
    	            },
    	            {
    	            	uuid:2,
    	            	birthDate : '05/01/1999'
    	            },
    	            {
    	            	uuid:3,
    	            	birthDate : '03/01/1964'
    	            },
    	            {
    	            	uuid:4,
    	            	birthDate : '06/01/2000'
    	            },
    	            {
    	            	uuid:5,
    	            	birthDate : '04/01/1999'
    	            }
    	        ];
    	        
    	        EntityKeeper.list = jasmine.createSpy('EntityKeeper.list').andReturn(dummyReceivables);
    	    	// when
    	        var entities = EntityService.listByBirthDate('01/01/2000','03/01/2000');

    	        // then
    	    	expect(entities.length).toEqual(2);
    	    	expect(entities[0].uuid).toEqual(1);
    	    	expect(entities[1].uuid).toEqual(3);
    });
    
});