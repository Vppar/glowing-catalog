'use strict';

describe('Service: EntityServiceAddScenario', function() {

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
        module('tnt.catalog.entity.service');
        module('tnt.catalog.entity.entity');

        module(function($provide) {
          $provide.value('$log', log);
        });
    });

    // instantiate service
    var EntityService = undefined;
    var Entity = undefined;
    var $rootScope = undefined;
    var JournalKeeper = undefined;
    
    beforeEach(inject(function(_$rootScope_, _EntityService_, _Entity_, _JournalKeeper_) {
        EntityService = _EntityService_;
        Entity = _Entity_;
        $rootScope = _$rootScope_;
        JournalKeeper = _JournalKeeper_;
    }));

    beforeEach(nukeData);
    
    /**
     * <pre>
     * @spec EntityService.create
     * Given a valid values
     * when and create is triggered
     * then a enitity must be created
     * an the entry must be registered
     * </pre>
     */
    it('should create', function() {
        //given
        var id = 1;
        var name = 'cassiano';
        var emails = [{address: 'cassiano.tesseroli@gvt.com.br'},{address: 'c4ssio@gmail.com'}];
        var birthDate = '16/09/1981';
        var phones = [{ddd: 41, phone: 96491686},{ddd: 41, phone: 30875341}];
        var cep = '8157170';
        var document = '1234567890';
        var addresses = [{street: 'rua', number: 555}, {street: 'rua', number: 556}];
        var remarks = 'bad client';
        
        var ev = new Entity(id, name, emails, birthDate, phones, cep, document, addresses,  remarks);
        
        var created = false;

        //when
        runs(function(){
            var promise = EntityService.create(ev);
            promise.then(function (result) {
                log.debug('Entity created!', result);
                created = true;
            }, function (err) {
                log.debug('Failed to create Entity!', err);
            });

            $rootScope.$apply();
        });
        
        waitsFor(function(){
            return created;
        }, 'EntityService.create()', 300);
        
        //then
        runs(function(){
            expect(EntityService.list()[0].name).toBe('cassiano');
            expect(EntityService.list().length).toBe(1);
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
