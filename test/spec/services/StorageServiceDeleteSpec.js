describe('Service: StorageService.delete', function() {

    var log = {};
    var dpStub = {};
    var stub = {
        id : 1,
        stub : 'I\'m the stub'
    };
    var findBy = {};
    var filter = {};

    // load the service's module
    beforeEach(function() {
        // Data provider stub and mock
        dpStub.storage = [
            {
                id : 3,
                stub : 'I\'m a stub'
            }, stub, {
                id : 5,
                stub : 'I\'m a stub'
            }
        ];
        dpStub.storage.splice = jasmine.createSpy('storage.splice');

        // $log mock
        log.error = jasmine.createSpy('$log.error');

        // $filter mock
        findBy = jasmine.createSpy('findBy');
        filter = jasmine.createSpy('$filter').andCallFake(function(filter) {
            if (filter === 'findBy') {
                return findBy;
            }
        });

        module('tnt.catalog.service.storage');
        module(function($provide) {
            $provide.value('DataProvider', dpStub);
            $provide.value('$log', log);
            $provide.value('$filter', filter);
        });
    });

    beforeEach(inject(function(_DataProvider_, _StorageService_) {
        DataProvider = _DataProvider_;
        StorageService = _StorageService_;
    }));

    /**
     * <pre>
     * Given a valid storage name
     * and an id present in the storage
     * when delete is triggered
     * then create a journal entry
     * and delete the entity
     * and return true
     * </pre>
     */
    it('should delete a entity', function() {
        // given
        var name = 'storage';
        var id = stub.id;
        StorageService.isValid = jasmine.createSpy('StorageService.isValid').andReturn(true);

        // when
        var result = StorageService.remove(name, id);

        // then
        // TODO - Journal Entry
        expect(dpStub.storage.splice).toHaveBeenCalledWith(1, 1);
        expect(filter).toHaveBeenCalledWith('findBy');
        expect(findBy).toHaveBeenCalledWith(dpStub.storage, 'id', id);
        expect(result).toBe(true);
    });

    /**
     * <pre>
     * Given a valid storage name
     * and an id not present in the storage
     * when an delete is triggered
     * then must be logged: 'StorageService.delete: -Could not find a entity in '{{name}}' to delete, id={{id}}'
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t delete a missing entity', function() {
        // given
        var name = 'storage';
        var id = 18;
        StorageService.isValid = jasmine.createSpy('StorageService.isValid').andReturn(true);

        // when
        var result = StorageService.remove(name, id);

        // then
        expect(log.error).toHaveBeenCalledWith('StorageService.delete: -Could not find a entity in ' + name + ' to delete, id=' + id);
        expect(result).toBe(true);
    });

    /**
     * <pre>
     * Given an invalid storage name
     * when delete is triggered
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t delete an entity of a invalid storage', function() {
        // given
        StorageService.isValid = jasmine.createSpy('StorageService.isValid').andReturn(false);

        // when
        var result = StorageService.remove(name);

        // then
        expect(result).toBe(true);
    });

});
