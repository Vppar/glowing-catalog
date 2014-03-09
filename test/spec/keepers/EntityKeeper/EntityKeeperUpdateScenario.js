'use strict';

describe('Service: EntityKeeperUpdateScenario', function() {

    var logger = angular.noop;

    var log = {
        debug : logger,
        error : logger,
        warn : logger,
        fatal : logger
    };

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.entity');
        module('tnt.catalog.entity.keeper');
        module('tnt.catalog.entity.entity');

        module(function($provide) {
          $provide.value('$log', log);
        });
    });

    // instantiate service
    var JournalKeeper = null;
    var EntityKeeper = null;
    var Entity = null;
    var $rootScope = null;

    beforeEach(inject(function(_EntityKeeper_, _Entity_, _$rootScope_, _JournalKeeper_) {
        JournalKeeper = _JournalKeeper_;
        EntityKeeper = _EntityKeeper_;
        Entity = _Entity_;
        $rootScope = _$rootScope_;
    }));


    beforeEach(nukeData);
    
    /**
     * <pre>
     * @spec EntityKeeper.update#1
     * Given a already registered client
     * when and update is triggered
     * then a entity must be updated
     * an the entry must be registered
     * </pre>
     */
    it('should update', function() {

        var name = 'cassiano';
        var emails = [{address: 'cassiano.tesseroli@gvt.com.br'},{address: 'c4ssio@gmail.com'}];
        var birthDate = '16/09/1981';
        var phones = [{ddd: 41, phone: 96491686},{ddd: 41, phone: 30875341}];
        var cep = '8157170';
        var document = '1234567890';
        var addresses = [{street: 'rua', number: 555}, {street: 'rua', number: 556}];
      
        var uuid = null;
      
        runs(function(){
            var remarks = 'bad client';
            
            var ev = new Entity(uuid, name, emails, birthDate, phones, cep, document, addresses,  remarks);
            
            var promise = EntityKeeper.create(ev);
            
            promise.then(function(_uuid_){
                log.debug('Entity\'s uuid:', _uuid_);
                uuid = _uuid_;
            }, function (err) {
                log.debug('Failed to create entity', err);
            });

            $rootScope.$apply();
        });
        
        waitsFor(function(){
            return !!uuid;
        }, 'Create is taking too long');
        
        runs(function(){
            var remarks = 'super bad client';
            var ev = new Entity(uuid, name, emails, birthDate, phones, cep, document, addresses,  remarks);
            
            var promise = EntityKeeper.update(ev);
            
            uuid = null;
            
            promise.then(function(_uuid_){
                uuid = _uuid_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!uuid;
        }, 'Update is taking too long');
        
        runs(function(){
            expect(EntityKeeper.list().length).toBe(1);
            expect(EntityKeeper.list()[0].remarks).toBe('super bad client');
        });

    });
    
    /**
     * <pre>
     * @spec EntityKeeper.update#1
     * Given a invalid client
     * when and update is triggered
     * then a entity must not be updated
     * </pre>
     */
    it('should throw exception', function() {
        var ev = {
            uuid : 1,
            name : 'cassiano',
            emails : [
                {
                    address : 'cassiano.tesseroli@gvt.com.br'
                }, {
                    address : 'c4ssio@gmail.com'
                }
            ],
            birthDate : '16/09/1981',
            phones : [
                {
                    ddd : 41,
                    phone : 96491686
                }, {
                    ddd : 41,
                    phone : 30875341
                }
            ],
            cep : '8157170',
            document : '1234567890',
            addresses : [
                {
                    street : 'rua',
                    number : 555
                }, {
                    street : 'rua',
                    number : 556
                }
            ],
            remarks : 'bad client'
        };
        
        var resolution = null;
        
        runs(function(){
            var promise = EntityKeeper.update(ev);
            
            promise.then(null, function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!resolution;
        }, 'Update is taking too long');
        
        runs(function(){
            expect(resolution).toBe('Wrong instance to EntityKeeper');
        });
    });
    
    /**
     * <pre>
     * @spec EntityKeeper.update#1
     * Given a unregistered client
     * when and update is triggered
     * then a entity must not be updated
     * </pre>
     */
    
    //FIXME -Fabio - Not sure about this test.
    it('should not update', function() {
        
        var name = 'cassiano';
        var emails = [{address: 'cassiano.tesseroli@gvt.com.br'},{address: 'c4ssio@gmail.com'}];
        var birthDate = '16/09/1981';
        var phones = [{ddd: 41, phone: 96491686},{ddd: 41, phone: 30875341}];
        var cep = '8157170';
        var document = '1234567890';
        var addresses = [{street: 'rua', number: 555}, {street: 'rua', number: 556}];
        var remarks = 'bad client';
        
        var ev = new Entity(1, name, emails, birthDate, phones, cep, document, addresses,  remarks);
        
        var ev2= new Entity(2, name, emails, birthDate, phones, cep, document, addresses,  remarks);
        ev2.remarks = 'super bad client';
        ev2.namespaceURI = 'cassiana';
        

        var created = null;
        
        runs(function(){
            var promise = EntityKeeper.create(ev);
            promise.then(function (result) {
                created = true;
            }, function (err) {
            });

            $rootScope.$apply();
        });
        
        waitsFor(function(){
            return created;
        }, 'EntityKeeper.create()');
        
        runs(function(){
            var createCall = function(){
                EntityKeeper.handlers.entityUpdateV1(ev2);
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
