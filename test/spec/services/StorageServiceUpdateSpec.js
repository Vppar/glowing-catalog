describe('Service: StorageService.update', function() {

    var log = {};
    var dpStub = {};
    var stub = {
        id : 1,
        stub : 'I\'m a stub'
    };

    // load the service's module
    beforeEach(function() {
        dpStub.storage = [
            stub
        ];
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
     * and a object with an id present in the storage
     * and the object is a diff between the new and the old entity
     * when an update is triggered
     * then create a journal entry with the diff
     * and recreate the original object
     * and update the entity
     * and return true
     * </pre>
     */
    it('should update an entity', function() {
        // given
        var name = 'storage';
        var diffEntity = {
            id : 1,
            stub : 'I\'m a stub 1'
        };
        StorageService.isValid = jasmine.createSpy('StorageService.isValid').andReturn(true);

        // when
        var result = StorageService.update(name, diffEntity);

        // then
        // TODO - Journal entry
        // TODO - Recreate object
        expect(dpStub.storage[0]).toEqual(diffEntity);
        expect(result).toBe(true);
    });

    /**
     * <pre>
     * Given an valid storage name
     * and a object with an id not present in the storage
     * when an update is triggered
     * then must be logged: 'StorageService.update : -Could not find a entity in '{{name}}' to update, id={{entity.id}}'
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t update an entity', function() {
        // given
        var name = 'storage';
        var diffEntity = {
            id : 2,
            stub : 'I\'m a stub2'
        };
        StorageService.isValid = jasmine.createSpy('StorageService.isValid').andReturn(true);

        // when
        var result = StorageService.update(name, diffEntity);

        // then
        expect(log.error).toHaveBeenCalledWith(
                'StorageService.update : -Could not find a entity in ' + name + ' to update, id=' + diffEntity.id);
        expect(result).toBe(false);
    });

    /**
     * <pre>
     * Given an invalid storage name
     * when update is triggered
     * and false must be returned
     * </pre>
     */
    it('should report invalid storate', function() {
        // given
        var name = 'storage';
        StorageService.isValid = jasmine.createSpy('StorageService.isValid').andReturn(false);

        // when
        var result = StorageService.isValid(name);

        // then
        expect(result).toBe(false);
    });
});
