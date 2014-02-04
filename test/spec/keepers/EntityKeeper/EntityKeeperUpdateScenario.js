'use strict';

describe('Service: EntityKeeperUpdateScenario', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.entity');
        module('tnt.catalog.entity.keeper');
        module('tnt.catalog.entity.entity');
    });

    // instantiate service
    var EntityKeeper = null;
    var Entity = null;
    var $rootScope = null;
    beforeEach(inject(function(_EntityKeeper_, _Entity_, _$rootScope_, WebSQLDriver) {
      
        WebSQLDriver.transaction(function(tx){
            WebSQLDriver.dropBucket(tx, 'JournalEntry');
        });
      
        EntityKeeper = _EntityKeeper_;
        Entity = _Entity_;
        $rootScope = _$rootScope_;
    }));
    
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
                uuid = _uuid_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!uuid;
        }, 'Create is taking too long', 300);
        
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
        }, 'Update is taking too long', 300);
        
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
            
            promise['catch'](function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!resolution;
        }, 'Update is taking too long', 300);
        
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
        
        
        runs(function(){
            
            EntityKeeper.create(ev);
        });
        
        waitsFor(function(){
            return EntityKeeper.list().length;
        }, 'JournalKeeper is taking too long', 300);
        
        runs(function(){
            var createCall = function(){
                
                EntityKeeper.handlers.entityUpdateV1(ev2);
            };
            expect(createCall).toThrow('User not found.');
        });
    });
});
