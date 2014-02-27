'use strict';

ddescribe('Service: VoucherServiceSpec', function() {

    var $rootScope = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.voucher');
        module('tnt.catalog.voucher.service');
        module('tnt.catalog.voucher.keeper');
        module('tnt.catalog.voucher.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    // instantiate service
    var VoucherService = null;
    beforeEach(inject(function(_VoucherService_, _$rootScope_, _$q_) {
        VoucherService = _VoucherService_;
        $rootScope = _$rootScope_;
    }));

    describe('When no vouchers are passed', function() {
        it('should return a resolved promise', function() {
            var result = null;

            runs(function() {
                VoucherService.bulkProcess([]).then(function(_result_) {
                    result = _result_;
                });
            });

            waitsFor(function() {
                $rootScope.$apply();
                return !!result;
            });

            runs(function() {
                expect(result).toEqual([]);
            });
        });
    });

});
