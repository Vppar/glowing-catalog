describe('Service: StorageService', function() {

    var log = {};
    var dpStub = {};
    var fakeTime = 1386444467895;

    // load the service's module
    beforeEach(function() {

        // $log mock
        log.error = jasmine.createSpy('$log.error');
        dpStub.storage = [];

        spyOn(Date.prototype, 'getTime').andReturn(fakeTime);

        module('tnt.catalog.service.storage');
        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('DataProvider', dpStub);
        });
    });
    beforeEach(inject(function(_StorageService_) {
        StorageService = _StorageService_;
    }));

    /**
     * <pre>
     * Given a valid storage name
     * and a validated entity
     * when insert is triggered
     * then a unique id must be set
     * and a create date must be set
     * and an update date must be set
     * and a journal entry must be added
     * and an entity must be inserted in the storage
     * and the id must be returned
     * </pre>
     */
    it('should insert an entity', function() {
        // given
        var name = 'storage';
        var entity = {};
        StorageService.isValid = jasmine.createSpy('StorageService.isValid').andReturn(true);

        // when
        var id = StorageService.insert(name, entity);

        // then
        expect(StorageService.isValid).toHaveBeenCalledWith(name);
        expect(entity.id).toBeGreaterThan(0);
        expect(entity.createdate).toBe(fakeTime);
        expect(entity.updatedate).toBe(fakeTime);
        // TODO - Journal entry
        expect(id).toBe(entity.id);
    });

    /**
     * <pre>
     * Given an invalid storage name
     * when insert is triggered
     * then undefined must be returned
     * </pre>
     */
    it('shouldn\'t insert an entity', function() {
        // given
    	 var name = 'storage';
         var entity = {};
        StorageService.isValid = jasmine.createSpy('StorageService.isValid').andReturn(false);

        // when
        var id = StorageService.insert(name, entity);

        // then
        expect(id).toBeUndefined();
    });
});
