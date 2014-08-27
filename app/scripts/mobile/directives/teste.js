(function (angular) {
  'use strict';

  angular.module('glowingCatalogApp').directive('teste', function teste() {
    return function(scope, element, attrs) {
    element.bind('click', function(event) {
      // event.stopPropagation();
      scope.$on('$locationChangeStart', function(ev) {
        ev.preventDefault();
      });
      var location = attrs.scrollTo;
      $location.hash(location);
      $anchorScroll();
    });
  };
  });

angular.module('glowingCatalogApp').directive('teste', function teste() {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
             if (this.pageYOffset >= 100) {
                 scope.boolChangeClass = true;
                 console.log('Scrolled below header.');
             } else {
                 scope.boolChangeClass = false;
                 console.log('Header is in view.');
             }
            scope.$apply();
        });
    };
});

})(angular);