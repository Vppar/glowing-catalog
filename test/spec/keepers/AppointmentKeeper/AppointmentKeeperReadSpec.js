'use strict';

describe('Service: AppointmentKeeperReadSpec', function() {

    // instantiate service
    var AppointmentKeeper = null;
    var appointments = [
        {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            title : 'VISITA 1',
            type : 'VISITA'
        }, {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000002',
            name : 'VISTA 2',
            type : 'VISITA'
        }
    ];

    // load the service's module
    beforeEach(function() {
    	module('tnt.catalog.appointments');
        module('tnt.catalog.appointments.entity');
        module('tnt.catalog.appointments.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    beforeEach(inject(function(_AppointmentKeeper_, _Appointment_, _JournalEntry_) {
        AppointmentKeeper = _AppointmentKeeper_;
    }));

    /**
     * <pre>
     * @spec AppointmentKeeper.read#1
     * Given a valid uuid of appointment
     * when read is triggered
     * then the correct entity must be returned
     * </pre>
     */
    it('return the correct appointment', function() {
        // given
        spyOn(AppointmentKeeper, 'list').andReturn(appointments);
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000002';
        // when
        var appointment = AppointmentKeeper.read(uuid);
        // then
        expect(appointment.title).toEqual(appointments[1].title);
        expect(appointment.type).toEqual(appointments[1].type);
    });

    /**
     * <pre>
     * @spec AppointmentKeeper.read#1
     * Given a invalid uuid of appointment
     * when read is triggered
     * then return must be null
     * </pre>
     */
    it('return null', function() {
        // given
        spyOn(AppointmentKeeper, 'list').andReturn(appointments);
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000003';
        // when
        var appointment = AppointmentKeeper.read(uuid);
        // then
        expect(appointment).toEqual(null);
    });

});
