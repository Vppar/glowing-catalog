describe('Controller: PaymentCheckCtrlAdd', function() {

    var scope = {};
    var element = {};
    var dialogService = {};
    var fakeNow = 1412421495;
    var os = {};
    var es = {};
    var rs = {};
    var prs = {};
    var vs = {};

    beforeEach(function() {
        module('tnt.catalog.payment.check');
        module('tnt.catalog.filter.findBy');
        module('tnt.catalog.order.service');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.service.data');
        module('tnt.catalog.inventory.entity');
        module('tnt.catalog.filter.sum');
        module('tnt.catalog.filter.paymentType');
        module('tnt.catalog.misplaced.service');
        
        module(function($provide){
            $provide.value('OrderService', os);
            $provide.value('EntityService', es);
            $provide.value('ReceivableService', rs);
            $provide.value('ProductReturnService', prs);
            $provide.value('VoucherService', vs);
        });
    });
    
    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        // scope mock
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        scope = $rootScope.$new();
        scope.checkForm = {
            $valid : true
        };

        // element mock
        element.find = function(name) {
            var element = {
                removeClass : function(name) {
                    return this;
                },
                addClass : function(name) {
                    return this;
                }
            };
            return element;
        };

        // dialog service mock
        dialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog');
        scope.dialogService = dialogService;
        scope.total = {
            change : 0
        };

        $controller('PaymentCheckCtrl', {
            $scope : scope,
            $element : element,
            $filter : _$filter_
        });
    }));

    it('should add a check payment', function() {
        // given
        angular.extend(scope.check, sampleData.payment.check);

        var check = angular.copy(scope.check);

        var paymentsSize = scope.payments.length;

        // when
        scope.addCheck(scope.check);

        check.id = 1;

        // then
        expect(scope.payments.length).toBe(paymentsSize + 1);
        expect(scope.payments[paymentsSize]).toEqual(check);
        expect(scope.check.bank).toBeNull();
        expect(scope.check.agency).toBeNull();
        expect(scope.check.account).toBeNull();
        expect(scope.check.number).toBeNull();
        expect(scope.check.duedate.getTime()).toBe(fakeNow);
        expect(scope.check.amount).toBe(0);
    });

    xit('should add a check payment with installments', function() {
        // given
        angular.extend(scope.check, sampleData.payment.check);

        var check = angular.copy(scope.check);

        var paymentsSize = scope.payments.length;

        // when
        scope.check.installments = 2;

        scope.addCheck(scope.check);

        check.id = 1;

        // then
        expect(scope.payments.length).toBe(paymentsSize + 2);
        expect(scope.payments[paymentsSize]).toEqual(check);
        expect(scope.check.bank).toBeNull();
        expect(scope.check.agency).toBeNull();
        expect(scope.check.account).toBeNull();
        expect(scope.check.number).toBeNull();
        expect(scope.check.duedate).toBe(fakeNow);
        expect(scope.check.amount).toBe(0);
    });

    it('shouldn\'t add a check payment with invalid form', function() {
        // given
        angular.extend(scope.check, sampleData.payment.check);
        scope.checkForm.$valid = false;

        var check = angular.copy(scope.check);
        var paymentsSize = scope.payments.length;

        // when
        scope.addCheck(scope.check);

        // then
        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.check).toEqual(check);

    });

    it('shouldn\'t add a repeated check payment', function() {
        // given
        // list of payment in the before each
        angular.extend(scope.check, sampleData.payment.check);
        scope.payments.push(sampleData.payment.check);

        var check = angular.copy(scope.check);
        var paymentsSize = scope.payments.length;

        // when
        scope.addCheck(scope.check);

        // then
        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.check).toEqual(check);
        expect(dialogService.messageDialog).toHaveBeenCalledWith({
            title : 'Pagamento com Cheque',
            message : 'O cheque número ' + check.number + ' já foi adicionado',
            btnYes : 'OK'
        });
    });
});
