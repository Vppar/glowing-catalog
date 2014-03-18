'use strict';

describe('Service: ConsultantKeeperAddScenario', function() {

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
        module('tnt.catalog.consultant');

        module(function($provide) {
            $provide.value('$log', log);
        });
    });

    // instantiate service
    var ConsultantKeeper = null;
    var Consultant = null;
    var $rootScope = null;
    var JournalKeeper = null;
    var WebSQLDriver = null;


    beforeEach(inject(function(_ConsultantKeeper_, _Consultant_, _$rootScope_, _JournalKeeper_, _WebSQLDriver_) {
        ConsultantKeeper = _ConsultantKeeper_;
        Consultant = _Consultant_;
        $rootScope = _$rootScope_;
        JournalKeeper = _JournalKeeper_;
        WebSQLDriver = _WebSQLDriver_;        
    }));

    // Clear existing data
    beforeEach(nukeData);

    /**
     * <pre>
     * @spec ConsultantKeeper.add#1
     * Given a valid values
     * when and create is triggered
     * then a consultant must be created
     * an the entry must be registered
     * </pre>
     */
    it('should create', function() {
        //given
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var name = 'cassiano';
        var mkCode = 'mk-007';
        var cep = 81110010;
        var address = {street: 'rua', number: 555};
        var cpf = '8157170';
        var rg = '1234567890';
        var bank = '001';
        var agency = 12345;
        var account = 321;
        var email = 'teste@tunts.com';
        
        var ev = new Consultant(uuid, name, mkCode, cep, address, cpf, rg, bank,  agency, account, email);
        
        //when
        runs(function(){
            ConsultantKeeper.create(ev).then(function () {
                log.debug('Consultant created');
            }, function (err) {
                log.debug('Failed to create consultant', err);
            });
            $rootScope.$apply();
        });
        
        waitsFor(function(){
            return ConsultantKeeper.list().length;
        }, 'ConsultantKeeper.create()', 500);
        
        //then
        runs(function(){
            expect(ConsultantKeeper.list()[0].name).toBe('cassiano');
            expect(ConsultantKeeper.list().length).toBe(1);
        });


    });
    
    /**
     * <pre>
     * @spec ConsultantKeeper.add#1
     * Given a invalid values
     * when and create is triggered
     * then a exception must be throw 'Wrong instance to ConsultantKeeper'
     * </pre>
     */
    it('should not add', function() {
        //given
        var ev = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            name : 'cassiano',
        };
        
        var resolution = null;
        
        runs(function(){
            var promise = ConsultantKeeper.create(ev);
            
            promise.then(null, function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!resolution;
        }, 'Create is taking too long');
        
        runs(function(){
            expect(resolution).toBe('Wrong instance to ConsultantKeeper');
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
