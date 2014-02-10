'use strict';

describe('Service: VoucherKeeperCreateScenario', function() {

    var logger = angular.noop;

    var log = {
        debug : logger,
        error : logger,
        warn : logger,
        fatal : logger
    };

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.voucher');
        module('tnt.catalog.voucher.keeper');
        module('tnt.catalog.voucher.entity');

        module(function($provide) {
          $provide.value('$log', log);
        });
    });

    // instantiate service
    var VoucherKeeper = undefined;
    var Voucher = undefined;
    var $rootScope = undefined;
    var JournalKeeper = undefined;

    beforeEach(inject(function(_$rootScope_, _VoucherKeeper_, _Voucher_, _JournalKeeper_) {
        VoucherKeeper = _VoucherKeeper_;
        Voucher = _Voucher_;
        $rootScope = _$rootScope_;
        JournalKeeper = _JournalKeeper_;
    }));

    beforeEach(nukeData);

    /**
     * <pre>
     * @spec VoucherKeeper.create#1
     * Given a valid voucher
     * when create is triggered
     * then a voucher must be created
     * </pre>
     */
    it('create a voucher', function() {
        var created = false;

        runs(function() {
            var id = 1;
            var entity = 'Joselito';
            var type = 'voucher';
            var amount = 30;
            var ev = new Voucher(id, entity, type, amount);

            var promise = VoucherKeeper.create(ev);
            promise.then(function (result) {
                log.debug('Voucher created!', result);
                created = true;
            }, function (err) {
                log.debug('Failed to create Voucher!', err);
            });

            $rootScope.$apply();
        });

        waitsFor(function() {
            return created;
        }, 'VoucherKeeper.create()', 300);

        runs(function() {
            expect(VoucherKeeper.list('voucher').length).toBe(1);
            expect(VoucherKeeper.list('voucher')[0].entity).toBe('Joselito');
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
