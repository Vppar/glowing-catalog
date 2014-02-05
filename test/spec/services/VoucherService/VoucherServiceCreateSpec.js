'use strict';

//FIXME - This whole suit test needs review
xdescribe('Service: VoucherServiceCreateSpec', function() {
    var vKeeper = {};
    var EntityService = {};

    var entity = 1;
    var amount = 300;
    var voucherType = 'voucher';
    var remarks = 'some remarks.';
    var document = {
        type : "pedido",
        id : 123
    };

    
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

    // SPY
    beforeEach(function() {
        vKeeper.create = jasmine.createSpy('VoucherKeeper.create');
        EntityService.find = jasmine.createSpy('EntityService.find').andReturn(entity);
        module(function($provide) {
            $provide.value('VoucherKeeper', vKeeper);
            $provide.value('EntityService', EntityService);
        });
    });

    // instantiate service
    var VoucherService = undefined;
    var Voucher = undefined;
    beforeEach(inject(function(_VoucherService_, _Voucher_, _EntityService_) {
        VoucherService = _VoucherService_;
        Voucher = _Voucher_;
        EntityService = _EntityService_;
    }));

    it('should create', function() {
        
        var voucher = new Voucher('cc02b600-5d0b-11e3-96c3-010001000001', entity, voucherType, 100);
        voucher.remarks = 'some remarks.';
        voucher.document = {
            type : "pedido",
            id : 123
        };

        VoucherService.create(voucher);
        expect(vKeeper.create.mostRecentCall.args[0]).toEqual(voucher);

    });

    it('should fail, invalid entity', function() {

        expect(function() {
            VoucherService.create(undefined, amount, remarks, document);
        }).toThrow();
    });

    it('should fail, invalid amount', function() {

        var voucher = new Voucher(null, entity, voucherType, amount);

        expect(function() {
            VoucherService.create(undefined, amount, remarks, document);
        }).toThrow();
    });

});
