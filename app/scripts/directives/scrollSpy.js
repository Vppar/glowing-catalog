(function (angular) {

  'use strict';

  angular.module('glowingCatalogApp').directive(
    'scrollSpy',
    ['$window', '$location', '$anchorScroll', function ($window, $location, $anchorScroll) {
      return {
        restrict: 'A',
        controller: function ($scope) {
          this.spies = [];
          this.spyElems = [];
          $scope.anchors = [];

          this.addSpy = function (spyObj) {
            this.spies.unshift(spyObj);
          };

          this.delSpy = function (spyObj) {
            var ix = this.spies.indexOf(spyObj);
            this.spies.splice(ix, 1);
          };

          this.addAnchor = function (anchorObj) {
            this.spyElems[anchorObj.id] = anchorObj.element;
          };

          this.delAnchor = function (anchorObj) {
            delete this.spyElems[anchorObj.id];
          };

          this.registerContainer = function (id) {
            $scope.scrollContainer = id;
            $scope.registerCallback(id);
          };

          this.scroll = function (id) {
            $scope.scrollTo = id;
          };
        },
        link: function (scope, elem, attrs, ctrl) {

          scope.$on('$locationChangeStart', function (ev) {
            if ($location.path() === '/catalog') {
              ev.preventDefault();
            }
          });

          scope.$watch('scrollTo', function (id) {
            $location.hash(id);
            $anchorScroll();
          });

          function scrollCallback() {

            var highlightSpy, pos, spy, spies;
            highlightSpy = null;
            spies = ctrl.spies;
            for (var ix in spies) {
              spy = spies[ix];
              spy.out();

              if (ctrl.spyElems[spy.id] && ctrl.spyElems[spy.id].position() &&
                (pos = ctrl.spyElems[spy.id].position().top) - $window.scrollY <= 168) {
                spy.pos = pos;
                if (highlightSpy === null || highlightSpy.pos < spy.pos) {
                  highlightSpy = spy;
                }
              }
            }
            if (highlightSpy !== null) {
              highlightSpy['in']();
            }
          }

          scope.registerCallback = function (id) {
            elem.find('#' + id).scroll(scrollCallback);
          };
        }
      };
    }]).directive(
    'fixTitle',
    ['$window', function ($window) {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs, ctrl) {
          function fixTitle() {
            elem.find('.swiper-slide').each(function () {
              var $this = $(this);
              var offset = $this.offset().top;
              var scrollTop = elem.scrollTop();

              if (scrollTop > offset) {
                console.log('hahay -======================================');
                $this.addClass('fixed');
              } else {
                console.log('hehey -======================================');
                $this.removeClass('fixed');
              }
            });
          }

          elem.scroll(fixTitle);
        }
      };
    }]);
})(angular);