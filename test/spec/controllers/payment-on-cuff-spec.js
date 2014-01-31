'use strict';
describe('Controller: PaymentOnCuffCtrl', function() {

    var scope = {};
    var payments = [];
    var DialogService = {};
    var PaymentService = {};
    var $q = {};

    beforeEach(function() {
        module('tnt.catalog.filter.findBy');
        module('tnt.catalog.service.dialog');
        module('tnt.catalog.service.data');
        module('tnt.catalog.payment.oncuff');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.inventory.entity');
        module('tnt.catalog.order.service');
        module('tnt.catalog.order.entity');
        module('tnt.catalog.order.keeper');
    });

    beforeEach(inject(function($controller, $rootScope, _$filter_, _$q_) {
        // scope mock
        scope = $rootScope.$new();
        scope.computeTotals = jasmine.createSpy('scope.computeTotals');
        scope.selectPaymentMethod = jasmine.createSpy('scope.selectPaymentMethod');
        scope.totals = {
          payments : {
            remaining : 100
          },

          order : {
          }
        };

        scope.total = jasmine.createSpy('scope.total');
        scope.total.change = 284;

        PaymentService.add = jasmine.createSpy('PaymentService.add');
        PaymentService.list = jasmine.createSpy('PaymentService.list').andReturn(payments);
        PaymentService.clear = jasmine.createSpy('PaymentService.clear');
        scope.selectPaymentMethod = jasmine.createSpy(scope.selectPaymentMethod);

        // mock the DialogSevice.messageDialog beahavior.
        // TODO not sure about scope.selectPaymentMethod('none'); call
        DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog').andCallFake(function(input) {
            var defer = $q.defer();
            defer.resolve();
            scope.selectPaymentMethod('none');
            return defer.promise;
        });

        $q = _$q_;
        // reproduce the scope inheritance
        $controller('PaymentOnCuffCtrl', {
            $q : _$q_,
            $scope : scope,
            payments : payments,
            DialogService : DialogService,
            PaymentService : PaymentService
        });
    }));

    /**
     * Given - 1 as installment And - an amount And - dueDate When -
     * computeInstallments is called. Then - should create 1 installment.
     */
    it('should create 1 installment', function() {
        // given
        scope.amount = 500;
        scope.dueDate = new Date();
        scope.installmentQty = 1;
        scope.payments = [];
        scope.computeInstallments();

        var expectedDate = new Date(scope.dueDate.getFullYear(), scope.dueDate.getMonth() + 1,0);

        expect(scope.payments.length).toEqual(1);
        expect(scope.payments[0].amount).toEqual(scope.amount);
        expect(new Date(scope.payments[0].dueDate)).toEqual(expectedDate);
    });

    /**
     * Given - 6 as installment And - an a valid amount And - dueData When -
     * computeInstallments is called. Then - should create 6 installment.
     */
    it('should create 6 installment', function() {
        // given
        scope.amount = 500;
        scope.dueDate = new Date();
        scope.installmentQty = 6;

        function addMonths(refDate, increase) {
            var baseDate = angular.copy(refDate);
            var date = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1 + increase, 0);
            if (date.getDate() > baseDate.getDate()) {
                date = new Date(baseDate.setMonth(baseDate.getMonth() + increase));
            }
            return date;
        }

        var expectedInstallment1 = 83.33;
        var expectedInstallment2 = 83.33;
        var expectedInstallment3 = 83.33;
        var expectedInstallment4 = 83.33;
        var expectedInstallment5 = 83.33;
        var expectedInstallment6 = 83.35;

        var currentMonth = new Date(scope.dueDate.getFullYear(), scope.dueDate.getMonth() + 1,0);
        var oneMonthAhead = addMonths(scope.dueDate, 1);
        var twoeMonthAhead = addMonths(scope.dueDate, 2);
        var threeMonthAhead = addMonths(scope.dueDate, 3);
        var fourMonthAhead = addMonths(scope.dueDate, 4);
        var fiveMonthAhead = addMonths(scope.dueDate, 5);
        
        scope.payments = [];

        scope.computeInstallments();

        expect(scope.payments.length).toEqual(6);


        expect(scope.payments[0].amount).toEqual(expectedInstallment1);
        expect(scope.payments[0].dueDate.getTime()).toEqual(currentMonth.getTime());

        expect(scope.payments[1].amount).toEqual(expectedInstallment2);
        expect(scope.payments[1].dueDate.getTime()).toEqual(oneMonthAhead.getTime());

        expect(scope.payments[2].amount).toEqual(expectedInstallment3);
        expect(scope.payments[2].dueDate.getTime()).toEqual(twoeMonthAhead.getTime());

        expect(scope.payments[3].amount).toEqual(expectedInstallment4);
        expect(scope.payments[3].dueDate.getTime()).toEqual(threeMonthAhead.getTime());

        expect(scope.payments[4].amount).toEqual(expectedInstallment5);
        expect(scope.payments[4].dueDate.getTime()).toEqual(fourMonthAhead.getTime());

        expect(scope.payments[5].amount).toEqual(expectedInstallment6);
        expect(scope.payments[5].dueDate.getTime()).toEqual(fiveMonthAhead.getTime());

    });

    /**
     * Given - 6 as installment And - an a valid amount And - dueData When -
     * computeInstallments is called. Then - should create 6 installment.
     */
    it('should call PaymentService', function() {
        // given
        scope.amount = 500;
        scope.dueDate = new Date();
        scope.installmentQty = 6;
        scope.payments = [
            {
                amount : 500,
                dueDate : 13132132
            }
        ];
        scope.payments[0].dueDate = scope.dueDate;
        scope.confirmOnCuffPayment();

        expect(PaymentService.add).toHaveBeenCalled();
        expect(PaymentService.add.mostRecentCall.args[0].amount).toEqual(500);
        expect(PaymentService.add.mostRecentCall.args[0].dueDate).toEqual(scope.dueDate);

    });

    /**
     * Given - a invalid amount for change 284 When - the controller is open.
     * Then - the scope.amount should be 0 .
     */
    it('should not open on-cuff screen', inject(function($controller, _$q_) {
        scope.totals.payments.remaining = 0;
        
        $q = _$q_;
        // reproduce the scope inheritance
        $controller('PaymentOnCuffCtrl', {
            $q : _$q_,
            $scope : scope,
            payments : payments,
            DialogService : DialogService,
            PaymentService : PaymentService
        });

        expect(DialogService.messageDialog).toHaveBeenCalledWith({
            title : 'Contas a receber',
            message : 'Não existem valores para serem lançados.',
            btnYes : 'OK'
        });
        expect(scope.selectPaymentMethod).toHaveBeenCalledWith('none');
    }));

});
