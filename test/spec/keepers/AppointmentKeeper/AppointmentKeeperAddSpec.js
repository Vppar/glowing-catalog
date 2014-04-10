'use strict';

describe('Service: AppointmentKeeper', function() {

	var jKeeper = {};

	// load the service's module
	beforeEach(function() {
		module('tnt.catalog.appointments');
		module('tnt.catalog.appointments.entity');
		module('tnt.catalog.appointments.keeper');
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
	var AppointmentKeeper = null;
	var Appointment = null;
	var JournalEntry = null;
	var IdentityService = null;
	beforeEach(inject(function(_AppointmentKeeper_, _Appointment_,
			_JournalEntry_, _IdentityService_) {
		AppointmentKeeper = _AppointmentKeeper_;
		Appointment = _Appointment_;
		JournalEntry = _JournalEntry_;
		IdentityService = _IdentityService_;
	}));

	it('should handle an add appointment appointment', function() {
		// given
		var validEntity = {
			uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
			title : 'VISITA NO TERCEIRO',
			description : 'VISITA DIA 12/01/2014',
			startDate : '12/01/2014 12:00',
			endDate : '12/01/2014 12:30',
			address : {
				street : 'rua',
				number : 555,
				cep : '12222-000'
			},
			contacts : [ {
				uuid : 'uidcontato1'
			}, {
				uuid : 'uidcontato2'
			} ],
			type : 'VISITA',
			allDay : false,
			color : 'red',
			status : 'PENDENTE'
		};
		var appointment = new Appointment(validEntity);

		// when
		AppointmentKeeper.handlers['appointmentCreateV1'](appointment);
		var appointments = AppointmentKeeper.list();

		// then
		expect(appointments[0]).not.toBe(appointment);
		expect(appointments[0]).toEqual(appointment);
	});

	/**
	 * <pre>
	 * @spec AppointmentKeeper.add#1
	 * Given a valid values
	 * when and create is triggered
	 * then a journal entry must be created
	 * an the entry must be registered
	 * </pre>
	 */
	it('should add an appoitment', function() {

		var fakeNow = 1386179100000;
		spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

		spyOn(IdentityService, 'getUUID').andReturn(
				'cc02b600-5d0b-11e3-96c3-0100ee000001');

		var uuid = 'cc02b600-5d0b-11e3-96c3-0100ee000001';
		var title = 'VISITA NO TERCEIRO';
		var description = 'VISITA DIA 12/01/2014';

		var date = new Date();
		var allDay = false;
		var color = 'ref';
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
		var status = 'STATUS';

		var stp = fakeNow;
		var ev = new Appointment(uuid, title, description, date, date, address,
				contacts, type, allDay, color, status);
		ev.created = stp;

		var entry = new JournalEntry(null, stp, 'appointmentCreate', 1, ev);

		expect(function() {
			AppointmentKeeper.create(ev);
		}).not.toThrow();
		expect(jKeeper.compose).toHaveBeenCalledWith(entry);
	});
});
