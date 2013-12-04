'use strict';

describe('Controller: IncomeStatementCtrl', function () {

  // load the controller's module
  beforeEach(module('glowingCatalogApp'));

  var IncomeStatementCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    IncomeStatementCtrl = $controller('IncomeStatementCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
