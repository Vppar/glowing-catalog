'use strict';
describe('Controller: PaymentOnCuffCtrl', function() {

    var scope = {};
    var payments = [];
    var DialogService = {};
    var PaymentService= {};

    beforeEach(function() {
        module('tnt.catalog.filter.findBy');
        module('tnt.catalog.service.dialog');
        module('tnt.catalog.service.data');
        module('tnt.catalog.payment.oncuff');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.inventory.entity');
        module('tnt.catalog.service.order');
    });

    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        // scope mock
        scope = $rootScope.$new();
        scope.computeTotals = jasmine.createSpy('scope.computeTotals');
        scope.selectPaymentMethod = jasmine.createSpy('scope.selectPaymentMethod');
        scope.total = jasmine.createSpy('scope.total');
        scope.total.change = 284;
        
        
        PaymentService.add = jasmine.createSpy('PaymentService.add');
        PaymentService.list = jasmine.createSpy('PaymentService.list').andReturn(payments);
        PaymentService.clear = jasmine.createSpy('PaymentService.clear');
        
        // reproduce the scope inheritance
        $controller('PaymentOnCuffCtrl', {
            $scope : scope,
            payments : payments,
            DialogService : DialogService,
            PaymentService : PaymentService
        });
    }));

    /**
     * Given - 1 as installment
     * And   - an amount 
     * And   - dueDate 
     * When  - computeInstallments is called.
     * Then  - should create 1 installment.
     */
    it('should create 1 installment', function() {
        // given
        scope.amount = 500;
        scope.dueDate = new Date();
        scope.installmentQty = 1;
        scope.payments = [];
        scope.computeInstallments();
        
        var expectedDate = scope.dueDate;

        expect(scope.payments.length).toEqual(1);
        expect(scope.payments[0].amount).toEqual(scope.amount);
        expect(new Date(scope.payments[0].dueDate)).toEqual(expectedDate);
    });


    /**
     * Given - 6 as installment
     * And   - an a valid amount 
     * And   - dueData 
     * When  - computeInstallments is called.
     * Then  - should create 6 installment.
     */
    it('should create 6 installment', function() {
        // given
        scope.amount = 500;
        scope.dueDate = new Date();
        scope.installmentQty = 6;
        
        var expectedInstallment1 = 83.33;
        var expectedInstallment2 = 83.33;
        var expectedInstallment3 = 83.33;
        var expectedInstallment4 = 83.33;
        var expectedInstallment5 = 83.33;
        var expectedInstallment6 = 83.35;

        var oneMonthAhead = new Date(new Date(scope.dueDate).setMonth(scope.dueDate.getMonth() + 1));
        var twoeMonthAhead = new Date(new Date(oneMonthAhead).setMonth(oneMonthAhead.getMonth() + 1));
        var threeMonthAhead = new Date(new Date(twoeMonthAhead).setMonth(twoeMonthAhead.getMonth() + 1));
        var fourMonthAhead = new Date(new Date(threeMonthAhead).setMonth(threeMonthAhead.getMonth() + 1));
        var fiveMonthAhead = new Date(new Date(fourMonthAhead).setMonth(fourMonthAhead.getMonth() + 1));

        scope.payments = [];

        scope.computeInstallments();
        
        expect(scope.payments.length).toEqual(6);

        expect(scope.payments[0].amount).toEqual(expectedInstallment1);
        expect(scope.payments[0].dueDate).toEqual(scope.dueDate.getTime());

        expect(scope.payments[1].amount).toEqual(expectedInstallment2);
        expect(scope.payments[1].dueDate).toEqual(oneMonthAhead.getTime());

        expect(scope.payments[2].amount).toEqual(expectedInstallment3);
        expect(scope.payments[2].dueDate).toEqual(twoeMonthAhead.getTime());

        expect(scope.payments[3].amount).toEqual(expectedInstallment4);
        expect(scope.payments[3].dueDate).toEqual(threeMonthAhead.getTime());

        expect(scope.payments[4].amount).toEqual(expectedInstallment5);
        expect(scope.payments[4].dueDate).toEqual(fourMonthAhead.getTime());

        expect(scope.payments[5].amount).toEqual(expectedInstallment6);
        expect(scope.payments[5].dueDate).toEqual(fiveMonthAhead.getTime());

    });
    
    /**
     * Given - 6 as installment
     * And   - an a valid amount 
     * And   - dueData 
     * When  - computeInstallments is called.
     * Then  - should create 6 installment.
     */
   it('should call PaymentService', function() {
        // given
        scope.amount = 500;
        scope.dueDate = new Date();
        scope.installmentQty = 6;
        scope.payments = [{amount : 500, dueDate : 13132132}];
        scope.payments[0].dueDate = scope.dueDate;
        scope.confirmOnCuffPayment(); 
 
        expect(PaymentService.add).toHaveBeenCalled(); 
        expect(PaymentService.add.mostRecentCall.args[0].amount).toEqual(500);
        expect(PaymentService.add.mostRecentCall.args[0].dueDate).toEqual(scope.dueDate);
 
    });
     
    
    /**
     * Given - a invalid amount for change 284
     * When  - the controller is open.
     * Then  - the scope.amount should be 0 .
     */
   it('should amount equal 0', function() {
        // the value was settled on beforeInject(creation of controller.)
        expect(scope.amount).toEqual(0);
    });
    
});