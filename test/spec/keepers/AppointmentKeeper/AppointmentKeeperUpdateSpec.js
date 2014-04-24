'use strict';

describe('Service: AppointmentKeeper', function() {

	var jKeeper = {};
	var IdentityService = {};
	var fakeUUID = {};
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
		fakeUUID = '123456-4646231231-6465';
		IdentityService.getUUID = jasmine.createSpy('IdentityService.getUUID')
				.andReturn(fakeUUID);
		module(function($provide) {
			$provide.value('JournalKeeper', jKeeper);
			$provide.value('IdentityService', IdentityService);
		});
	});

	// instantiate service
	var AppointmentKeeper = undefined;
	var Appointment = undefined;
	var JournalEntry = undefined;
	beforeEach(inject(function(_AppointmentKeeper_, _Appointment_,
			_JournalEntry_) {
		AppointmentKeeper = _AppointmentKeeper_;
		Appointment = _Appointment_;
		JournalEntry = _JournalEntry_;
	}));

	it('should handle an update an appointment appointment', function() {
		// given
		var validAppointment = {
			uuid : 1,
			title : 'VISITA NO CLIENTE',
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
			allDay : false,
			color : 'red',
			type : 'VISITA',
			status : 'PENDENTE'
		};
		var appointment = new Appointment(validAppointment);

		// when
		expect(function() {
			AppointmentKeeper.handlers['appointmentUpdateV1'](appointment);
		}).toThrow('Appointment not found.');

	});

	/**
	 * <pre>
	 * @spec AppointmentKeeper.update#1
	 * Given a valid values
	 * when and create is triggered
	 * then a journal entry must be created
	 * an the entry must be registered
	 * </pre>
	 */

	it('should update', function() {

		var fakeNow = 1386179100000;
		spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

		var uuid = 1;
		var title = 'VISITA NO CLIENTE';
		var description = 'VISITA DIA 12/01/2014';
		var startDate = '12/01/2014 12:00';
		var endDate = '12/01/2014 12:30';
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

		var ev = new Appointment(uuid, title, description, startDate, endDate,
				address, contacts, allDay, color, type, status);
		var stp = fakeNow / 1000;
		var entry = new JournalEntry(null, stp, 'appointmentUpdate', 1, ev);

		expect(function() {
			AppointmentKeeper.update(ev);
		}).not.toThrow();
		expect(jKeeper.compose).toHaveBeenCalledWith(entry);
	});

	/**
	 * <pre>
	 * @spec AppointmentKeeper.update#2
	 * Given a invalid document
	 * when and update is triggered
	 * then an error must be raised
	 * </pre> 
	 */
	it('should throw error', function() {

		AppointmentKeeper.update = jasmine
				.createSpy('AppointmentKeeper.update').andCallFake(function() {
					throw 'Appointment not found.';
				});
		var uuid = 1;
		var title = 'VISITA NO CLIENTE';
		var description = 'VISITA DIA 12/01/2014';
		var date = '12/01/2014';
		var startTime = '12:00';
		var endTime = '12:30';
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

		expect(
				function() {
					AppointmentKeeper
							.update(uuid, title, description, date, startTime,
									endTime, address, contacts, type, status);
				}).toThrow('Appointment not found.');
	});

});
