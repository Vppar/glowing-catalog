'use strict';

describe('Service: EventKeeperUpdateScenario', function() {

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
        module('tnt.vpsa.appointments.events.entity');
        module('tnt.vpsa.appointments.events.keeper');

        module(function($provide) {
          $provide.value('$log', log);
        });
    });

    // instantiate service
    var JournalKeeper = null;
    var EventKeeper = null;
    var Event = null;
    var $rootScope = null;

    beforeEach(inject(function(_EventKeeper_, _Event_, _$rootScope_, _JournalKeeper_) {
        JournalKeeper = _JournalKeeper_;
        EventKeeper = _EventKeeper_;
        Event = _Event_;
        $rootScope = _$rootScope_;
    }));


    beforeEach(nukeData);
    
    /**
     * <pre>
     * @spec EventKeeper.update#1
     * Given a already registered client
     * when and update is triggered
     * then a Event must be updated
     * an the entry must be registered
     * </pre>
     */
    it('should update', function() {

    	//given
        var title = 'VISITA NO CLIENTE';
        var description = 'VISITA DIA 12/01/2014';
        var date = '12/01/2014';
        var startTime = '12:00';
        var endTime = '12:30';
        var address = {street: 'rua', number: 555, cep: '12222-000'};
        var contacts = [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}];
        var type = 'VISITA';
        var status = 'STATUS';
        
        var uuid = null;
      
        runs(function(){
            
            var ev = new Event(uuid, title, description, date, startTime, endTime, address, contacts, type,  status);
            
            var promise = EventKeeper.create(ev);
            
            promise.then(function(_uuid_){
                log.debug('Event\'s uuid:', _uuid_);
                uuid = _uuid_;
            }, function (err) {
                log.debug('Failed to create Event', err);
            });

            $rootScope.$apply();
        });
        
        waitsFor(function(){
            return !!uuid;
        }, 'Create is taking too long', 500);
        
        runs(function(){
            var title = 'super bad client';
            var ev = new Event(uuid, title, description, date, startTime, endTime, address, contacts, type,  status);
            
            var promise = EventKeeper.update(ev);
            
            uuid = null;
            
            promise.then(function(_uuid_){
                uuid = _uuid_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!uuid;
        }, 'Update is taking too long', 500);
        
        runs(function(){
            expect(EventKeeper.list().length).toBe(1);
            expect(EventKeeper.list()[0].title).toBe('super bad client');
        });

    });
    
    /**
     * <pre>
     * @spec EventKeeper.update#1
     * Given a invalid client
     * when and update is triggered
     * then a Event must not be updated
     * </pre>
     */
    it('should throw exception', function() {
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
            var promise = EventKeeper.update(ev);
            
            promise['catch'](function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!resolution;
        }, 'Update is taking too long', 300);
        
        runs(function(){
            expect(resolution).toBe('Wrong instance to EventKeeper');
        });
    });
    
    /**
     * <pre>
     * @spec EventKeeper.update#1
     * Given a unregistered client
     * when and update is triggered
     * then a Event must not be updated
     * </pre>
     */
    
    //FIXME -Fabio - Not sure about this test.
    it('should not update', function() {
        
    	var title = 'VISITA NO CLIENTE';
        var description = 'VISITA DIA 12/01/2014';
        var date = '12/01/2014';
        var startTime = '12:00';
        var endTime = '12:30';
        var address = {street: 'rua', number: 555, cep: '12222-000'};
        var contacts = [{uuid: 'uidcontato1'},{uuid:'uidcontato2'}];
        var type = 'VISITA';
        var status = 'STATUS';
        
        var ev = new Event(1, title, description, date, startTime, endTime, address, contacts, type,  status);
        
        var ev2 = new Event(2, title, description, date, startTime, endTime, address, contacts, type,  status);
        ev2.title = 'super bad client';
        ev2.description = 'cassiana';
        

        var created = null;
        
        runs(function(){
            var promise = EventKeeper.create(ev);
            promise.then(function (result) {
                created = true;
            }, function (err) {
            });

            $rootScope.$apply();
        });
        
        waitsFor(function(){
            return created;
        }, 'EventKeeper.create()', 300);
        
        runs(function(){
            var createCall = function(){
                EventKeeper.handlers.eventUpdateV1(ev2);
            };
            expect(createCall).toThrow('Event not found.');
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
