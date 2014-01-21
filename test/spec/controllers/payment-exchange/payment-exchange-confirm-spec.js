describe('Controller: PaymentExchangeCtrlConfirm', function() {

    var DialogService ={};
    var PaymentExchange ={};
    beforeEach(function() {
        module('tnt.catalog.payment.exchange');
        module('tnt.catalog.inventory.entity');
        module('tnt.catalog.inventory.keeper');
        
    });
    beforeEach(inject(function($controller, $rootScope, _PaymentExchange_) {

        scope = $rootScope.$new();
        
        $controller('PaymentExchangeCtrl', {
            $scope : scope,
            DialogService : DialogService,
            PaymentExchange : PaymentExchange
        });
    }));

    it('should do stuff', function() {
        // given
    	scope.exchanges = [];
    	var exc = {};
    	exc.amount = 30;
		exc.qty = 2;
		exc.amountunit = 15;
		exc.title = 'test product';
		exc.id = 1;
		scope.exchanges.push(exc);
       
        // when
		scope.confirmExchangePayments();

        //check.id = 1;

        // then
        //expect(scope.payments.length).toBe(paymentsSize + 1);
    });
});