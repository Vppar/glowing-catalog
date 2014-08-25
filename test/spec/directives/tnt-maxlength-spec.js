'use strict';

describe('Directive: tntMaxlength', function () {

  // load the directive's module
  beforeEach(module('tnt.catalog.attrs.tntMaxlength'));

  var element, scope = {};

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should limit a string', inject(function ($compile) {
    var template = angular.element('<input ng-model="text" tnt-maxlength="10"/>');
    element = $compile(template)(scope);
    element.val('0123456789');
    element.trigger('input');
    expect(element.val()).toBe('0123456789');
  }));

  it('shouldn\'t limit a string', inject(function ($compile) {
    var template = angular.element('<input ng-model="text" tnt-maxlength="5"/>');
    element = $compile(template)(scope);
    element.val('0123456789');
    element.trigger('input');
    expect(element.val()).toBe('01234');
  }));
});
