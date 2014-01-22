'use strict';

describe('Directive: upperCase', function() {
    // load the directive's module
    beforeEach(module('glowingCatalogApp'));

    var element, scope;

    beforeEach(inject(function($rootScope) {
        scope = $rootScope.$new();
    }));

   xit('should make upperCase text', inject(function($compile) {
        element = angular.element('<upper-case></upper-case>');
        element = $compile(element)(scope);
        expect(element.text()).toBe('this is the upperCase directive');
    }));

});
