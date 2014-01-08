'use strict';

xdescribe('Directive: catalogHighlights', function () {

  // load the directive's module
  beforeEach(module('glowingCatalogApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<catalog-highlights></catalog-highlights>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the catalogHighlights directive');
  }));
});
