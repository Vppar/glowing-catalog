describe('Service: PurchaseOrderServiceCalculateCostSpec\n', function(){

    beforeEach(function() {
        module('tnt.catalog.purchase.service');
        module('tnt.catalog.financial.math.service');
    });

    var NewPurchaseOrderService = undefined;
    var Misplacedservice = {};
    var FinancialMathService = {};

    beforeEach(inject(function(_NewPurchaseOrderService_, _FinancialMathService_) {
        NewPurchaseOrderService = _NewPurchaseOrderService_;
        FinancialMathService = _FinancialMathService_;
    }));

    beforeEach(function(){
        Misplacedservice.discount = jasmine.createSpy('Misplacedservice.discount').andCallFake(function(){
           return {};
        });

        Misplacedservice.discount.distributeByWeight = jasmine.createSpy('Misplacedservice.discount.distributeByWeight').andCallFake(function(){
            var result = [0.01, 0.02];
            return result;
        });

        FinancialMathService.currencyDivide = jasmine.createSpy('FinancialMathService.currencyDivide').andCallFake(function(){
            return 100.0;
        });
    });

    it('Should calculate cost', function(){
        NewPurchaseOrderService.purchaseOrder = { items: [10.2 ]  };
        NewPurchaseOrderService.calculateCost(10);

        expect(Misplacedservice.discount.distributeByWeight).not.toHaveBeenCalled();
        expect(FinancialMathService.currencyDivide).toHaveBeenCalled();
    });
});