'use strict';

describe('Service: ConsultantServiceAddScenario', function() {

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
        module('tnt.catalog.consultant.service');
        module('tnt.catalog.consultant.entity');

        module(function($provide) {
          $provide.value('$log', log);
        });
    });

    // instantiate service
    var ConsultantService = undefined;
    var Consultant = undefined;
    var $rootScope = undefined;
    var JournalKeeper = undefined;
    
    beforeEach(inject(function(_$rootScope_, _ConsultantService_, _Consultant_, _JournalKeeper_) {
        ConsultantService = _ConsultantService_;
        Consultant = _Consultant_;
        $rootScope = _$rootScope_;
        JournalKeeper = _JournalKeeper_;
    }));

    beforeEach(nukeData);
    
    /**
     * <pre>
     * @spec ConsultantService.create
     * Given a valid values
     * when and create is triggered
     * then a enitity must be created
     * an the entry must be registered
     * </pre>
     */
    it('should create', function() {
        //given
        
        var validConsultant = new Consultant({
            uuid : null,
            name : 'cassiano',
            mkCode : 'mk-007',
            cep : 81110010,
            address : {street: 'rua', number: 555},
            cpf : '8157170',
            bank : '001',
            agency : 12345,
            account : 321,
            email : 'teste@tunts.com'
    });
        
        var created = false;

        //when
        runs(function(){
            var promise = ConsultantService.create(validConsultant);
            promise.then(function (result) {
                log.debug('Consultant created!', result);
                created = true;
            }, function (err) {
                log.debug('Failed to create Consultant!', err);
            });

            $rootScope.$apply();
        });
        
        waitsFor(function(){
            return created;
        }, 'ConsultantService.create()');
        
        //then
        runs(function(){
            expect(ConsultantService.list()[0].name).toBe('cassiano');
            expect(ConsultantService.list().length).toBe(1);
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
