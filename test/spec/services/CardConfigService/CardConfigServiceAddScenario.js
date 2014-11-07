'use strict';

describe('Service: CardConfigServiceAddScenario', function() {

	var logger = angular.noop;

	var log = {
		debug : logger,
		error : logger,
		warn : logger,
		fatal : logger
	};

	// load the service's module
	beforeEach(function() {
		module('tnt.catalog.card.config');
		module('tnt.catalog.card.config.service');
		module('tnt.catalog.card.config.entity');
		module('tnt.catalog.card.config.keeper');

		module(function($provide) {
			$provide.value('$log', log);
		});
	});

	// instantiate service
	var CardConfigService = undefined;
	var CardConfig = undefined;
	var $rootScope = undefined;
	var JournalKeeper = undefined;

	beforeEach(inject(function(_$rootScope_, _CardConfigService_,
			_CardConfig_, _JournalKeeper_) {
		CardConfigService = _CardConfigService_;
		CardConfig = _CardConfig_;
		$rootScope = _$rootScope_;
		JournalKeeper = _JournalKeeper_;
	}));

	beforeEach(nukeData);

	/**
	 * <pre>
	 * @spec CardConfigService.create
	 * Given a valid values
	 * when and create is triggered
	 * then a card config must be created
	 * an the entry must be registered
	 * </pre>
	 */
	it('should create', function() {
		//given
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
		ev.created = 1386179100000;

		var created = false;

		//when
		runs(function() {
			var promise = CardConfigService.add(ev);
			promise.then(function(result) {
				log.debug('Card Config created!', result);
				created = true;
			}, function(err) {
				log.debug('Failed to create Card Config!', err);
			});

			$rootScope.$apply();
		});

		waitsFor(function() {
			return created;
		}, 'CardConfigService.add()', 500);

		//then
		runs(function() {
			expect(CardConfigService.list().length).toBe(1);
			expect(CardConfigService.list()[0].ccOpRate26Installment).toBe('2.3');
		});
	});

	function nukeData() {
		var nuked = null;

		runs(function() {
			JournalKeeper.nuke().then(function() {
				log.debug('Nuked data!');
				nuked = true;
			});

			$rootScope.$apply();
		});

		waitsFor(function() {
			return nuked;
		}, 'JournalKeeper.nuke()');
	}
});