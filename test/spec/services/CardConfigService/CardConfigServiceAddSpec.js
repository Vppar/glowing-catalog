describe('Service: CardConfigServiceAddSpec', function() {

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

	it('should create a card config instance', function() {
		// given
		CardConfigKeeper.add = jasmine.createSpy('CardConfigKeeper.add');
		CardConfigService.isValid = jasmine.createSpy('CardConfigService.isValid').andReturn([]);

		var validEntity = {
			uuid : 'cc33b122-5d0b-22e3-44c3-020001000001',
			ccDaysToExpire : '10',
			ccOpRate1Installment : '1',
			ccOpRate26Installment : '2.3',
			ccOpRate712Installment : '3.98',
			ccClosingDate : '12/01/2014 00:00',
			ccExpirationDate : '12/01/2014 00:00',
			dcDaysToExpire : '33',
			dcOpRate : '1.1'			
		};

		var cardConfig = new CardConfig(validEntity);

		// when
		var result = CardConfigService.add(cardConfig);

		// then
		expect(CardConfigKeeper.add).toHaveBeenCalledWith(cardConfig);
		expect(result).toBe(undefined);
	});

	it('shouldn\'t create a card config instance', function() {
		// given
		CardConfigService.isValid = jasmine.createSpy('CardConfigService.isValid').andReturn([]);
		CardConfigKeeper.add = jasmine.createSpy('CardConfigKeeper.add').andCallFake(function() {
			throw 'my exception';
		});

		var validEntity = {
			uuid : 'cc33b122-5d0b-22e3-44c3-020001000001',
			ccDaysToExpire : '10',
			ccOpRate1Installment : '1',
			ccOpRate26Installment : '2.3',
			ccOpRate712Installment : '3.98',
			ccClosingDate : '12/01/2014 00:00',
			ccExpirationDate : '12/01/2014 00:00',
			dcDaysToExpire : '33',
			dcOpRate : '1.1'			
		};

		// when
		var createCall = function() {
			CardConfigService.add(validEntity);
		};

		// then
		expect(createCall).toThrow();
	});

});
