'use strict';

describe('Service: CardConfigKeeperAddScenario', function() {

	var logger = angular.noop;

	var log = {
		debug : logger,
		error : logger,
		warn : logger,
		fatal : logger
	};

	// load the service's module
	beforeEach(function() {
		localStorage.deviceId = 1;
		module('tnt.catalog.card.config');
		module('tnt.catalog.card.config.entity');
		module('tnt.catalog.card.config.keeper');

		module(function($provide) {
			$provide.value('$log', log);
		});
	});
	

	// instantiate service
	var CardConfigKeeper = null;
	var CardConfig = null;
	var $rootScope = null;
	var JournalKeeper = null;

	beforeEach(inject(function(_CardConfigKeeper_, _CardConfig_, _$rootScope_, _JournalKeeper_) {
		CardConfigKeeper = _CardConfigKeeper_;
		CardConfig = _CardConfig_;
		$rootScope = _$rootScope_;
		JournalKeeper = _JournalKeeper_;
	}));

	// Clear existing data
	beforeEach(nukeData);

	/**
	 * <pre>
	 * @spec CardConfigKeeper.add#1
	 * Given a valid values
	 * when and create is triggered
	 * then a enitity must be created
	 * an the entry must be registered
	 * </pre>
	 */
	it('should create',
			function() {

				var fakeNow = 1386179100000;

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

				var stp = fakeNow;
				var ev = new CardConfig(uuid, ccDaysToExpire, ccOpRate1Installment, ccOpRate26Installment, ccOpRate712Installment, ccClosingDate,
						ccExpirationDate, dcDaysToExpire, dcOpRate);
				ev.created = stp;

				//when
				runs(function() {
					CardConfigKeeper.add(ev).then(function() {
						log.debug('Card Config created');
					}, function(err) {
						log.debug('Failed to create entity', err);
					});
					$rootScope.$apply();
				});

				waitsFor(function() {
					return CardConfigKeeper.list().length;
				}, 'CardConfigKeeper.add()', 500);

				//then
				runs(function() {
					expect(CardConfigKeeper.list()[0].ccDaysToExpire).toBe(
							'10');
					expect(CardConfigKeeper.list().length).toBe(1);
				});

			});

	/**
	 * <pre>
	 * @spec CardConfigKeeper.add#1
	 * Given a invalid values
	 * when and create is triggered
	 * then a exception must be throw 'Wrong instance to CardConfigKeeper'
	 * </pre>
	 */
	it('should not add', function() {
		//given
		var ev = {
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

		var resolution = null;

		runs(function() {
			var promise = CardConfigKeeper.add(ev);

			promise.then(null, function(_resolution_) {
				resolution = _resolution_;
			});
		});

		waitsFor(function() {
			$rootScope.$apply();
			return !!resolution;
		}, 'Create is taking too long', 500);

		runs(function() {
			expect(resolution).toBe('Wrong instance of CardConfig');
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
