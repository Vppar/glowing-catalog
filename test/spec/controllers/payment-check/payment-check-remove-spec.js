describe('Controller: PaymentCheckCtrlRemove', function() {

    var scope = {};
    var element = {};
    var dialogService = {};
    var fakeNow = 1412421495;
    var os = {};
    var es = {};
    var rs = {};
    var prs = {};
    var vs = {};
    var sk = {};

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
            $provide.value('StockKeeper', sk);
        });
    });
    beforeEach(inject(function($controller, $rootScope, _$filter_, $q, Misplacedservice) {
        // scope mock
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        scope = $rootScope.$new();
        scope.checkForm = {
            $valid : true
        };
        scope.total = {
            change : 0
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
        var defered = $q.defer();
        defered.resolve();
        dialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog').andReturn(defered.promise);
        scope.dialogService = dialogService;

        $controller('PaymentCheckCtrl', {
            $scope : scope,
            $element : element,
            $filter : _$filter_
        });
    }));

    it('should remove a check payment', function() {
        // given
        // list of payment in the before each
        angular.extend(scope.check, sampleData.payment.check);
        scope.payments.push(sampleData.payment.check);

        var check = angular.copy(scope.check);
        var paymentsSize = scope.payments.length;

        // when
        scope.removeCheck(scope.check);

        // then
        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.check).toEqual(check);
        expect(dialogService.messageDialog).toHaveBeenCalledWith({
            title : 'Pagamento Com Cheque',
            message : 'Confirmar exclusão da parcela?',
            btnYes : 'Sim',
            btnNo : 'Não'
        });
    });
});
