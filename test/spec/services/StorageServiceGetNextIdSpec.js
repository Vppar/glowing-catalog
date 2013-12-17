describe('Service: StorageService.getNextId', function() {

    var log = {};
    var dpStub = {};

    // load the service's module
    beforeEach(function() {
        dpStub.storage = [];
        log.error = jasmine.createSpy('$log.error');

        module('tnt.catalog.service.storage');
        module(function($provide) {
            $provide.value('DataProvider', dpStub);
            $provide.value('$log', log);
        });
    });
    beforeEach(inject(function(_StorageService_) {
        StorageService = _StorageService_;
    }));

    /**
     * <pre>
     * Given a valid storage name
     * and this is storage is populated 
     * when a getNextId is triggered
     * then the next id must be returned
     * </pre>
     */
    it('should return next id', function() {
        // given
        var name = 'storage';
        dpStub.storage.push({
            id : 3,
            stub : 'i\'m stub 3'
        }, {
            id : 2,
            stub : 'i\'m stub 2'
        });

        // when
        var id = StorageService.getNextId(name);

        // then
        expect(id).toBe(4);
    });

    /**
     * <pre>
     * Given a valid storage name 
     * and this is storage is empty
     * when a getNextId is triggered
     * then 1 must be returned
     * </pre>
     */
    it('should return next id=1', function() {
        // given
        var name = 'storage';

        // when
        var id = StorageService.getNextId(name);

        // then
        expect(id).toBe(1);
    });

    /**
     * <pre>
     * Given a invalid storage name
     * when a getNextId is triggered
     * and undefined must be returned
     * </pre>
     */
    it('shouldn\'t return next id', function() {
        // given
        var name = 'storages';

        // when
        var id = StorageService.getNextId(name);

        // then
        expect(id).toBeUndefined();
    });

});
