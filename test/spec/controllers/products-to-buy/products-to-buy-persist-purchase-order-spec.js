describe('Controller: products-to-buy-persist-purchase-order-spec', function() {

    var PurchaseOrderService = {};
    var item1 = null;
    var item2 = null;
    var item3 = null;
    var item4 = null;
    
    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.productsToBuy.confirm.ctrl');
        module('tnt.catalog.stock.entity');
    });
    
    beforeEach(function() {
        item1 = {
            id : 1,
            qty : 0
        };
        item2 = {
            id : 2,
            qty : 4
        };
        item3 = {
            id : 3,
            qty : 0
        };
        item4 = {
            id : 4,
            qty : 2
        };
    });


    // Initialize the controller and a mock scope
    beforeEach(inject(function($q, $controller, $rootScope, _$filter_) {
        scope = $rootScope.$new();

        scope.summary = {};
        scope.summary.total = {};
        scope.summary.total.amount = 0;
        scope.summary.total.amountWithDiscount = 0;
        scope.financialRound = function(a){};
        
        scope.purchaseOrder = {};
        scope.purchaseOrder.watchedQty = {
            '1' : 0,
            '2' : 4,
            '3' : 0,
            '4' : 2
        };
        scope.main = {};
        scope.main.stockReport = {
            sessions : {
                mySession1 : {
                    lines : {
                        myLine1 : {
                            items : [
                                item1, item2, item3, item4
                            ]
                        }
                    }
                }
            }
        };
        
        productsToBuyConfirmCtrl = $controller('ProductsToBuyConfirmCtrl', {
            $scope : scope,
            PurchaseOrderService : PurchaseOrderService
        });

        PurchaseOrderService.register = jasmine.createSpy('PurchaseOrderService.register');

    }));

    it('should confirm products', function() {
        
       var expected = { uuid : null,
           amount : 0,
           discount : undefined,
           freight : undefined,
           points : undefined,
           items : [ { id : 2, qty : 4 },
                     { id : 4, qty : 2 } ] 
       } ;

        productsToBuyConfirmCtrl.persitPurchaseOrder();
        
        expect(PurchaseOrderService.register).toHaveBeenCalledWith(expected);
        
    });

});