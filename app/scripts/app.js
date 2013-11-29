(function(angular) {
    'use strict';

    angular.module(
            'glowingCatalogApp',
            [
                'ui.bootstrap', 'ui.select2', 'tnt.catalog.filter.findBy', 'tnt.catalog.filter.sum', 'tnt.catalog.filter.paymentType',
                'tnt.catalog.service.data', 'tnt.catalog.service.dialog', 'tnt.catalog.service.order', 'tnt.catalog.service.payment',
                'tnt.catalog.service.sms', 'tnt.catalog.header', 'tnt.catalog.basket', 'tnt.catalog.basket.add', 'tnt.catalog.customer',
                'tnt.catalog.customer.add.phones', 'tnt.catalog.customer.add.emails', 'tnt.catalog.customer.choose', 'tnt.catalog.payment',
                'tnt.catalog.payment.check', 'tnt.catalog.payment.creditcard', 'tnt.catalog.payment.exchange', 'tnt.catalog.financial.receivable'
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
        }).when('/pending-delivery', {
            templateUrl : 'views/pending-delivery.html'
        }).when('/products-to-buy', {
            templateUrl : 'views/products-to-buy.html'
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
          templateUrl: 'views/expense.html',
          controller: 'ExpenseCtrl'
        }).when('/receivable', {
          templateUrl: 'views/receivable.html',
          controller: 'ReceivableCtrl'
        }).otherwise({
            redirectTo : '/'
        });
    });
}(angular));