'use strict';

describe('Service: AppointmentKeeperUpdateScenario', function() {

	var logger = angular.noop;

	var log = {
		debug : logger,
		error : logger,
		warn : logger,
		fatal : logger
	};

	// load the service's module
	beforeEach(function() {
		module('tnt.catalog.appointments');
		module('tnt.catalog.appointments.entity');
		module('tnt.catalog.appointments.keeper');

		module(function($provide) {
			$provide.value('$log', log);
		});
	});

	// instantiate service
	var JournalKeeper = null;
	var AppointmentKeeper = null;
	var Appointment = null;
	var $rootScope = null;

	beforeEach(inject(function(_AppointmentKeeper_, _Appointment_,
			_$rootScope_, _JournalKeeper_) {
		JournalKeeper = _JournalKeeper_;
		AppointmentKeeper = _AppointmentKeeper_;
		Appointment = _Appointment_;
		$rootScope = _$rootScope_;
	}));

	beforeEach(nukeData);

	/**
	 * <pre>
	 * @spec AppointmentKeeper.update#1
	 * Given a already registered client
	 * when and update is triggered
	 * then a Appointment must be updated
	 * an the entry must be registered
	 * </pre>
	 */
	it('should update', function() {

		//given
		var title = 'VISITA NO TERCEIRO';
		var description = 'VISITA DIA 12/01/2014';
		var date = new Date();
		var address = {
			street : 'rua',
			number : 555,
			cep : '12222-000'
		};
		var contacts = [ {
			uuid : 'uidcontato1'
		}, {
			uuid : 'uidcontato2'
		} ];
		var type = 'VISITA';
		var allDay = false;
		var color = 'red';
		var status = 'STATUS';

		var uuid = null;

		runs(function() {

			var ev = new Appointment(uuid, title, description, date, date,
					address, contacts, allDay, color, type, status);

			var promise = AppointmentKeeper.create(ev);

			promise.then(function(_uuid_) {
				log.debug('Appointment\'s uuid:', _uuid_);
				uuid = _uuid_;
			}, function(err) {
				log.debug('Failed to create Appointment', err);
			});

			$rootScope.$apply();
		});

		waitsFor(function() {
			return !!uuid;
		}, 'Create is taking too long', 500);

		runs(function() {
			var title = 'super bad client';
			var ev = new Appointment(uuid, title, description, date, date,
					address, contacts, allDay, color, type, status);

			var promise = AppointmentKeeper.update(ev);

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
			expect(AppointmentKeeper.list().length).toBe(1);
			expect(AppointmentKeeper.list()[0].title).toBe('super bad client');
		});

	});

	/**
	 * <pre>
	 * @spec AppointmentKeeper.update#1
	 * Given a unregistered client
	 * when and update is triggered
	 * then a Appointment must not be updated
	 * </pre>
	 */

	//FIXME -Fabio - Not sure about this test.
	it('should not update', function() {

		var title = 'VISITA NO TERCEIRO';
		var description = 'VISITA DIA 12/01/2014';
		var date = new Date();
		var address = {
			street : 'rua',
			number : 555,
			cep : '12222-000'
		};
		var contacts = [ {
			uuid : 'uidcontato1'
		}, {
			uuid : 'uidcontato2'
		} ];
		var type = 'VISITA';
		var allDay = false;
		var color = 'red';
		var status = 'STATUS';

		var ev = new Appointment(1, title, description, date, date, address,
				contacts, allDay, color, type, status);

		var ev2 = new Appointment(2, title, description, date, date, address,
				contacts, allDay, color, type, status);
		ev2.title = 'super bad client';
		ev2.description = 'cassiana';

		var created = null;

		runs(function() {
			var promise = AppointmentKeeper.create(ev);
			promise.then(function(result) {
				created = true;
			}, function(err) {
			});

			$rootScope.$apply();
		});

		waitsFor(function() {
			return created;
		}, 'AppointmentKeeper.create()', 300);

		runs(function() {
			var createCall = function() {
				AppointmentKeeper.handlers.appointmentUpdateV1(ev2);
			};
			expect(createCall).toThrow('Appointment not found.');
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
