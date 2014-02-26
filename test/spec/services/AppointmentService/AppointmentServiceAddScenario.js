'use strict';

describe('Service: EventServiceAddScenario', function() {

    var logger = angular.noop;

    var log = {
        debug : logger,
        error : logger,
        warn : logger,
        fatal : logger
    };

    // load the service's module
    beforeEach(function() {
        module('tnt.vpsa.appointments.entity');
        module('tnt.vpsa.appointments.events.service');
        module('tnt.vpsa.appointments.events.entity');
        module('tnt.vpsa.appointments.events.keeper');

        module(function($provide) {
          $provide.value('$log', log);
        });
    });

    // instantiate service
    var EventService = undefined;
    var Event = undefined;
    var $rootScope = undefined;
    var JournalKeeper = undefined;
    
    beforeEach(inject(function(_$rootScope_, _EventService_, _Event_, _JournalKeeper_) {
        EventService = _EventService_;
        Event = _Event_;
        $rootScope = _$rootScope_;
        JournalKeeper = _JournalKeeper_;
    }));

    beforeEach(nukeData);
    
    /**
     * <pre>
     * @spec EventService.create
     * Given a valid values
     * when and create is triggered
     * then a event must be created
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
        
        var ev = new Event(uuid, title, description, date, startTime, endTime, address, contacts, type,  status);
        
        var created = false;

        //when
        runs(function(){
            var promise = EventService.create(ev);
            promise.then(function (result) {
                log.debug('Event created!', result);
                created = true;
            }, function (err) {
                log.debug('Failed to create Event!', err);
            });

            $rootScope.$apply();
        });
        
        waitsFor(function(){
            return created;
        }, 'EventService.create()', 500);
        
        
        //then
        runs(function(){
        	expect(EventService.list().length).toBe(1);
            expect(EventService.list()[0].title).toBe('VISITA NO CLIENTE');
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
