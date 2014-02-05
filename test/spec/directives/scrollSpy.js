'use strict';

describe('Directive: scrollSpy', function () {

  // load the directive's module
  beforeEach(module('tnt.catalog.components.input-qty'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  xit('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<scroll-spy></scroll-spy>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the scrollSpy directive');
  }));
});
