(function (angular) {
    'use strict';

    angular.module('glowingCatalogApp').directive('swiper', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            controller: function ($scope, $element, $attrs) {
                //if ($attrs.swiper) angular.extend(swiperOptions, $scope.$eval($attrs.swiper));
              function test(){

                $element.swiper({
                  paginationClickable: true,
                  watchActiveIndex: true,
                  slidePerView: 1,

                  onTouchMove: function(swiper){
                    $('.swiper-container.catalog-child-swiper').addClass('swiping');
                  },

                  onSlideReset: function(swiper){
                    $('.swiper-container.catalog-child-swiper').removeClass('swiping');
                  },

                  onSlideChangeStart: function(swiper){
                    console.log('actual0: '+ swiper.activeIndex);

                    $('<div/>', {
                      id: 'catalog-loading',
                      class: 'modal-backdrop',
                      style: 'position: absolute;',
                      html: '<div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>'
                    }).appendTo(swiper.container);
                  },
                  onSlideChangeEnd: function (swiper) {

                    console.log('I should change now!');

                    // alerts angular to load content
                    swiper.activeSlide().click();

                    console.log('thats the end');
                    $('#catalog-loading').remove();
                    $('.swiper-container.catalog-child-swiper').removeClass('swiping');

                    setTimeout(function() {

                      var index = swiper.activeIndex;

                      var catalogChildSwiper = new Swiper($('.catalog-child-swiper').get(index), {
                        mode: 'vertical'
                      });

                      $('.swiper-container.product-swiper').on('touchstart mousedown', function(event){

                        var elem =  event.target;
                        if(elem.className == 'product-addbtn' || elem.className == 'add-product-bigger-button')
                          return true;

                        event.stopPropagation();
                        //event.preventDefault();
                      });

                    }, 0);
                  }
                });
              }

              $timeout(test, 0);
            }
        }
    }]);

})(angular);
