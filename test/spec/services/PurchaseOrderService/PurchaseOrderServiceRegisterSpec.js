'use strict';

ddescribe('Service: PurchaseOrderService', function() {

    var PurchaseOrderService;
    var PurchaseOrderKeeper = {};
    var ExpenseService;

    var purchase = {
        uuid : '1',
        created : new Date(),
        canceled : false,
        items : [
            {
                item : 'yar'
            }
        ]
    };

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.purchaseOrder');
        module('tnt.catalog.purchaseOrder.service');
    });

    beforeEach(inject(function(_PurchaseOrderService_, _ExpenseService_) {
        PurchaseOrderService = _PurchaseOrderService_;
        ExpenseService = _ExpenseService_;
    }));

    it('initializes an purchaseOrder object', function() {
        
        ExpenseService.register = jasmine.createSpy('ExpenseService.register');
        
        runs(function(){
            PurchaseOrderService.register(purchase).then(function () {
                log.debug('Entity created');
            }, function (err) {
                log.debug('Failed to create entity', err);
            });
            
            waitsFor(function(){
                return EntityKeeper.list().length;
            }, 'EntityKeeper.create()', 500);
            
            //then
            runs(function(){
                expect(EntityKeeper.list()[0].name).toBe('cassiano');
                expect(EntityKeeper.list().length).toBe(1);
            });

            $rootScope.$apply();
        });
        
        expect(ExpenseService.register).toHaveBeenCalled();
    });
});
