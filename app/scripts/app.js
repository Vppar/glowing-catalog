(function (angular, window) {
    'use strict';

    var glowingCatalogApp =
        angular.module('glowingCatalogApp', [
            'once',
            'ngRoute',
            'ui.bootstrap',
            'ui.select2',
            'angular-md5',
            'tnt.catalog.directive.numpad',
            'tnt.catalog.dialog.numpad.ctrl',
            'tnt.catalog.dialog.changePassword.ctrl',
            'tnt.catalog.productReturn',
            'tnt.catalog.productReturn.entity',
            'tnt.catalog.productReturn.service',
            'tnt.catalog.productReturn.keeper',
            'tnt.catalog.filter.count',
            'tnt.catalog.filter.findBy',
            'tnt.catalog.filter.sum',
            'tnt.catalog.filter.phone',
            'tnt.catalog.filter.paymentType',
            'tnt.catalog.service.data',
            'tnt.catalog.service.dialog',
            'tnt.catalog.order.service',
            'tnt.catalog.order',
            'tnt.catalog.service.expense',
            'tnt.catalog.service.sms',
            'tnt.catalog.service.storage',
            'tnt.catalog.header',
            'tnt.catalog.headerDev',
            'tnt.catalog.basket',
            'tnt.catalog.basket.add',
            'tnt.catalog.customer',
            'tnt.catalog.customer.add.phones',
            'tnt.catalog.customer.add.emails',
            'tnt.catalog.customer.choose',
            'tnt.catalog.receivable.service',
            'tnt.catalog.financial.receivable.ctrl',
            'tnt.catalog.financial.receivable.list.ctrl',
            'tnt.catalog.financial.receivable.liquidate.ctrl',
            'tnt.catalog.financial.receivable.receive.ctrl',
            'tnt.catalog.financial.expense',
            'tnt.catalog.financial.incomeStatement',
            'tnt.utils.array',
            'tnt.catalog.components.product-display',
            'tnt.catalog.components.catalog-section',
            'tnt.catalog.components.highlight-display',
            'tnt.catalog.components.catalog-highlights',
            'tnt.catalog.components.dateRange',
            'tnt.catalog.inventory',
            'tnt.catalog.payment.oncuff.ctrl',
            'tnt.catalog.payment.coupon',
            'tnt.catalog.keyboard.input',
            'tnt.catalog.voucher.ctrl',
            'tnt.catalog.voucher.active.ctrl',
            'tnt.catalog.voucher.historic.ctrl',
            'tnt.catalog.voucher.entity',
            'tnt.catalog.entity',
            'tnt.catalog.entity.service',
            'tnt.catalog.entity.entity',
            'tnt.catalog.journal.entity',
            'tnt.catalog.payment',
            'tnt.catalog.payment.check',
            'tnt.catalog.payment.creditcard',
            'tnt.catalog.payment.creditcard.service',
            'tnt.catalog.payment.exchange',
            'tnt.catalog.misplaced.service',
            'tnt.catalog.payment.service',
            'tnt.catalog.payment.entity',
            'tnt.catalog.voucher',
            'tnt.catalog.warmup.ctrl',
            'tnt.catalog.warmup.service',
            'tnt.catalog.attrs.upperCase',
            'tnt.catalog.attrs.lowerCase',
            'tnt.catalog.payment.discount',
            'tnt.catalog.entity.service',
            'tnt.catalog.entity.entity',
            'tnt.catalog.orderList.ctrl',
            'tnt.catalog.orderList.orders.ctrl',
            'tnt.catalog.orderList.products.ctrl',
            'tnt.catalog.orderList.clients.ctrl',
            'tnt.catalog.stock',
            'tnt.catalog.lineup',
            'tnt.catalog.stock.service',
            'tnt.catalog.stock.ctrl',
            'tnt.catalog.type',
            'tnt.catalog.productsDelivery',
            'tnt.catalog.productsToBeDelivery',
            'tnt.catalog.productsDelivered',
            'tnt.catalog.productsToBeDeliveryProducts',
            'tnt.catalog.productsDeliveredProducts',
            'tnt.catalog.productsDeliverySchedule',
            'tnt.catalog.scheduling',
            'tnt.catalog.purchaseOrder',
            'tnt.catalog.timer.service',
            'tnt.catalog.sync.driver',
            'tnt.catalog.sync.firebase',
            'tnt.catalog.sync.service',
            'tnt.catalog.purchaseOrder.service',
            'tnt.catalog.login.ctrl',
            'tnt.utils.cep',
            'tnt.catalog.gopay.gateway',
            'tnt.catalog.book',
            'tnt.catalog.bookkeeping.entity',
            'tnt.catalog.bookkeeping.keeper',
            'tnt.catalog.bookkeeping.entry',
            'tnt.catalog.bookkeeping.report.ctrl',
            'tnt.catalog.service.book',
            'tnt.utils.cpf',
            'tnt.catalog.bi.ctrl',
            'tnt.catalog.attrs.customerName',
            'tnt.catalog.appointments',
            'tnt.catalog.appointments.ctrl',
            'tnt.catalog.appointments.service',
            'tnt.catalog.appointments.entity',
            'tnt.catalog.appointments.keeper',
            'tnt.catalog.components.numpad',
            'tnt.catalog.directives.clickDelay',
            'tnt.catalog.directives.fastClick',
            'tnt.catalog.components.numberPicker',
            'tnt.catalog.directives.preventBlur',
            'tnt.catalog.directives.virtualKeyboard',
            'tnt.catalog.directives.keyboardCage',
            'tnt.catalog.directives.focus',
            'tnt.catalog.directives.equals',
            'tnt.catalog.directives.promiseClick',
            'tnt.catalog.check',
            'tnt.catalog.check.service',
            'tnt.catalog.check.ctrl',
            'tnt.catalog.thirdparty',
            'tnt.catalog.service.intent',
            'tnt.catalog.consultant.service',
            'tnt.catalog.consultant',
            'tnt.catalog.registration.ctrl',
            'tnt.catalog.purchase.service',
            'tnt.catalog.purchase.confirm.ctrl',
            'tnt.catalog.purchase.new.ctrl',
            'tnt.catalog.purchase.pending.ctrl',
            'tnt.catalog.purchase.stashed.ctrl',
            'tnt.catalog.purchase.summary.ctrl',
            'tnt.catalog.purchase.ticket.dialog.ctrl',
            'tnt.catalog.purchase.ticket.ctrl',
            'tnt.catalog.purchase.ctrl',
            'tnt.catalog.pagpop',
            'tnt.chart.components.gauge',
            'tnt.chart.components.termometer',
            'tnt.chart.components.cumulative',
            'tnt.chart.components.histogram',
            'tnt.catalog.target',
            'tnt.catalog.target.keeper',
            'tnt.catalog.target.entity',
            'tnt.catalog.target.ctrl',
            'tnt.catalog.target.service',
            'tnt.catalog.target.list.ctrl',
            'tnt.catalog.target.parent.ctrl',
            'tnt.catalog.subscription.service',
            'tnt.catalog.subscription.ctrl'
        ]);

    glowingCatalogApp.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl : 'views/main.html',
            controller : 'MainCtrl'
        }).when('/basket', {
            templateUrl : 'views/basket.html',
            controller : 'BasketCtrl'
        }).when('/payment', {
            templateUrl : 'views/payment.html',
            controller : 'PaymentCtrl'
        }).when('/partial-delivery', {
            templateUrl : 'views/partial-delivery.html',
            controller : 'PartialDeliveryCtrl'
        }).when('/pending-delivery', {
            templateUrl : 'views/pending-delivery.html'
        }).when('/previous-entries', {
            templateUrl : 'views/previous-entries.html'
        }).when('/inventory', {
            templateUrl : 'views/inventory.html'
        }).when('/delivery', {
            templateUrl : 'views/delivery.html',
            controller : 'DeliveryCtrl'
        }).when('/financial', {
            templateUrl : 'views/financial.html',
            controller : 'FinancialCtrl'
        }).when('/expense', {
            templateUrl : 'views/expense.html',
            controller : 'ExpenseCtrl'
        }).when('/receivable', {
            templateUrl : 'views/receivable.html',
            controller : 'ReceivableCtrl'
        }).when('/income-statement', {
            templateUrl : 'views/income-statement.html',
            controller : 'IncomeStatementCtrl'
        }).when('/receivable-list', {
            templateUrl : 'views/receivable-list.html'
        }).when('/cash-flow', {
            templateUrl : 'views/cash-flow.html',
        }).when('/book-keeping-report', {
            templateUrl : 'views/book-keeping-report.html',
            controller : 'BookKeepingReportCtrl'
        }).when('/appointment', {
            templateUrl : 'views/appointments.html',
            controller : 'AppointmentsCtrl'
        }).when('/tutorial-ipad', {
            templateUrl : 'views/tutorial-ipad.html'
        }).when('/tutorial-android', {
            templateUrl : 'views/tutorial-android.html'

        }).when('/add-customer', {
            templateUrl : 'views/sacred-add-customer.html',
            controller : 'AddCustomerCtrl'
        }).when('/login', {
            templateUrl : 'views/sacred-login.html',
            controller : 'LoginCtrl'
        }).when('/products-delivery', {
            templateUrl : 'views/parts/products-delivery/sacred-products-delivery.html',
            controller : 'ProductsDeliveryCtrl'
        }).when('/pagpop', {
            templateUrl : 'views/sacred-pagpop.html',
            controller : 'PagpopCtrl'
        }).when('/purchase-order', {
            templateUrl : 'views/parts/purchase-order/sacred-purchase-order.html',
            controller : 'PurchaseOrderCtrl'
        }).when('/registration', {
            templateUrl : 'views/sacred-registration.html'
        }).when('/stock', {
            templateUrl : 'views/sacred-stock.html',
            controller : 'StockCtrl'
        }).when('/third-parties', {
            templateUrl : 'views/sacred-third-parties.html',
            controller: 'ThirdPartyCtrl'
        }).when('/target', {
            templateUrl : 'views/sacred-target.html',
            controller : 'TargetParentCtrl'
        }).when('/target-list', {
            templateUrl : 'views/sacred-target-list.html',
            controller : 'TargetListCtrl'
        }).when('/voucher', {
            templateUrl : 'views/sacred-voucher.html',
            controller : 'VoucherCtrl'
        }).when('/warmup', {
            templateUrl : 'views/sacred-warm-up.html',
            controller : 'WarmupCtrl'
        }).when('/bi', {
            templateUrl : 'views/sacred-bi.html',
            controller : 'BiCtrl'
        }).when('/order-list-old', {
            templateUrl : 'views/order-list.html',
            controller : 'OrderListCtrl'
        }).when('/order-list', {
            templateUrl : 'views/sacred-order-list.html',
            controller : 'OrderListCtrl'
        }).when('/receivable-check', {
            templateUrl : 'views/sacred-receivable-check.html'
        }).when('/receivable-check-old', {
            templateUrl : 'views/receivable-check.html'
         }).when('/goal-poster', {
            templateUrl : 'views/sacred-goal-poster.html'

        }).when('/components/date-range', {
            templateUrl : 'routes/components/date-range/date-range.html',
            controller : 'DateRangeTestCtrl'
        }).when('/components/tnt-numpad', {
            templateUrl : 'routes/components/tnt-numpad/tnt-numpad.html'
        }).when('/components/tnt-number-picker', {
            templateUrl : 'routes/components/tnt-number-picker/tnt-number-picker.html'
        }).when('/scenarios/ipad-keyboard-focus-scenario', {
            templateUrl : 'routes/scenarios/ipad-keyboard-focus-scenario/ipad-keyboard-focus-scenario.html'
        }).when('/spinner-button-promise', {
            templateUrl : 'views/spinner-button-promise.html'
        }).otherwise({
            redirectTo : '/'
        });
    }]).run(function(){
        window.glowingCatalogAppReady = true;
    });
})(angular, window);

