'use strict';

describe('Service: Voucherservice', function() {

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
    var vKeeper = {};
    // SPY
    beforeEach(function() {
        vKeeper.create = jasmine.createSpy('VoucherKeeper.create');

        module(function($provide) {
            $provide.value('VoucherKeeper', vKeeper);
        });
    });

    // instantiate service
    var VoucherService = undefined;
    var Voucher = undefined;
    var EntityService = undefined;
    beforeEach(inject(function(_VoucherService_, _Voucher_, _EntityService_) {
        VoucherService = _VoucherService_;
        Voucher = _Voucher_;
        EntityService = _EntityService_;
    }));

    it('should create', function() {

        var entity = 1;
        var amount = 1;
        var voucherType = 'voucher';
        var remarks = 'some remarks.';
        var document = {
            type : "pedido",
            id : 123
        };

        var voucher = new Voucher(null, entity, voucherType, amount);
        voucher.remarks = 'some remarks.';
        voucher.document = {
            type : "pedido",
            id : 123
        };

        spyOn(EntityService, 'find').andReturn(entity);

        VoucherService.create(entity, amount, remarks, document);

        expect(vKeeper.create.mostRecentCall.args[0]).toEqual(voucher);

    });

    it('should fail, invalid entity', function() {

        var amount = 1;
        var remarks = 'some remarks.';
        var document = {
            type : "pedido",
            id : 123
        };
        expect(function() {
            VoucherService.create(undefined, amount, remarks, document);
        }).toThrow();
    });

    it('should fail, invalid amount', function() {

        var entity = 1;
        var amount = 300;
        var voucherType = 'voucher';
        var remarks = 'some remarks.';
        var document = {
            type : "pedido",
            id : 123
        };

        var voucher = new Voucher(null, entity, voucherType, amount);
        voucher.remarks = 'some remarks.';
        voucher.document = {
            type : "pedido",
            id : 123
        };

        spyOn(EntityService, 'find').andReturn(entity);

        expect(function() {
            VoucherService.create(undefined, amount, remarks, document);
        }).toThrow();
    });

});
