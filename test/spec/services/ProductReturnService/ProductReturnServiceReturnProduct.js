'use strict';

describe('Service: ProductReturnservice', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.productReturn.service');
        module('tnt.catalog.productReturn.entity');
        module('tnt.catalog.stock.entity');
        module('tnt.catalog.voucher.service');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.inventory.entity');
    });

    var prKeeper = {};
    var stockKeeper = {};
    var voucherService = {};
    // SPY
    beforeEach(function() {
        prKeeper.add = jasmine.createSpy('ProductReturnKeeper.add');
        stockKeeper.add = jasmine.createSpy('StockKeeper.add');
        voucherService.create = jasmine.createSpy('VoucherService.create');

        module(function($provide) {
            $provide.value('ProductReturnKeeper', prKeeper);
            $provide.value('StockKeeper', stockKeeper);
            $provide.value('VoucherService', voucherService);
        });
    });

    // instantiate service
    var EntityService = undefined;
    var ProductReturnService = undefined;
    var ProductReturn = undefined;
    var ArrayUtils = undefined;
    var Stock = undefined;
    beforeEach(inject(function(_ProductReturnService_, _ProductReturn_, _EntityService_, _ArrayUtils_, _Stock_) {
        ProductReturnService = _ProductReturnService_;
        ProductReturn = _ProductReturn_;
        EntityService = _EntityService_;
        ArrayUtils = _ArrayUtils_;
        Stock = _Stock_;
    }));

    
    it('should fail, invalid entity', function() {

        var inventoryId = 1;
        var quantity = 2;
        var price = 5;
        var entityId = 1;

        var entity = null;

        spyOn(EntityService, 'find').andReturn(entity);

        expect(function() {
            ProductReturnService.returnProduct(inventoryId, quantity, price, entityId);
        }).toThrow();
    });

    it('should fail, invalid product', function() {

        var inventoryId = null;
        var quantity = 2;
        var price = 5;
        var entityId = 1;

        var entity = 1;

        spyOn(EntityService, 'find').andReturn(entity);

        expect(function() {
            ProductReturnService.returnProduct(inventoryId, quantity, price, entityId);
        }).toThrow();
    });

    it('should fail, invalid quantity', function() {

        var inventoryId = 1;
        var quantity = -2;
        var price = 5;
        var entityId = 1;

        var entity = 1;
        var product = {
            price : 6
        };

        spyOn(EntityService, 'find').andReturn(entity);
        spyOn(ArrayUtils, 'find').andReturn(product);

        expect(function() {
            ProductReturnService.returnProduct(inventoryId, quantity, price, entityId);
        }).toThrow();
    });
    
    it('should fail, invalid price', function() {

        var inventoryId = 1;
        var quantity = 2;
        var price = -5;
        var entityId = 1;

        var entity = 1;
        var product = {
            price : 6
        };

        spyOn(EntityService, 'find').andReturn(entity);
        spyOn(ArrayUtils, 'find').andReturn(product);

        expect(function() {
            ProductReturnService.returnProduct(inventoryId, quantity, price, entityId);
        }).toThrow();
    });
});
