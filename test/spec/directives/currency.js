'use strict';

describe('Directive: currency', function () {

  // load the directive's module
  beforeEach(module('glowingCatalogApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  xit('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<currency></currency>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the currency directive');
  }));
});