(function ($, angular) {
    'use strict';

    var $log = {};

    var $injector = angular.injector([
        'ng'
    ]);
    $injector.invoke(['$log',function (_$log_) {
        $log = _$log_;
    }]);

    // FIXME this tap event has been altered to prevent default pointer
    // behavior, what
    // may or may not cause you hassle in the future. Find a better place to
    // handle the mousedown event
    $.event.special.tap = {
        setup : function () {
            var self = this, $self = $(self);

            var field = $self.context;
            var id = field.id ? field.id : field.name ? field.name : field.alt ? field.alt : '?';

            $self.on('touchstart', function (startEvent) {
                var target = startEvent.target;

                $self.one('touchend', function (endEvent) {
                    if (target === endEvent.target) {
                        $log.debug('touch tap on ' + id);
                        $.event.simulate('tap', self, endEvent);
                    }
                });
            });

            if (!('ontouchstart' in window || 'onmsgesturechange' in window)) {
                $self.mousedown(function () {
                    return false;
                });
                $self.on('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $log.debug('click simulated tap on ' + id);
                    $.event.simulate('tap', self, jQuery.Event('tap'));
                });
            } else {
                $self.on('click', function (event) {
                    $self.mousedown(function () {
                        return false;
                    });
                    event.stopPropagation();
                    event.preventDefault();
                    $log.debug('click intercepted on touch device, field: ' + id);
                });
            }
        }
    };
})(jQuery, angular);
