describe('Service: StorageService.get', function() {

	var log = {};
	var stub = {};
	var dpStub = {};

	// load the service's module
	beforeEach(function() {
		stub = {
			id : 1,
			stub : 'I\'m a stub'
		};
		dpStub.storage = [ stub ];
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
	 * and an existing id
	 * when get is triggered
	 * then a copy of the entity must be returned
	 * </pre>
	 */
	it('should return a entity', function() {
		// given  
		var id = stub.id;
		StorageService.isValid = jasmine.createSpy('StorageService.isValid')
				.andReturn(true);

		// when
		var entity = StorageService.get('storage', id);

		// then
		expect(entity.id).toBe(id);
		expect(entity).not.toBe(stub);
		expect(entity).toEqual(stub);

	});

	/**
	 * <pre>
	 * Given a non-existent id
	 * when get is triggered
	 * then must be logged: 'ServiceStorage.get: -Receivable not found, id={{id}}.'
	 * and undefined must be returned
	 * </pre>
	 */
	it('shouldn\'t return a entity, missing id', function() {
		// given
		var id = 2;

		// when
		var entity = StorageService.get('storage', id);

		// then
		expect(log.error).toHaveBeenCalledWith(
				'StorageService.get: -Receivable not found, id=' + id);
		expect(entity).toBeUndefined();
	});

	/**
	 * <pre>
	 * Givenan invalid storage name
	 * when get is triggered
	 * and undefined must be returned
	 * </pre>
	 */
	it('shouldn\'t return a entity, missing storage', function() {
		// given
		StorageService.isValid = jasmine.createSpy('StorageService.isValid')
				.andReturn(false);
		var id = 10;
		// when
		var entity = StorageService.get('storage', id);

		// then
		expect(entity).toBeUndefined();
	});
});