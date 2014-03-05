'use strict';

describe('Service: EntityKeeperAddScenario', function() {

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
        module('tnt.catalog.entity');
        module('tnt.catalog.entity.keeper');
        module('tnt.catalog.entity.entity');

        module(function($provide) {
            $provide.value('$log', log);
        });
    });

    // instantiate service
    var EntityKeeper = null;
    var Entity = null;
    var $rootScope = null;
    var JournalKeeper = null;
    var WebSQLDriver = null;


    beforeEach(inject(function(_EntityKeeper_, _Entity_, _$rootScope_, _JournalKeeper_, _WebSQLDriver_) {
        EntityKeeper = _EntityKeeper_;
        Entity = _Entity_;
        $rootScope = _$rootScope_;
        JournalKeeper = _JournalKeeper_;
        WebSQLDriver = _WebSQLDriver_;        
    }));

    // Clear existing data
    beforeEach(nukeData);

    /**
     * <pre>
     * @spec EntityKeeper.add#1
     * Given a valid values
     * when and create is triggered
     * then a enitity must be created
     * an the entry must be registered
     * </pre>
     */
    it('should create', function() {
        //given
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var name = 'cassiano';
        var emails = [{address: 'cassiano.tesseroli@gvt.com.br'},{address: 'c4ssio@gmail.com'}];
        var birthDate = '16/09/1981';
        var phones = [{ddd: 41, phone: 96491686},{ddd: 41, phone: 30875341}];
        var cep = '8157170';
        var document = '1234567890';
        var addresses = [{street: 'rua', number: 555}, {street: 'rua', number: 556}];
        var remarks = 'bad client';
        
        var ev = new Entity(uuid, name, emails, birthDate, phones, cep, document, addresses,  remarks);
        
        //when
        runs(function(){
            EntityKeeper.create(ev).then(function () {
                log.debug('Entity created');
            }, function (err) {
                log.debug('Failed to create entity', err);
            });
            $rootScope.$apply();
        });
        
        waitsFor(function(){
            return EntityKeeper.list().length;
        }, 'EntityKeeper.create()', 500);
        
        //then
        runs(function(){
            expect(EntityKeeper.list()[0].name).toBe('cassiano');
            expect(EntityKeeper.list().length).toBe(1);
        });


    });
    
    /**
     * <pre>
     * @spec EntityKeeper.add#1
     * Given a invalid values
     * when and create is triggered
     * then a exception must be throw 'Wrong instance to EntityKeeper'
     * </pre>
     */
    it('should not add', function() {
        //given
        var ev = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
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
            var promise = EntityKeeper.create(ev);
            
            promise.then(null, function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!resolution;
        }, 'Create is taking too long', 300);
        
        runs(function(){
            expect(resolution).toBe('Wrong instance to EntityKeeper');
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
