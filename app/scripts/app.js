'use strict';

angular.module('glowingCatalogApp', ['ui.bootstrap', 'ui.select2']).config(function($routeProvider) {
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
        controller : "LoginCtrl"
    }).when('/partial-delivery', {
        templateUrl : 'views/partial-delivery.html',
        controller : "PartialDeliveryCtrl"
    }).when('/order-list', {
        templateUrl : 'views/order-list.html',
    }).when('/previous-entries', {
        templateUrl : 'views/previous-entries.html',
    }).when('/inventory', {
        templateUrl : 'views/inventory.html',
    }).when('/delivery', {
        templateUrl : 'views/delivery.html',
        controller : 'DeliveryCtrl'
    }).otherwise({
        redirectTo : '/'
    });
});
