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
        element.val('jOaO De gZuiS DA Sirva').trigger('input');
        expect(element.val()).toBe('Joao de Gzuis da Sirva');
    }));

});
