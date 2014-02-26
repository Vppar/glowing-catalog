'use strict';

describe('Service: AppointmentServiceAddScenario', function() {

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
        module('tnt.catalog.appointments.service');
        module('tnt.catalog.appointments.entity');
        module('tnt.catalog.appointments.keeper');

        module(function($provide) {
          $provide.value('$log', log);
        });
    });

    // instantiate service
    var AppointmentService = undefined;
    var Appointment = undefined;
    var $rootScope = undefined;
    var JournalKeeper = undefined;
    
    beforeEach(inject(function(_$rootScope_, _AppointmentService_, _Appointment_, _JournalKeeper_) {
        AppointmentService = _AppointmentService_;
        Appointment = _Appointment_;
        $rootScope = _$rootScope_;
        JournalKeeper = _JournalKeeper_;
    }));

    beforeEach(nukeData);
    
    /**
     * <pre>
     * @spec AppointmentService.create
     * Given a valid values
     * when and create is triggered
     * then a appointment must be created
     * an the entry must be registered
     * </pre>
     */
    it('should create', function() {
    	//given
        var uuid = 'cc02b600-5d0b-11e3-96c3-0100ff000001';
        var title = 'VISITA NO CLIENTE';
        var description = 'VISITA DIA 12/01/2014';
        var date = '12/01/2014';
        var startTime = '12:00';
        var endTime = '12:30';
        var address = {street: 'rua', number: 555, cep: '12222-000'};
        var contacts = [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}];
        var type = 'VISITA';
        var status = 'STATU';
        
        var ev = new Appointment(uuid, title, description, date, startTime, endTime, address, contacts, type,  status);
        
        var created = false;

        //when
        runs(function(){
            var promise = AppointmentService.create(ev);
            promise.then(function (result) {
                log.debug('Appointment created!', result);
                created = true;
            }, function (err) {
                log.debug('Failed to create Appointment!', err);
            });

            $rootScope.$apply();
        });
        
        waitsFor(function(){
            return created;
        }, 'AppointmentService.create()', 500);
        
        
        //then
        runs(function(){
        	expect(AppointmentService.list().length).toBe(1);
            expect(AppointmentService.list()[0].title).toBe('VISITA NO CLIENTE');
        });
    });


    function nukeData() {
        var nuked = null;

        runs(function () {
            JournalKeeper.nuke().then(function () {
                log.debug('Nuked data!');
                nuked = true;
            });

            $rootScope.$apply();
        });

        waitsFor(function () {
            return nuked;
        }, 'JournalKeeper.nuke()');
    }
});
