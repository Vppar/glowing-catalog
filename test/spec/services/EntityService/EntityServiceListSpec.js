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
});