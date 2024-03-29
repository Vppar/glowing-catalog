'use strict';

describe('Directive: upperCase', function() {
    // load the directive's module
    beforeEach(module('tnt.catalog.attrs.customerName'));

    var element, scope = {};

    beforeEach(inject(function($rootScope) {
        scope = $rootScope.$new();
    }));

    it('should make a customer name compliant', inject(function($compile) {
        var template = angular.element('<input ng-model="text" customer-name/>');
        element = $compile(template)(scope);
        element.val('jOaO De gZuiS DA Sirva');
        element.trigger('blur');
        expect(element.val()).toBe('Joao de Gzuis da Sirva');
    }));
    
    it('should make a customer name compliant, even with numbers', inject(function($compile) {
        var template = angular.element('<input ng-model="text" customer-name/>');
        element = $compile(template)(scope);
        element.val('jOaO De gZuiS 1234 DA Sirva 4th');
        element.trigger('blur');
        expect(element.val()).toBe('Joao de Gzuis 1234 da Sirva 4th');
    }));

});
