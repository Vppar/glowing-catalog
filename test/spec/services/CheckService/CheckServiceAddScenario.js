describe('Service: CheckServiceAddSpec', function() {

    var CheckKeeper = null;
    var $q = null;
    var JournalKeeper = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.check.service');
        module('tnt.catalog.check.entity');
    });

    beforeEach(inject(function(_Check_, _CheckService_, _CheckKeeper_,_$q_, _$rootScope_, _JournalKeeper_) {
        Check = _Check_;
        CheckService = _CheckService_;
        CheckKeeper = _CheckKeeper_;
        JournalKeeper = _JournalKeeper_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        localStorage.deviceId = 1;
        nukeData();
    }));

    it('should add a check', function() {
        // given
        var checkEntry = {
            uuid : null,
            bank : 1,
            agency : 12,
            account : 123,
            number : 1234,
            duedate : new Date(1386444467895),
            amount : 150
        };
        var result = null;
        // when
        runs(function() {
            CheckService.addCheck(checkEntry).then(function(uuid) {
                result = true;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return result;
        });

        // then
        runs(function() {
            expect(CheckKeeper.list().length).toBe(1);
        });
    });
    
    it('shouldn\'t add a check', function() {
        // given
        var checkEntry = {
            uuid : null,
            bank : 1,
            agency : 12,
            account : 123,
            number : 1234,
            duedate : new Date(1386444467895)
        };
        var result = null;
        // when
        runs(function() {
            CheckService.addCheck(checkEntry).then(0, function(error) {
                result = error;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return result;
        });

        // then
        runs(function() {
            expect(result).toEqual([ { amount : undefined } ]);
        });
    });
    
    function nukeData() {
        var nuked = null;

        runs(function () {
            JournalKeeper.nuke().then(function () {
                nuked = true;
            });

            $rootScope.$apply();
        });

        waitsFor(function () {
            return nuked;
        }, 'JournalKeeper.nuke()');
    }
});
