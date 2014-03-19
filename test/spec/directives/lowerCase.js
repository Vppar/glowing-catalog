'use strict';

describe('Directive: lowerCase', function() {
    // load the directive's module
    beforeEach(module('tnt.catalog.attrs.lowerCase'));

    var element, scope = {};

    beforeEach(inject(function($rootScope) {
        scope = $rootScope.$new();
    }));

    xit('should make lowerCase text', inject(function($compile) {
        var template = angular.element('<input ng-model="text" lower-case/>');
        element = $compile(template)(scope);
        element.val('This TEXT must be lowerCase!').trigger('input');
        expect(element.val()).toBe('this text must be lowercase!');
    }));

});
