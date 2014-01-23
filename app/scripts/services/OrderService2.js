(function(angular) {
    'use strict';

    angular.module('tnt.catalog.order.service', []).service('OrderService2', function OrderService2(Order, OrderKeeper) {
        
        var isValid = function isValid(){
        };
        
        var register = function register(){
        };
        
        var list = function list(){
        };
        
        var read = function read(id){
        };
        
        var cancel = function cancel(id){
        };
        
        
        this.isValid = isValid;
        this.register = register;
        this.list = list;
        this.read = read;
        this.cancel = cancel;
    });
}(angular));