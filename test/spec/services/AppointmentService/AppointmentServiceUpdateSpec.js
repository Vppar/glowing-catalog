describe('Service: AppointmentServiceUpdateSpec', function() {

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

    it('should update a appointment instance', function() {
        // given
    	AppointmentKeeper.update = jasmine.createSpy('AppointmentKeeper.update');
    	AppointmentService.isValid = jasmine.createSpy('AppointmentService.isValid').andReturn([]);
        
    	var appointment = {
                uuid : 1,
                title : 'VISITA NO CLIENTE',
                description : 'VISITA DIA 12/01/2014',
                startDate: '01/01/2000',
                endDate: '01/01/2000',
                address : {street: 'rua', number: 555, cep: '12222-000'},
                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
                allDay: false,
                color: 'red',
                type : 'VISITA',
                status: 'PENDENTE'
        };

        // when
        var result = AppointmentService.update(appointment);

        // then
        expect(AppointmentKeeper.update).toHaveBeenCalledWith(appointment);
        expect(result).toBe(undefined);
    });
  
    it('shouldn\'t update a appointment instance', function() {
        // given
        AppointmentService.isValid = jasmine.createSpy('AppointmentKeeper.isValid').andReturn([]);
        AppointmentKeeper.update = jasmine.createSpy('AppointmentKeeper.update').andCallFake(function() {
            throw 'my exception';
        });
        var appointment = {
        		uuid : 1,
                title : 'VISITA NO CLIENTE',
                description : 'VISITA DIA 12/01/2014',
                startDate: '01/01/2000',
                endDate: '01/01/2000',
                address : {street: 'rua', number: 555, cep: '12222-000'},
                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
                allDay: false,
                color: 'red',
                type : 'VISITA',
                status: 'PENDENTE'
        };
        // when
        var createCall = function() {
            AppointmentService.update(appointment);
        };

        // then
        expect(createCall).toThrow();
    });
    
    it('should done an appointment', function() {
    	var appointments = [{
    			uuid : 1,
                title : 'VISITA NO CLIENTE',
                description : 'VISITA DIA 12/01/2014',
                startDate: '01/01/2000',
                endDate: '01/01/2000',
                address : {street: 'rua', number: 555, cep: '12222-000'},
                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
                allDay: false,
                color: 'red',
                type : 'VISITA',
                status: 'PENDENTE'
        }];
    	
    	var appointmentDone = {
    			uuid : 1,
                title : 'VISITA NO CLIENTE',
                description : 'VISITA DIA 12/01/2014',
                startDate: '01/01/2000',
                endDate: '01/01/2000',
                address : {street: 'rua', number: 555, cep: '12222-000'},
                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
                allDay: false,
                color: 'red',
                type : 'VISITA',
                status: 'DONE'
        };
    	
        // given
    	AppointmentKeeper.update = jasmine.createSpy('AppointmentKeeper.update');
        AppointmentService.isValid = jasmine.createSpy('AppointmentKeeper.isValid').andReturn([]);
        AppointmentKeeper.list = jasmine.createSpy('AppointmentKeeper.list').andReturn(appointments);
        
        // when
        var result = AppointmentService.done(1);

        // then
        expect(AppointmentKeeper.update).toHaveBeenCalledWith(appointmentDone);
        expect(result).toBe(undefined);
    });

    it('should cancel an appointment', function() {

    	var appointments = [{
    			uuid : 1,
                title : 'VISITA NO CLIENTE',
                description : 'VISITA DIA 12/01/2014',
                startDate: '01/01/2000',
                endDate: '01/01/2000',
                address : {street: 'rua', number: 555, cep: '12222-000'},
                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
                allDay: false,
                color: 'red',
                type : 'VISITA',
                status: 'PENDENTE'
        }];
    	
    	var appointmentCancel = {
    			uuid : 1,
                title : 'VISITA NO CLIENTE',
                description : 'VISITA DIA 12/01/2014',
                startDate: '01/01/2000',
                endDate: '01/01/2000',
                address : {street: 'rua', number: 555, cep: '12222-000'},
                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
                allDay: false,
                color: 'red',
                type : 'VISITA',
                status: 'CANCELLED'
        };
    	
        // given
    	AppointmentKeeper.update = jasmine.createSpy('AppointmentKeeper.update');
        AppointmentService.isValid = jasmine.createSpy('AppointmentKeeper.isValid').andReturn([]);
        AppointmentKeeper.list = jasmine.createSpy('AppointmentKeeper.list').andReturn(appointments);
        
        // when
        var result = AppointmentService.cancel(1);

        // then
        expect(AppointmentKeeper.update).toHaveBeenCalledWith(appointmentCancel);
        expect(result).toBe(undefined);
    });
    
    it('should remove an appointment', function() {

    	var appointments = [{
    			uuid : 1,
                title : 'VISITA NO CLIENTE',
                description : 'VISITA DIA 12/01/2014',
                startDate: '01/01/2000',
                endDate: '01/01/2000',
                address : {street: 'rua', number: 555, cep: '12222-000'},
                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
                allDay: false,
                color: 'red',
                type : 'VISITA',
                status: 'PENDENTE'
        }];
    	
    	var appointmentRemoved = {
    			uuid : 1,
                title : 'VISITA NO CLIENTE',
                description : 'VISITA DIA 12/01/2014',
                startDate: '01/01/2000',
                endDate: '01/01/2000',
                address : {street: 'rua', number: 555, cep: '12222-000'},
                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
                allDay: false,
                color: 'red',
                type : 'VISITA',
                status: 'REMOVED'
        };
    	
        // given
    	AppointmentKeeper.update = jasmine.createSpy('AppointmentKeeper.update');
        AppointmentService.isValid = jasmine.createSpy('AppointmentKeeper.isValid').andReturn([]);
        AppointmentKeeper.list = jasmine.createSpy('AppointmentKeeper.list').andReturn(appointments);
        
        // when
        var result = AppointmentService.remove(1);

        // then
        expect(AppointmentKeeper.update).toHaveBeenCalledWith(appointmentRemoved);
        expect(result).toBe(undefined);
    });
    

});
