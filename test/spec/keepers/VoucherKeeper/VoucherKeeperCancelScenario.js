'use strict';

describe('Service: VoucherKeeperCancelScenario', function() {

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
    var ArrayUtils = undefined;
    var $rootScope = undefined;
    var JournalKeeper = undefined;

    //name of add handler
    var version = 'V1';
    var myCreateFunction = 'voucherCreate' + version;

    beforeEach(inject(function(_$rootScope_, _VoucherKeeper_, _Voucher_, _ArrayUtils_, _JournalKeeper_) {
        VoucherKeeper = _VoucherKeeper_;
        Voucher = _Voucher_;
        ArrayUtils = _ArrayUtils_;
        $rootScope = _$rootScope_;
        JournalKeeper = _JournalKeeper_;
    }));

    beforeEach(nukeData);

    /**
     * <pre>
     * @spec VoucherKeeper.cancel#1
     * Given a populated list with a entries
     * And a valid voucher
     * when cancel is triggered
     * then a voucher must be canceled
     * </pre>
     */
    it('cancel a voucher', function() {
        var canceled = false;

        runs(function() {
            VoucherKeeper.handlers[myCreateFunction](new Voucher('cc02b600-5d0b-11e3-96c3-010001000001', 'Pedro de Lara', 'voucher', 30));
            VoucherKeeper.handlers[myCreateFunction](new Voucher('cc02b600-5d0b-11e3-96c3-010001000002', 'Toninho do Diabo', 'voucher', 40));
            VoucherKeeper.handlers[myCreateFunction](new Voucher('cc02b600-5d0b-11e3-96c3-010001000003', 'Jeremias O Sub-Zero brasileiro', 'voucher', 40));

            var promise = VoucherKeeper.cancel('voucher', 'cc02b600-5d0b-11e3-96c3-010001000001');

            promise.then(function (result) {
                log.debug('Voucher canceled!', result);
                canceled = true;
            }, function (err) {
                log.debug('Failed to cancel a voucher!', err);
            });

            $rootScope.$apply();
        });

        waitsFor(function() {
            return canceled;
        }, 'VoucherKeeper.cancel()');

        runs(function() {
            var voucher = ArrayUtils.find(VoucherKeeper.list('voucher'), 'id', 'cc02b600-5d0b-11e3-96c3-010001000001');

            expect(VoucherKeeper.list('voucher').length).toBe(3);
            expect(voucher.canceled).not.toBe(undefined);
            expect(voucher.entity).toBe('Pedro de Lara');

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
