describe('Service: AppointmentServiceAddSpec', function() {

    var log = {};
    var fakeNow = 1386444467895;
    var AppointmentKeeper = {};

    // load the service's module
    beforeEach(function() {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        log.debug = jasmine.createSpy('log.debug');

        module('tnt.catalog.appointments.service');
        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('AppointmentKeeper', AppointmentKeeper);
        });
    });
    beforeEach(inject(function(_Appointment_, _AppointmentService_) {
        Appointment = _Appointment_;
        AppointmentService = _AppointmentService_;
    }));

    it('should create a appointment instance', function() {
        // given
        AppointmentKeeper.create = jasmine.createSpy('AppointmentKeeper.create');
        AppointmentService.isValid = jasmine.createSpy('AppointmentService.isValid').andReturn([]);
        
        var appointment = {
                uuid : 1,
                title : 'VISITA NO CLIENTE',
                description : 'VISITA DIA 12/01/2014',
                startDate: new Date(),
                endDate: new Date(),
                address : {street: 'rua', number: 555, cep: '12222-000'},
                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
                allDay : false,
                color : 'red',
                type : 'VISITA',
                status: 'PENDENTE'
        };
        

        // when
        var result = AppointmentService.create(appointment);

        // then
        expect(AppointmentKeeper.create).toHaveBeenCalledWith(new Appointment(appointment));
        expect(result).toBe(undefined);
    });
  
    it('shouldn\'t create a appointment instance', function() {
        // given
        AppointmentService.isValid = jasmine.createSpy('AppointmentService.isValid').andReturn([]);
        AppointmentKeeper.create = jasmine.createSpy('AppointmentKeeper.create').andCallFake(function() {
            throw 'my exception';
        });
        var appointment = {
                uuid : 1,
                title : 'VISITA NO CLIENTE',
                description : 'VISITA DIA 12/01/2014',
                startDate: new Date(),
                endDate: new Date(),
                address : {street: 'rua', number: 555, cep: '12222-000'},
                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
                allDay : false,
                color: 'red',
                type : 'VISITA',
                status: 'PENDENTE'
        };
        // when
        var createCall = function() {
            AppointmentService.create(appointment);
        };

        // then
        expect(createCall).toThrow();
    });

});
