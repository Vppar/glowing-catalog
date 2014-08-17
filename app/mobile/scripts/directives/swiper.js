(function (angular) {
    'use strict';

    angular.module('glowingCatalogApp').directive('swiper', function () {
        return {
            restrict: 'EA',
            template: "<div class='swiper-container catalog-swiper'>" +
                "<div class='swiper-wrapper'></div>" +
                "<div style='display: none' ng-transclude></div>" +
                "</div>",
            replace: true,
            transclude: true,
            // We use a controller here so the slide directive
            // can require it and call `addSlide`.
            controller: function ($scope, $element, $attrs) {
                var newSlides = [];
                var mySwiper = null;
                var slideCount = 0;
                var callbacks = {};

                // Attached directly to the controller so other directives
                // have access to it.
                this.addSlide = function (html, callback) {
                    if (mySwiper) {
                        var newSlide = mySwiper.createSlide(html.html());
                        // Hackily save off the callback based on
                        // a unique ID since getData() for
                        // swiper.clickedSlide doesn't appear to work
                        // when using setData() on newSlide.
                        newSlide.data('slideNumber', ++slideCount);
                        mySwiper.appendSlide(newSlide);
                        callbacks[slideCount] = callback;
                        mySwiper.swipeTo(0, 0, false);
                    } else {
                        // mySwiper hasn't been initialized yet; save
                        // the slide off in an array so we can add it later.
                        newSlides.push({html: html, callback: callback});
                    }
                };

                var swiperOptions = {
                    loop: true,
                    mode: 'vertical',
                    onSlideClick: function (swiper) {
                        // Look up the callback we saved off and call it.
                        var clicked = swiper.clickedSlide;
                        var slideNumber = clicked.data('slideNumber');
                        var callback = callbacks[slideNumber];
                        if (callback) callback();
                    }
                };
                if ($attrs.swiper) angular.extend(swiperOptions, $scope.$eval($attrs.swiper));
                $timeout(function () {
                    mySwiper = $element.swiper(swiperOptions);

                    // Now that mySwiper has been initialized, iterate
                    // over any calls to `addSlide` that happened
                    // before we were ready and add them to the swiper.
                    for (var i = 0; i < newSlides.length; i++) {
                        var slide = newSlides[i];
                        this.addSlide(slide.html, slide.callback);
                    }
                }.bind(this));
            }
        }
    }).directive('slide', function () {
        return {
            restrict: 'EA',
            // Look for a parent `swiper` element and get its controller
            require: '^swiper',
            template: "<div class='swiper-slide' ng-transclude></div>",
            replace: true,
            transclude: true,
            link: function (scope, elem, attrs, swiper) {
                swiper.addSlide(elem, function () {
                    scope.$apply(attrs.ngClick);
                });
            }
        }
    }).directive('swiper-child', function () {
        return {
            restrict: 'EA',
            template: "<div class='swiper-container catalog-child-swiper'>" +
                "<div class='swiper-wrapper'></div>" +
                "<div style='display: none' ng-transclude></div>" +
                "</div>",
            replace: true,
            transclude: true,
            // We use a controller here so the slide directive
            // can require it and call `addSlide`.
            controller: function ($scope, $element, $attrs) {
                var newSlides = [];
                var mySwiper = null;
                var slideCount = 0;
                var callbacks = {};

                // Attached directly to the controller so other directives
                // have access to it.
                this.addSlide = function (html, callback) {
                    if (mySwiper) {
                        var newSlide = mySwiper.createSlide(html.html());
                        // Hackily save off the callback based on
                        // a unique ID since getData() for
                        // swiper.clickedSlide doesn't appear to work
                        // when using setData() on newSlide.
                        newSlide.data('slideNumber', ++slideCount);
                        mySwiper.appendSlide(newSlide);
                        callbacks[slideCount] = callback;
                        mySwiper.swipeTo(0, 0, false);
                    } else {
                        // mySwiper hasn't been initialized yet; save
                        // the slide off in an array so we can add it later.
                        newSlides.push({html: html, callback: callback});
                    }
                };

                var swiperOptions = {
                    loop: true,
                    mode: 'vertical',
                    onSlideClick: function (swiper) {
                        // Look up the callback we saved off and call it.
                        var clicked = swiper.clickedSlide;
                        var slideNumber = clicked.data('slideNumber');
                        var callback = callbacks[slideNumber];
                        if (callback) callback();
                    }
                };
                if ($attrs.swiper) angular.extend(swiperOptions, $scope.$eval($attrs.swiper));
                $timeout(function () {
                    mySwiper = $element.swiper(swiperOptions);

                    // Now that mySwiper has been initialized, iterate
                    // over any calls to `addSlide` that happened
                    // before we were ready and add them to the swiper.
                    for (var i = 0; i < newSlides.length; i++) {
                        var slide = newSlides[i];
                        this.addSlide(slide.html, slide.callback);
                    }
                }.bind(this));
            }
        }
    }).directive('slide-child', function () {
        return {
            restrict: 'EA',
            // Look for a parent `swiper` element and get its controller
            require: '^swiper',
            template: "<div class='swiper-slide' ng-transclude></div>",
            replace: true,
            transclude: true,
            link: function (scope, elem, attrs, swiper) {

                elem.find('.swiper-container.product-swiper').$on('touchstart mousedown', function(event){
                    var elem =  event.target;
                    if(elem.className == 'product-addbtn' || elem.className == 'add-product-bigger-button')
                        return true;

                    event.stopPropagation();
                    //event.preventDefault();
                });
            }
        }
    });

})(angular);
