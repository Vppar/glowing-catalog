(function(angular) {
    'use strict';

    angular.module(
            'glowingCatalogApp',
            ['ui.bootstrap', 'ui.select2', 'tnt.catalog.filter', 'tnt.catalog.service', 'tnt.catalog.header', 'tnt.catalog.basket.add',
                'tnt.catalog.customer', 'tnt.catalog.payment'
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
        }).otherwise({
            redirectTo : '/'
        });
    });
}(angular));