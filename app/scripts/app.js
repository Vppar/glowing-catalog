'use strict';

angular.module('glowingCatalogApp', []).config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl : 'views/main.html',
        controller : 'MainCtrl'
    }).when('/dashboard', {
        templateUrl : 'views/dashboard.html',
        controller : 'DashboardCtrl'
    }).when('/add-customer', {
        templateUrl : 'views/add-customer.html',
        controller : 'AddCustomerCtrl'
    }).when('/catalog', {
        templateUrl : 'views/catalog.html',
        controller : 'CatalogCtrl'
    }).when('/basket', {
        templateUrl : 'views/basket.html',
        controller : 'BasketCtrl'
    }).when('/payment', {
        templateUrl : 'views/payment.html',
        controller : 'PaymentCtrl'
    }).when('/login', {
        templateUrl : 'views/login.html'
    }).when('/delivery', {
        templateUrl : 'views/delivery.html',
        controller : 'DeliveryCtrl'
    }).otherwise({
        redirectTo : '/'
    });
});
