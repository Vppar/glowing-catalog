'use strict';

describe('Controller: AddClientCtrl', function () {

  // load the controller's module
  beforeEach(module('glowingCatalogApp'));

  var AddClientCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddClientCtrl = $controller('AddClientCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
