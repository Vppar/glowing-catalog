(function(angular) {
  'use strict';
  // Mock for glowingCatalogApp module
  angular.module('glowingCatalogApp', [
    'tnt.catalog.service.data'
  ]).run(function(DataProvider) {
    DataProvider.fakeJournal();
  });
}(angular));
