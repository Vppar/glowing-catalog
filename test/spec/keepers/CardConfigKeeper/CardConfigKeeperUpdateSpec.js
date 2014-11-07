'use strict';

describe('Service: CardConfigKeeper', function() {

	var jKeeper = {};
	var IdentityService = {};
	var fakeUUID = {};
	// load the service's module
	beforeEach(function() {
		module('tnt.catalog.card.config');
		module('tnt.catalog.card.config.entity');
		module('tnt.catalog.card.config.keeper');
		module('tnt.catalog.journal');
		module('tnt.catalog.journal.entity');
		module('tnt.catalog.journal.replayer');
	});

	beforeEach(function() {
		jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');
		fakeUUID = '123456-4646231231-6465';
		IdentityService.getUUID = jasmine.createSpy('IdentityService.getUUID')
				.andReturn(fakeUUID);
		module(function($provide) {
			$provide.value('JournalKeeper', jKeeper);
			$provide.value('IdentityService', IdentityService);
		});
	});

	// instantiate service
	var CardConfigKeeper = undefined;
	var CardConfig = undefined;
	var JournalEntry = undefined;
	beforeEach(inject(function(_CardConfigKeeper_, _CardConfig_,
			_JournalEntry_) {
		CardConfigKeeper = _CardConfigKeeper_;
		CardConfig = _CardConfig_;
		JournalEntry = _JournalEntry_;
	}));

	it('should handle an update a card config', function() {
		// given
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
		expect(function() {
			CardConfigKeeper.handlers['cardConfigUpdateV1'](cardConfig);
		}).toThrow('Unable to find a card config with uuid=\'' + cardConfig.uuid + '\'');

	});

	/**
	 * <pre>
	 * @spec CardConfigKeeper.update#1
	 * Given a valid values
	 * when and create is triggered
	 * then a journal entry must be created
	 * an the entry must be registered
	 * </pre>
	 */

	it('should update', function() {

		var fakeNow = 1386179100000;
		spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

		var uuid1 = 'cc02b600-5d0b-11e3-96c3-0100ee000001';
		var ccDaysToExpire = '10';
		var ccOpRate1Installment = '1';
		var ccOpRate26Installment = '2.3';
		var ccOpRate712Installment = '3.98';
		var ccClosingDate = '12/01/2014 12:00';
		var ccExpirationDate = '12/01/2014 12:00';
		var dcDaysToExpire = '33';
		var dcOpRate = '1.1';

		var stp = fakeNow;
		var ev = new CardConfig(uuid, ccDaysToExpire, ccOpRate1Installment, ccOpRate26Installment, ccOpRate712Installment, ccClosingDate,
				ccExpirationDate, dcDaysToExpire, dcOpRate);
		ev.created = stp;

		var entry = new JournalEntry(null, stp, 'cardConfigUpdate', 1, ev);

		expect(function() {
			CardConfigKeeper.update(ev);
		}).not.toThrow();
		expect(jKeeper.compose).toHaveBeenCalledWith(entry);
	});

	/**
	 * <pre>
	 * @spec CardConfigKeeper.update#2
	 * Given a invalid document
	 * when and update is triggered
	 * then an error must be raised
	 * </pre> 
	 */
	it('should throw error', function() {

		CardConfigKeeper.update = jasmine
				.createSpy('CardConfigKeeper.update').andCallFake(function() {
					throw 'CardConfig not found.';
				});

		var uuid1 = 'cc02b600-5d0b-11e3-96c3-0100ee000001';
		var ccDaysToExpire = '10';
		var ccOpRate1Installment = '1';
		var ccOpRate26Installment = '2.3';
		var ccOpRate712Installment = '3.98';
		var ccClosingDate = '12/01/2014 12:00';
		var ccExpirationDate = '12/01/2014 12:00';
		var dcDaysToExpire = '33';
		var dcOpRate = '1.1';
		var fakeNow = 1386179100000;

		expect(
				function() {
					CardConfigKeeper
							.update(uuid1, ccDaysToExpire, ccOpRate1Installment, ccOpRate26Installment, ccOpRate712Installment, ccClosingDate,
							ccExpirationDate, dcDaysToExpire, dcOpRate);
				}).toThrow('CardConfig not found.');
	});

});
