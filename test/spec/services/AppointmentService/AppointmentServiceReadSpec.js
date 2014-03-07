describe('Service: AppointmentServiceAddSpec', function() {

    var AppointmentService = {};
    var AppointmentKeeper = {};

    // load the service's module
    beforeEach(function() {
    	module('tnt.catalog.appointments.service');
        module('tnt.catalog.appointments.entity');
        module('tnt.catalog.appointments.keeper');
    });
    
    beforeEach(function() {
        AppointmentKeeper.read = jasmine.createSpy('AppointmentKeeper.read');
        module(function($provide) {
            $provide.value('AppointmentKeeper', AppointmentKeeper);
        });
    });
    
    beforeEach(inject(function(_AppointmentKeeper_, _Appointment_, _JournalEntry_, _AppointmentService_) {
        Appointment = _Appointment_; 
        AppointmentService = _AppointmentService_;
    }));
    
    /**
     * <pre>
     * @spec AppointmentService.read#1
     * Given a valid uuid of appointment
     * when read is triggered
     * then the keeper must be call
     * </pre>
     */
    it('must call appointmentkeeper', function() {
        // given
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000002';
        // when
        AppointmentService.read(uuid);
        // then
        expect(AppointmentKeeper.read).toHaveBeenCalledWith(uuid);
        expect(AppointmentService.read).not.toThrow();
    });

});
