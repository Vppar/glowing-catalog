'use strict';

describe('Service: TypeKeeperAddScenario', function() {

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
        module('tnt.catalog.type');
        module('tnt.catalog.type.keeper');
        module('tnt.catalog.type.entity');

        module(function($provide) {
          $provide.value('$log', log);
        });
    });

    // instantiate service
    var TypeKeeper = undefined;
    var Type = undefined;
    var JournalKeeper = undefined;
    var $rootScope = undefined;

    beforeEach(inject(function(_$rootScope_, _TypeKeeper_, _Type_, _JournalKeeper_) {
        TypeKeeper = _TypeKeeper_;
        Type = _Type_;
        JournalKeeper = _JournalKeeper_;
        $rootScope = _$rootScope_;
    }));


    beforeEach(nukeData);

    /**
     * <pre>
     * @spec TypeKeeper.add#1
     * Given a valid type
     * when add is triggered
     * then a type must be created
     * and the handler must populate the list
     * </pre>
     */
    it('create a type', function() {
        var name = 'I\'m the type\`s name!';
        var classification = 'a class';
        var ev = new Type(null, name, classification);

        var added = false;

        runs(function() {
            var promise = TypeKeeper.add(ev);
            promise.then(function (result) {
                log.debug('Type added!', result);
                added = true;
            }, function (err) {
                log.debug('Failed to add Type!', err);
            });

            $rootScope.$apply();
        }); 

        waitsFor(function() {
            return added;
        }, 'TypeKeeper.add()');

        runs(function() {
            expect(TypeKeeper.list(classification).length).toBe(1);
            expect(TypeKeeper.list(classification)[0].id).toBe(0);
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
