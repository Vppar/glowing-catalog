'use strict';

describe('Service: ConsultantKeeperUpdateScenario', function() {

    var logger = angular.noop;

    var log = {
        debug : logger,
        error : logger,
        warn : logger,
        fatal : logger
    };

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.consultant');

        module(function($provide) {
          $provide.value('$log', log);
        });
    });

    // instantiate service
    var JournalKeeper = null;
    var ConsultantKeeper = null;
    var Consultant = null;
    var $rootScope = null;

    beforeEach(inject(function(_ConsultantKeeper_, _Consultant_, _$rootScope_, _JournalKeeper_) {
        JournalKeeper = _JournalKeeper_;
        ConsultantKeeper = _ConsultantKeeper_;
        Consultant = _Consultant_;
        $rootScope = _$rootScope_;
    }));


    beforeEach(nukeData);
    
    /**
     * <pre>
     * @spec ConsultantKeeper.update#1
     * Given a already registered client
     * when and update is triggered
     * then a consultant must be updated
     * an the entry must be registered
     * </pre>
     */
    it('should update', function() {

        var name = 'cassiano';
        var mkCode = 'mk-007';
        var cep = 81110010;
        var address = {street: 'rua', number: 555};
        var cpf = '8157170';
        var bank = '001';
        var agency = 12345;
        var account = 321;
        var email = 'teste@tunts.com';      
      
        var uuid = null;
        runs(function(){
            
            var ev = new Consultant(null, name, mkCode, cep, address, cpf, bank,  agency, account, email);
            
            var promise = ConsultantKeeper.create(ev);
            
            promise.then(function(_uuid_){
                log.debug('Consultant\'s uuid:', _uuid_);
                uuid = _uuid_;
            }, function (err) {
                log.debug('Failed to create consultant', err);
            });
            
        });

        waitsFor(function(){
            $rootScope.$apply();
            return !!uuid;
        }, 'Create is taking too long');
        
        runs(function(){
            var email = 'updated.email@test.com';
            var ev = new Consultant(uuid, name, mkCode, cep, address, cpf, bank,  agency, account, email);
            
            var promise = ConsultantKeeper.update(ev);
            
            uuid = null;
            
            promise.then(function(_uuid_){
                return uuid = _uuid_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!uuid;
        }, 'Update is taking too long');
        
        runs(function(){
            expect(ConsultantKeeper.list().length).toBe(1);
            expect(ConsultantKeeper.list()[0].email).toBe('updated.email@test.com');
        });

    });
    
    /**
     * <pre>
     * @spec ConsultantKeeper.update#1
     * Given a invalid client
     * when and update is triggered
     * then a consultant must not be updated
     * </pre>
     */
    it('should throw exception', function() {
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var name = 'cassiano';
        var mkCode = 'mk-007';
        var cep = 81110010;
        var address = {street: 'rua', number: 555};
        var cpf = '8157170';
        var bank = '001';
        var agency = 12345;
        var account = 321;
        var email = 'teste@tunts.com';  
        
        var ev = (uuid, name, mkCode, cep, address, cpf, bank,  agency, account, email);
        
        ev.picles = 'yep';
        
        var resolution = null;
        
        runs(function(){
            var promise = ConsultantKeeper.update(ev);
            
            promise.then(null, function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!resolution;
        }, 'Update is taking too long');
        
        runs(function(){
            expect(resolution).toBe('Wrong instance to ConsultantKeeper');
        });
    });
    
    /**
     * <pre>
     * @spec ConsultantKeeper.update#1
     * Given a unregistered client
     * when and update is triggered
     * then a Consultant must not be updated
     * </pre>
     */
    
    //FIXME -Fabio - Not sure about this test.
    it('should not update', function() {
        
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var uuid2 = 'cc02b600-5d0b-11e3-96c3-010001000002';
        var name = 'cassiano';
        var mkCode = 'mk-007';
        var cep = 81110010;
        var address = {street: 'rua', number: 555};
        var cpf = '8157170';
        var bank = '001';
        var agency = 12345;
        var account = 321;
        var email = 'teste@tunts.com';  
        
        var ev = new Consultant(uuid, name, mkCode, cep, address, cpf, bank,  agency, account, email);
        
        var ev2= new Consultant(uuid2, name, mkCode, cep, address, cpf, bank,  agency, account, email);
        ev2.remarks = 'super bad client';
        ev2.namespaceURI = 'cassiana';
        

        var created = null;
        
        runs(function(){
            var promise = ConsultantKeeper.create(ev);
            promise.then(function (result) {
                created = true;
            }, function (err) {
            });

            $rootScope.$apply();
        });
        
        waitsFor(function(){
            return created;
        }, 'ConsultantKeeper.create()');
        
        runs(function(){
            var createCall = function(){
                ConsultantKeeper.handlers.consultantUpdateV1(ev2);
            };
            expect(createCall).toThrow('User not found.');
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
