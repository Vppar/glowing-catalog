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
    beforeEach(inject(function(_DataProvider_, _StorageService_) {
        DataProvider = _DataProvider_;
        StorageService = _StorageService_;
    }));

    /**
     * <pre>
     * Given an existing storage name
     * when a isValid is triggered
     * then true must be returned
     * </pre>
     */
    it('should report a valid storage name', function() {
        // given
        var name = 'storage';

        // when
        var result = StorageService.isValid(name);

        // then
        expect(result).toBe(true);
    });
    /**
     * <pre>
     * Given an absent storage name
     * when a isValid is triggered
     * then must be logged 'StorateService.isValid: -Invalid storage name, name={{name}}'
     * and false must be returned
     * </pre>
     */
    it('should report a invalid storage name', function() {
        // given
        var name = 'storages';

        // when
        var result = StorageService.isValid(name);

        // then
        expect(log.error).toHaveBeenCalledWith('StorateService.isValid: -Invalid storage name, name=' + name);
        expect(result).toBe(false);
    });
    /**
     * <pre>
     * Given an existing storage name
     * and a null storage
     * when a isValid is triggered
     * then must be logged 'StorateService.isValid: -Empty storage'
     * and false must be returned
     * </pre>
     */
    it('should report a empty storage name', function() {
        // given
        var name = 'storage';
        dpStub.storage = null;

        // when
        var result = StorageService.isValid(name);

        // then
        expect(log.error).toHaveBeenCalledWith('StorateService.isValid: -Empty storage');
        expect(result).toBe(false);
    });

});
