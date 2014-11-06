'use strict';

describe('Service: CardConfigKeeperUpdateScenario', function() {

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
		module('tnt.catalog.card.config.entity');
		module('tnt.catalog.card.config.keeper');

		module(function($provide) {
			$provide.value('$log', log);
		});
	});

	// instantiate service
	var JournalKeeper = null;
	var CardConfigKeeper = null;
	var CardConfig = null;
	var $rootScope = null;

	beforeEach(inject(function(_CardConfigKeeper_, _CardConfig_,
			_$rootScope_, _JournalKeeper_) {
		JournalKeeper = _JournalKeeper_;
		CardConfigKeeper = _CardConfigKeeper_;
		CardConfig = _CardConfig_;
		$rootScope = _$rootScope_;
	}));

	beforeEach(nukeData);

	/**
	 * <pre>
	 * @spec CardConfigKeeper.update#1
	 * Given a already registered client
	 * when and update is triggered
	 * then a Card Config must be updated
	 * the entry must be registered
	 * </pre>
	 */
	it('should update', function() {

		//given
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

		runs(function() {

			var stp = fakeNow;
			var ev = new CardConfig(uuid1, ccDaysToExpire, ccOpRate1Installment, ccOpRate26Installment, ccOpRate712Installment, ccClosingDate,
				ccExpirationDate, dcDaysToExpire, dcOpRate);
			ev.created = stp;

			var promise = CardConfigKeeper.add(ev);

			promise.then(function(_uuid_) {
				log.debug('Card Config\'s uuid:', _uuid_);
				uuid = _uuid_;
			}, function(err) {
				log.debug('Failed to create Card Config', err);
			});

			$rootScope.$apply();
		});

		waitsFor(function() {
			return !!uuid;
		}, 'Create is taking too long', 500);

		runs(function() {
			var fakeNow = 1386179100000;
			var stp = fakeNow;
			var ev = new CardConfig(uuid1, ccDaysToExpire, ccOpRate1Installment, ccOpRate26Installment, ccOpRate712Installment, ccClosingDate,
				ccExpirationDate, dcDaysToExpire, dcOpRate);
			ev.created = stp;

			var promise = CardConfigKeeper.update(ev);

			uuid = null;

			promise.then(function(_uuid_) {
				uuid = _uuid_;
			});
		});

		waitsFor(function() {
			$rootScope.$apply();
			return !!uuid;
		}, 'Update is taking too long', 500);

		runs(function() {
			expect(CardConfigKeeper.list().length).toBe(1);
			expect(CardConfigKeeper.list()[0].dcDaysToExpire).toBe('33');
		});

	});

	/**
	 * <pre>
	 * @spec CardConfigKeeper.update#1
	 * Given a unregistered client
	 * when and update is triggered
	 * then a Card Config must not be updated
	 * </pre>
	 */
	it('should not update', function() {

		var uuid1 = 'cc02b600-5d0b-11e3-96c3-0100ee000001';
		var uuid2 = 'aa02b600-5d0b-11e3-96c3-0100ee000099';
		var ccDaysToExpire = '10';
		var ccOpRate1Installment = '1';
		var ccOpRate26Installment = '2.3';
		var ccOpRate712Installment = '3.98';
		var ccClosingDate = '12/01/2014 12:00';
		var ccExpirationDate = '12/01/2014 12:00';
		var dcDaysToExpire = '33';
		var dcOpRate = '1.1';	
		var fakeNow = 1386179100000;
		var stp = fakeNow;
		var ev = new CardConfig(uuid1, ccDaysToExpire, ccOpRate1Installment, ccOpRate26Installment, ccOpRate712Installment, ccClosingDate,
				ccExpirationDate, dcDaysToExpire, dcOpRate);
		ev.created = stp;

		var ev2 = new CardConfig(uuid2, ccDaysToExpire, ccOpRate1Installment, ccOpRate26Installment, ccOpRate712Installment, ccClosingDate,
				ccExpirationDate, dcDaysToExpire, dcOpRate);

		var created = null;

		runs(function() {
			var promise = CardConfigKeeper.add(ev);
			promise.then(function(result) {
				created = true;
			}, function(err) {
			});

			$rootScope.$apply();
		});

		waitsFor(function() {
			return created;
		}, 'CardConfigKeeper.add()', 300);

		runs(function() {
			var createCall = function() {
				CardConfigKeeper.handlers.cardConfigUpdateV1(ev2);
			};
			expect(createCall).toThrow('Unable to find a card config with uuid=\'' + ev2.uuid + '\'');
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
