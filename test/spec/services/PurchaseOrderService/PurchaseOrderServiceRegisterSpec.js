'use strict';
//Commented this test becuse the method it's not on his final form.
xdescribe('Service: PurchaseOrderService', function() {

    var PurchaseOrderKeeper = {};
    var ExpenseService = {};
    var PurchaseOrderService = {};
    var $rootScope = null;
    var $log = {};
    var $q = {};
    var myUuid;

    var purchase = {
        uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
        created : new Date(),
        canceled : false,
        items : [
            {
                item : 'yar'
            }
        ]
    };

    beforeEach(function() {
        $log.debug = jasmine.createSpy('$log.debug');
        $log.error = jasmine.createSpy('$log.error');
        myUuid = 'cc02b600-5d0b-11e3-96c3-010001000123';
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.purchaseOrder');
        module('tnt.catalog.purchaseOrder.service');
        module('tnt.catalog.expense.entity');
        module('tnt.catalog.stock.entity');

        module(function($provide) {
            $provide.value('$log', $log);
            $provide.value('PurchaseOrderKeeper', PurchaseOrderKeeper);
            $provide.value('ExpenseService', ExpenseService);
        });
    });

    beforeEach(inject(function(_$rootScope_, _$q_, _PurchaseOrderService_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        PurchaseOrderService = _PurchaseOrderService_;
    }));
    
    beforeEach(function() {
        ExpenseService.register = jasmine.createSpy('ExpenseService.register').andCallFake(function() {
            var deferred = $q.defer();

            setTimeout(function() {
                deferred.resolve(myUuid);
            }, 0);

            return deferred.promise;
        });
        PurchaseOrderKeeper.add = jasmine.createSpy('PurchaseOrderKeeper.add').andCallFake(function() {
            var deferred = $q.defer();

            setTimeout(function() {
                deferred.resolve(myUuid);
            }, 0);

            return deferred.promise;
        });
    });

    it('initializes an purchaseOrder object', function() {

        var resolved = false;

        runs(function() {
            PurchaseOrderService.register(purchase).then(function() {
                resolved = true;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return resolved;
        }, 'Register a purchase order is taking too long', 100);

        // then
        runs(function() {
            expect(ExpenseService.register).toHaveBeenCalled();
            expect(ExpenseService.register.mostRecentCall.args[0].documentId).toBe(myUuid);
        });
    });
});
