'use strict';

describe('Directive: upperCase', function() {
    // load the directive's module
    beforeEach(module('tnt.catalog.attrs.upperCase'));

    var element, scope = {};

    beforeEach(inject(function($rootScope) {
        scope = $rootScope.$new();
    }));

    xit('should make upperCase text', inject(function($compile) {
        var template = angular.element('<input ng-model="text" upper-case/>');
        element = $compile(template)(scope);
        element.val('This text must be upperCase!').trigger('input');
        expect(element.val()).toBe('THIS TEXT MUST BE UPPERCASE!');
    }));

});
