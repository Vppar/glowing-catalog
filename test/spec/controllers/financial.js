'use strict';

xdescribe('Controller: FinancialCtrl', function () {

  // load the controller's module
  beforeEach(module('glowingCatalogApp'));

  var FinancialCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FinancialCtrl = $controller('FinancialCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
