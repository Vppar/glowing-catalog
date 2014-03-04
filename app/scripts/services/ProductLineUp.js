(function (angular) {
    'use strict';

    angular.module('tnt.catalog.lineup', [
        'tnt.utils.array'
    ]).service(
        'ProductLineUp',
        ['ArrayUtils', 
        function ProductLineUp (ArrayUtils) {

            function p3x3 (product) {
                product.w = 3;
                product.h = 3;
            }

            function p6x3 (product) {
                product.w = 6;
                product.h = 3;
            }

            function p6x2 (product) {
                product.w = 6;
                product.h = 2;
            }

            this.minSize =
                function (lineUp) {
                    for ( var ix in lineUp) {
                        var product = lineUp[ix];

                        // if (angular.isUndefined(product.h)) {
                        if (angular.isUndefined(product.description)) {
                            p3x3(product);
                        } else if (product.description.length < 110 &&
                            angular.isUndefined(product.expires)) {
                            p3x3(product);
                        } else if (angular.isDefined(product.description) &&
                            product.description.length > 175) {
                            p6x3(product);
                        } else {
                            p6x2(product);
                        }
                        // }
                    }
                };

            this.lineUp = function (lineUp, left, right) {

                this.minSize(lineUp);

                // 3x3 must come in pairs
                var _3x3 = ArrayUtils.filter(lineUp, {
                    w : 3,
                    h : 3
                });
                if (_3x3.length % 2) {
                    var rogue = _3x3.pop();
                    rogue.w = 6;
                    rogue.h = 2;
                }

                var leftH = 0;
                var rightH = 0;

                function push (p1, p2) {
                    if (leftH > rightH) {
                        right.push(p1);
                        rightH += p1.h;
                        if (p2) {
                            right.push(p2);
                        }
                    } else {
                        left.push(p1);
                        leftH += p1.h;
                        if (p2) {
                            left.push(p2);
                        }
                    }
                }

                var cache = false;
                for ( var ix in lineUp) {
                    if (lineUp[ix].w === 3) {
                        if (cache) {
                            push(cache, lineUp[ix]);
                            cache = false;
                        } else {
                            cache = lineUp[ix];
                        }
                    } else {
                        push(lineUp[ix]);
                    }
                }

                if (leftH - rightH === -1) {
                    fix1(left, right);
                }

                if (rightH - leftH === -1) {
                    fix1(right, left);
                }

                if (leftH - rightH === -2) {
                    fix2(left, right);
                }

                if (rightH - leftH === -2) {
                    fix2(right, left);
                }

                if (leftH - rightH === -3) {
                    fix3(left, right);
                }

                if (rightH - leftH === -3) {
                    fix3(right, left);
                }

            };

            function fix1 (short, big) {
                var items = ArrayUtils.list(short, 'h', 2);
                if (items.length > 0) {
                    items[0].h = 3;
                    return;
                }

                items = ArrayUtils.filter(short, {
                    w : 3,
                    h : 3
                });

                if (items.length > 1) {
                    items[0].w = 6;
                    items[0].h = 2;
                    items[1].w = 6;
                    items[1].h = 2;
                    return;
                }

            }

            function fix2 (short, big) {
                var items = ArrayUtils.filter(short, {
                    w : 3,
                    h : 3
                });

                if (items.length > 3) {
                    items[0].w = 6;
                    items[0].h = 2;
                    items[1].w = 6;
                    items[1].h = 2;
                    items[2].w = 6;
                    items[2].h = 2;
                    items[3].w = 6;
                    items[3].h = 2;
                    return;
                }

                if (items.length > 1) {
                    items[0].w = 6;
                    items[0].h = 2;
                    items[1].w = 6;
                    items[1].h = 3;
                    return;
                }
            }

            function fix3 (short, big) {
                var items = ArrayUtils.filter(big, {
                    w : 3,
                    h : 3
                });

                if (items.length > 1) {
                    items[0].w = 6;
                    items[0].h = 2;
                    items[1].w = 6;
                    items[1].h = 2;

                    var ix = big.indexOf(items[1]);

                    short.push(big.splice(ix, 1)[0]);

                    return;
                }
            }

        }]);
})(angular);