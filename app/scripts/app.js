(function(angular) {
    'use strict';

    angular.module(
            'glowingCatalogApp',
            [
                'ngRoute',
                'ui.bootstrap',
                'ui.select2',
                'tnt.catalog.directive.numpad',
                'tnt.catalog.productReturn',
                'tnt.catalog.productReturn.entity',
                'tnt.catalog.productReturn.service',
                'tnt.catalog.productReturn.keeper',
                'tnt.catalog.filter.count',
                'tnt.catalog.filter.findBy',
                'tnt.catalog.filter.sum',
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
                'tnt.catalog.product.input.dialog',
                'tnt.catalog.receivable.service',
                'tnt.catalog.financial.receivable.ctrl',
                'tnt.catalog.financial.receivable.entity',
                'tnt.catalog.financial.expense',
                'tnt.catalog.financial.incomeStatement',
                'tnt.catalog.financial.receivable.search.ctrl',
                'tnt.utils.array',
                'tnt.catalog.components.product-display',
                'tnt.catalog.components.catalog-section',
                'tnt.catalog.components.highlight-display',
                'tnt.catalog.gopay.integration',
                'tnt.catalog.components.catalog-highlights',
                'tnt.catalog.inventory',
                'tnt.catalog.payment.oncuff',
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
                'tnt.catalog.payment.exchange',
                'tnt.catalog.misplaced.service',
                'tnt.catalog.payment.service',
                'tnt.catalog.payment.entity',
                'tnt.catalog.voucher',
                'tnt.catalog.attrs.upperCase',
                'tnt.catalog.payment.discount',
                'tnt.catalog.entity.service',
                'tnt.catalog.entity.entity',
                'tnt.catalog.orderList.ctrl',
                'tnt.catalog.orderList.orders.ctrl', 
                'tnt.catalog.orderList.products.ctrl', 
                'tnt.catalog.orderList.clients.ctrl',
                'tnt.catalog.stock',
                'tnt.catalog.lineup',
                'tnt.catalog.productsToBuy.ctrl',
                'tnt.catalog.stock.service',
                'tnt.catalog.stock.ctrl'
            ]).config(function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl : 'views/main.html',
            controller : 'MainCtrl'
        }).when('/dashboard', {
            templateUrl : 'views/dashboard.html',
            controller : 'DashboardCtrl'
        }).when('/add-customer', {
            templateUrl : 'views/add-customer.html',
            controller : 'AddCustomerCtrl'
        }).when('/basket', {
            templateUrl : 'views/basket.html',
            controller : 'BasketCtrl'
        }).when('/payment', {
            templateUrl : 'views/payment.html',
            controller : 'PaymentCtrl'
        }).when('/login', {
            templateUrl : 'views/login.html',
            controller : 'LoginCtrl'
        }).when('/partial-delivery', {
            templateUrl : 'views/partial-delivery.html',
            controller : 'PartialDeliveryCtrl'
        }).when('/products-to-buy', {
            templateUrl : 'views/products-to-buy.html',
            controller : 'ProductsToBuyCtrl'
        }).when('/pending-delivery', {
            templateUrl : 'views/pending-delivery.html'
        }).when('/order-list', {
            templateUrl : 'views/order-list.html',
            controller : 'OrderListCtrl'
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
        }).when('/stock', {
            templateUrl : 'views/stock.html',
            controller : 'StockCtrl'
        }).when('/voucher', {
            templateUrl : 'views/voucher.html',
            controller : 'VoucherCtrl'
        }).when('/cash-flow', {
            templateUrl : 'views/cash-flow.html',
        }).otherwise({
            redirectTo : '/'
        });
    }).run(function(JournalKeeper){
        JournalKeeper.resync();
    });
}(angular));

(function($, angular) {
    'use strict';
  
    var $log = {};
    
    var $injector = angular.injector(['ng']);
    $injector.invoke(function(_$log_){
        $log = _$log_;
    });
  
    // FIXME this tap event has been altered to prevent default pointer behavior, what
    // may or may not cause you hassle in the future. Find a better place to handle the mousedown event
    $.event.special.tap = {
        setup : function() {
            var self = this, $self = $(self);
            
            var field = $self.context;
            var id = field.id ? field.id : field.name ? field.name : field.alt ? field.alt : '?';

            $self.on('touchstart', function(startEvent) {
                var target = startEvent.target;

                $self.one('touchend', function(endEvent) {
                    if (target == endEvent.target) {
                      $log.debug('touch tap on ' + id);
                        $.event.simulate('tap', self, endEvent);
                    }
                });
            });

            if (!('ontouchstart' in window || 'onmsgesturechange' in window)) {
                $self.mousedown(function(){return false;});
                $self.on('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $log.debug('click simulated tap on ' + id);
                    $.event.simulate('tap', self, jQuery.Event( "tap" ));
                });
            } else {
                $self.on('click', function(event) {
                    $self.mousedown(function(){return false;});
                    event.stopPropagation();
                    event.preventDefault();
                    $log.debug('click intercepted on touch device, field: ' + id);
                });
            }
        }
    };
})(jQuery, angular);
