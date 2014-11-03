'use strict';

describe('Service: CardConfigKeeper', function() {

	var jKeeper = {};

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

		module(function($provide) {
			$provide.value('JournalKeeper', jKeeper);
		});
	});

	// instantiate service
	var CardConfigKeeper = null;
	var CardConfig = null;
	var JournalEntry = null;
	var IdentityService = null;
	beforeEach(inject(function(_CardConfigKeeper_, _CardConfig_,
			_JournalEntry_, _IdentityService_) {
		CardConfigKeeper = _CardConfigKeeper_;
		CardConfig = _CardConfig_;
		JournalEntry = _JournalEntry_;
		IdentityService = _IdentityService_;
	}));

	it('should handle an add card config', function() {
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
		CardConfigKeeper.handlers['cardConfigAddV1'](cardConfig);
		var cardConfigs = CardConfigKeeper.list();

		// then
		expect(cardConfigs[0]).not.toBe(cardConfig);
		expect(cardConfigs[0]).toEqual(cardConfig);
	});

	/**
	 * <pre>
	 * @spec CardConfigKeeper.add#1
	 * Given a valid values
	 * when and create is triggered
	 * then a journal entry must be created
	 * an the entry must be registered
	 * </pre>
	 */
	it('should add an card config', function() {

		var fakeNow = 1386179100000;
		spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

		spyOn(IdentityService, 'getUUID').andReturn('cc02b600-5d0b-11e3-96c3-0100ee000001');

		var uuid = 'cc02b600-5d0b-11e3-96c3-0100ee000001';
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

		var entry = new JournalEntry(null, stp, 'cardConfigAdd', 1, ev);

		expect(function() {
			CardConfigKeeper.add(ev);
		}).not.toThrow();
		expect(jKeeper.compose).toHaveBeenCalledWith(entry);
	});
});
