'use strict';

describe('Service: VoucherKeeperRedeemScenario', function() {

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
    var $rootScope = undefined;
    var JournalKeeper = undefined;

    var version = 'V1';
    var myAddFunction = 'voucherCreate' + version;
    var ArrayUtils = undefined;

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
     * @spec VoucherKeeper.Redeem#1
     * Given a populated list of voucher
     * And a  type and id valid
     * when redeem is triggered
     * then a voucher must be redeemed
     * </pre>
     */
    it('redeem a voucher', function() {
        var redeemed = false;

        runs(function() {
            VoucherKeeper.handlers[myAddFunction](new Voucher('cc02b600-5d0b-11e3-96c3-010001000001', 'Pedro de Lara', 'voucher', 30));
            VoucherKeeper.handlers[myAddFunction](new Voucher('cc02b600-5d0b-11e3-96c3-010001000002', 'Toninho do Diabo', 'voucher', 40));
            VoucherKeeper.handlers[myAddFunction](new Voucher('cc02b600-5d0b-11e3-96c3-010001000003', 'Jeremias O Sub-Zero brasileiro', 'voucher', 40));

            var promise = VoucherKeeper.redeem('voucher', 'cc02b600-5d0b-11e3-96c3-010001000002');
            promise.then(function (result) {
                log.debug('Voucher redeemed!', result);
                redeemed = true;
            }, function (err) {
                log.debug('Failed to redeem Voucher!', err);
            });

            $rootScope.$apply();
        });

        waitsFor(function() {
            return redeemed;
            //return VoucherKeeper.list('voucher')[1].redeemed;
        }, 'VoucherKeeper.redeem()', 300);

        runs(function() {
            var voucher = ArrayUtils.find(VoucherKeeper.list('voucher'), 'id', 'cc02b600-5d0b-11e3-96c3-010001000002');

            expect(VoucherKeeper.list('voucher').length).toBe(3);
            expect(voucher.redeemed).not.toBe(undefined);
            expect(voucher.entity).toBe('Toninho do Diabo');
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
