'use strict';

describe('Service: EventKeeperAddScenario', function() {

    var logger = angular.noop;

    var log = {
        debug : logger,
        error : logger,
        warn : logger,
        fatal : logger
    };

    // load the service's module
    beforeEach(function() {
        localStorage.deviceId = 1;
        module('tnt.vpsa.appointments.entity');
        module('tnt.vpsa.appointments.events.entity');
        module('tnt.vpsa.appointments.events.keeper');

        module(function($provide) {
            $provide.value('$log', log);
        });
    });

    // instantiate service
    var EventKeeper = null;
    var Event = null;
    var $rootScope = null;
    var JournalKeeper = null;
    var WebSQLDriver = null;


    beforeEach(inject(function(_EventKeeper_, _Event_, _$rootScope_, _JournalKeeper_, _WebSQLDriver_) {
        EventKeeper = _EventKeeper_;
        Event = _Event_;
        $rootScope = _$rootScope_;
        JournalKeeper = _JournalKeeper_;
        WebSQLDriver = _WebSQLDriver_;        
    }));

    // Clear existing data
    beforeEach(nukeData);

    /**
     * <pre>
     * @spec EventKeeper.add#1
     * Given a valid values
     * when and create is triggered
     * then a enitity must be created
     * an the entry must be registered
     * </pre>
     */
    it('should create', function() {
        //given
        var uuid = 'cc02b600-5d0b-11e3-96c3-010009000001';
        var title = 'VISITA NO CLIENTE';
        var description = 'VISITA DIA 12/01/2014';
        var date = '12/01/2014';
        var startTime = '12:00';
        var endTime = '12:30';
        var address = {street: 'rua', number: 555, cep: '12222-000'};
        var contacts = [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}];
        var type = 'VISITA';
        var status = 'STATUS';
        
        var ev = new Event(uuid, title, description, date, startTime, endTime, address, contacts, type,  status);
        //when
        runs(function(){
            EventKeeper.create(ev).then(function () {
                log.debug('Event created');
            }, function (err) {
                log.debug('Failed to create entity', err);
            });
            $rootScope.$apply();
        });
        
        waitsFor(function(){
            return EventKeeper.list().length;
        }, 'EventKeeper.create()', 500);
        
        //then
        runs(function(){
            expect(EventKeeper.list()[0].title).toBe('VISITA NO CLIENTE');
            expect(EventKeeper.list().length).toBe(1);
        });

        

    });
    
    /**
     * <pre>
     * @spec EventKeeper.add#1
     * Given a invalid values
     * when and create is triggered
     * then a exception must be throw 'Wrong instance to EventKeeper'
     * </pre>
     */
    it('should not add', function() {
        //given
    	var ev = {
                uuid : 1,
                title : 'VISITA NO CLIENTE',
                description : 'VISITA DIA 12/01/2014',
                date: '12/01/2014',
                startTime: '12:00',
                endTime: '12:30',
                address : {street: 'rua', number: 555, cep: '12222-000'},
                contacts : [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}],
                type : 'VISITA',
                status: 'PENDENTE'
        };
        
        var resolution = null;
        
        runs(function(){
            var promise = EventKeeper.create(ev);
            
            promise['catch'](function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!resolution;
        }, 'Create is taking too long', 500);
        
        runs(function(){
            expect(resolution).toBe('Wrong instance to EventKeeper');
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
