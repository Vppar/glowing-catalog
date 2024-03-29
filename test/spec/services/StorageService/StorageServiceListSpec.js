describe('Service: StorageService', function() {

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
     * when list is triggered
     * then a copy of the list must be returned
     * </pre>
     */
    it('should return a entity list copy', function() {
        // given
    	var name = 'storage';
        StorageService.isValid = jasmine.createSpy('StorageService.isValid').andReturn(true);

        // when
        var entities = StorageService.list(name);

        // then
        expect(entities).not.toBe(dpStub.entities);
        expect(entities).toEqual(dpStub.storage);
    });

    /**
     * <pre>
     * Given an invalid storage name
     * when list is triggered
     * and undefined must be returned
     * </pre>
     */
    it('shouldn\'t return a entity list copy', function() {
        // given
    	var name = 'storages';
        StorageService.isValid = jasmine.createSpy('StorageService.isValid').andReturn(false);

        // when
        var entities = StorageService.list(name);

        // then
        expect(entities).toBeUndefined();
    });

});
