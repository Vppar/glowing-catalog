'use strict';

describe('Service: VoucherKeeper', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.voucher.entity');
    });

    // instantiate service
    var Voucher = undefined;
    beforeEach(inject(function(_Voucher_) {
        Voucher = _Voucher_;
    }));

    it('should exist', function() {
        expect(!!Voucher).toBe(true);
    });

    it('should not instanciate a voucher without amount', function() {

        var id = 0;
        var entity = 1;
        var type = 'voucher';

        expect(function() {
            var v = new Voucher(id, entity, type);
        }).toThrow();
    });

    it('should not instanciate a voucher with more than the needed params', function() {

        var id = 0;
        var entity = 1;
        var type = 'voucher';
        var amount = 10.5;
        var redeemed = false;

        expect(function() {
            var v = new Voucher(id, entity, type, amount, redeemed);
        }).toThrow();
    });

    it('should instanciate a voucher', function() {

        var id = 0;
        var entity = 1;
        var type = 'voucher';
        var amount = 10.5;

        expect(function() {
            var v = new Voucher(id, entity, type, amount);
        }).not.toThrow();
    });

    it('should not instanciate a voucher without an id', function() {

        var entity = 1;
        var type = 'voucher';
        var amount = 10.5;

        expect(function() {
            var v = new Voucher(id, entity, type, amount);
        }).toThrow();
    });

    it('should instanciate a voucher with a generic object without all mandatory attributes', function() {

        var id = 0;
        var entity = 1;
        var type = 'voucher';
        var amount = 10.5;

        var obj = {
            id : id,
            entity : entity,
            type : type,
            amount : amount
        };

        expect(function() {
            var v = new Voucher(obj);
        }).not.toThrow();
    });

    it('should instanciate a voucher with a generic object with all mandatory attributes', function() {

        var id = 0;
        var entity = 1;
        var type = 'voucher';
        var amount = 10.5;

        var obj = {
            id : id,
            entity : entity,
            type : type,
            amount : amount,
            redeemed : false,
            canceled : true,
            remarks : "lalala",
            document : {
                type : "pedido",
                id : 123
            }
        };

        expect(function() {
            var v = new Voucher(obj);
        }).not.toThrow();
    });

    it('should not instanciate a voucher with a generic object with all mandatory attributes and more', function() {

        var id = 0;
        var entity = 1;
        var type = 'voucher';
        var amount = 10.5;

        var obj = {
            id : id,
            entity : entity,
            type : type,
            amount : amount,
            redeemed : false,
            canceled : true,
            remarks : "lalala",
            document : {
                type : "pedido",
                id : 123
            },
            extra : 'extra attribute'
        };

        expect(function() {
            var v = new Voucher(obj);
        }).toThrow();
    });

    it('should not instanciate a voucher with a generic object with some mandatory attributes and more', function() {

        var id = 0;
        var entity = 1;
        var type = 'voucher';
        var amount = 10.5;

        var obj = {
            id : id,
            entity : entity,
            type : type,
            amount : amount,
            extra : 'extra attribute'
        };

        expect(function() {
            var v = new Voucher(obj);
        }).toThrow();
    });

    xit('should not instanciate a voucher with a empty generic object', function() {
        var obj = {};

        expect(function() {
            var v = new Voucher(obj);
        }).toThrow();
    });

    xit('should not instanciate a voucher with a non object', function() {
        var obj = [];

        expect(function() {
            var v = new Voucher(obj);
        }).toThrow();
    });

});