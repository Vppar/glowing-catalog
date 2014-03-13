describe('Service: CheckServiceAddSpec', function() {

    var CheckKeeper = null;
    var $q = null;

    // mock and stub
    beforeEach(function() {
        CheckKeeper = {};
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.check.service');
        module('tnt.catalog.check.entity');

        module(function($provide) {
            $provide.value('CheckKeeper', CheckKeeper);
        });
    });

    beforeEach(inject(function(_Check_, _CheckService_, _$q_, _$rootScope_) {
        Check = _Check_;
        CheckService = _CheckService_;
        $rootScope = _$rootScope_;
        $q = _$q_;
    }));

    it('should add a check', function() {
        // given
        CheckKeeper.add = jasmine.createSpy('CheckKeeper.add').andCallFake(function() {
            var deferred = $q.defer();
            setTimeout(function() {
                deferred.resolve();
            }, 0);
            return deferred.promise;
        });

        var checkEntry = {
            uuid : null,
            bank : 1,
            agency : 12,
            account : 123,
            number : 1234,
            duedate : new Date(1386444467895),
            amount : 123456
        };
        var result = null;
        // when
        runs(function() {
            CheckService.addCheck(checkEntry).then(function() {
                result = true;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return result;
        });

        // then
        runs(function() {
            var check =
                    new Check(
                            checkEntry.uuid, checkEntry.bank, checkEntry.agency, checkEntry.account, checkEntry.number, checkEntry.duedate,
                            checkEntry.amount);
            expect(CheckKeeper.add).toHaveBeenCalledWith(check);
        });
    });

    it('shouldn\'t add a check, invalid attributes', function() {

        var checkEntry = {
            uuid : null,
            bank : undefined,
            agency : 12,
            account : 123,
            number : 1234,
            duedate : new Date(1386444467895),
            amount : 123456
        };
        var errors = null;
        // when
        runs(function() {
            CheckService.addCheck(checkEntry).then({}, function(fail) {
                errors = fail;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return errors;
        });

        // then
        runs(function() {
            expect(errors.length).not.toBe(0);
        });
    });
});
