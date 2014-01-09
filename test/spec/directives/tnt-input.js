'use strict';

xdescribe('Directive: tntInput', function () {

  // load the directive's module
  beforeEach(module('tnt.catalog.numpad.input'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<tnt-input></tnt-input>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the tntInput directive');
  }));
});
