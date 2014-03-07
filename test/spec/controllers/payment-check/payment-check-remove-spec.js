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
    var sms = {};
    var BookService = {};

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

        module(function($provide) {
            $provide.value('OrderService', os);
            $provide.value('EntityService', es);
            $provide.value('ReceivableService', rs);
            $provide.value('ProductReturnService', prs);
            $provide.value('VoucherService', vs);
            $provide.value('StockKeeper', sk);
            $provide.value('SMSService', sms);
            $provide.value('BookService', BookService);
        });
    });
    beforeEach(inject(function($controller, $rootScope, _$filter_, $q, Misplacedservice) {
        // scope mock
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        PromiseHelper.config($q, angular.noop);

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
        dialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog').andCallFake(PromiseHelper.resolved(true));
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

        var result = false;
        // when
        runs(function() {
            scope.removeCheck(scope.check).then(function() {
                result = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return result;
        });

        // then
        runs(function() {
            expect(scope.payments.length).toBe(0);
            expect(dialogService.messageDialog).toHaveBeenCalledWith({
                title : 'Pagamento Com Cheque',
                message : 'Confirmar exclusão da parcela?',
                btnYes : 'Sim',
                btnNo : 'Não'
            });
        });
    });
});
