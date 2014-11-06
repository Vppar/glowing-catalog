describe('Service: CardConfigServiceUpdateSpec', function() {

	var log = {};
	var fakeNow = 1386444467895;
	var CardConfigKeeper = {};

	// load the service's module
	beforeEach(function() {
		spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

		log.debug = jasmine.createSpy('log.debug');

		module('tnt.catalog.card.config.service');
		module(function($provide) {
			$provide.value('$log', log);
			$provide.value('CardConfigKeeper', CardConfigKeeper);
		});
	});
	beforeEach(inject(function(_CardConfig_, _CardConfigService_) {
		CardConfig = _CardConfig_;
		CardConfigService = _CardConfigService_;
	}));

	it('should update a card config instance', function() {
		// given
		CardConfigKeeper.update = jasmine.createSpy('CardConfigKeeper.update');
		CardConfigService.isValid = jasmine.createSpy('CardConfigService.isValid').andReturn([]);

		var uuid = 'cc02b600-5d0b-11e3-96c3-0100ee000001';
		var ccDaysToExpire = '10';
		var ccOpRate1Installment = '1';
		var ccOpRate26Installment = '2.3';
		var ccOpRate712Installment = '3.98';
		var ccClosingDate = '12/01/2014 12:00';
		var ccExpirationDate = '12/01/2014 12:00';
		var dcDaysToExpire = '33';
		var dcOpRate = '1.1';
		
		var ev = new CardConfig(uuid, ccDaysToExpire, ccOpRate1Installment, ccOpRate26Installment, ccOpRate712Installment, ccClosingDate,
				ccExpirationDate, dcDaysToExpire, dcOpRate);

		// when
		var result = CardConfigService.update(ev);

		// then
		expect(CardConfigKeeper.update).toHaveBeenCalledWith(ev);
		expect(result).toBe(undefined);
	});

});