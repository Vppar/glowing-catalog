(function(angular) {
    'use strict';

    angular.module('tnt.catalog.basket.add', [
        'tnt.catalog.service.data',
        'tnt.catalog.service.dialog',
        'tnt.catalog.misplaced.service'
    ]).controller(
            'AddToBasketDialogCtrl',
            ['$scope', '$filter', '$q', 'dialog', 'OrderService', 'DataProvider', 'ArrayUtils', 'InventoryKeeper', 'StockService', 'DialogService', 'Misplacedservice',
            function($scope, $filter, $q, dialog, OrderService, DataProvider, ArrayUtils, InventoryKeeper, StockService, DialogService, Misplacedservice) {

                var orderItems = OrderService.order.items;
                var inventory = InventoryKeeper.read();

                // Find the product and make a copy to the local scope.
                var product = ArrayUtils.find(DataProvider.products, 'id', dialog.data.id);

                var productStock = StockService.findInStock(product.id + 1);

                if (productStock.reserve > 0) {
                    if ((productStock.quantity - productStock.reserve) > 0) {
                        product.inventory = (productStock.quantity - productStock.reserve);
                    } else {
                        product.inventory = 0;
                    }
                } else if (productStock.quantity > 0) {
                    product.inventory = productStock.quantity;
                } else {
                    product.inventory = 0;
                }

                // find the grid
                var grid = angular.copy(ArrayUtils.list(inventory, 'parent', dialog.data.id));

                for ( var i in grid) {
                    var gridStock = StockService.findInStock(grid[i].id);

                    if (gridStock.reserve > 0) {
                        if ((gridStock.quantity - gridStock.reserve) > 0) {
                            grid[i].inventory = (gridStock.quantity - gridStock.reserve);
                        } else {
                            grid[i].inventory = 0;
                        }
                    } else if (gridStock.quantity > 0) {
                        grid[i].inventory = gridStock.quantity;
                    } else {
                        grid[i].inventory = 0;
                    }

                }

                function getProductDiscount() {
                  var total = 0;
                  for (var idx in grid) {
                    var orderProduct = ArrayUtils.find(orderItems, 'id', grid[idx].id);
                    var item = orderProduct || grid[idx];
                    total += item.specificDiscount || 0;
                  }

                  return total;
                }

                var index = orderItems.length - 1;
                $scope.product = product;
                $scope.grid = grid;
                $scope.total = 0;
                $scope.specificDiscount = getProductDiscount();


                var originalTotal = 0;
                var originalQty = 0;

                function updateTotal() {
                    var total = 0, count = 0;
                    for ( var ix in $scope.grid) {
                        total += $scope.grid[ix].qty * product.price;
                        count += $scope.grid[ix].qty;
                    }

                    $scope.total = total;
                    $scope.count = count;
                }


                for ( var ix in $scope.grid) {
                    var orderProduct = ArrayUtils.find(orderItems, 'id', $scope.grid[ix].id);
                    var qty = $scope.grid.length > 1 ? 0 : 1;
                    if (orderProduct) {
                        qty = orderProduct.qty;
                    }
                    $scope.grid[ix].qty = qty;

                    originalTotal += $scope.grid[ix].qty * product.price;
                    originalQty += $scope.grid[ix].qty;
                }

                for (var ix in $scope.grid) {
                    $scope.$watch('grid[' + ix + '].qty', function () {
                      updateTotal();

                      var changedTotals = $scope.total !== originalTotal || $scope.count !== originalQty;

                      if (changedTotals) {
                          clearSpecificDiscount();
                      }
                    });
                }


                function clearSpecificDiscount() {
                    $scope.specificDiscount = 0;
                }


                /**
                 * Closes the dialog telling the caller to add the product to
                 * the basket.
                 */
                $scope.addToBasket = function addToBasket() {
                    var innerGrid = [];

                    for ( var ix in $scope.grid) {
                        var orderProduct = ArrayUtils.find(orderItems, 'id', $scope.grid[ix].id);
                        if (orderProduct) {
                          if ($scope.specificDiscount) {
                            // clear order discount from this item
                            orderProduct.orderDiscount = 0;
                          }
                          innerGrid.push(orderProduct);
                        } else {
                          innerGrid.push($scope.grid[ix]);
                        }
                    }

                    Misplacedservice.distributeSpecificDiscount($scope.total, $scope.specificDiscount, innerGrid);

                    for (var ix in $scope.grid) {
                        var orderProduct = ArrayUtils.find(orderItems, 'id', $scope.grid[ix].id);
                        if (orderProduct) {
                            if ($scope.grid[ix].qty === 0) {
                                orderItems.splice(orderItems.indexOf(orderProduct), 1);
                            } else {
                                orderProduct.qty = $scope.grid[ix].qty;
                            }
                        } else {
                            if ($scope.grid[ix].qty > 0) {
                                $scope.grid[ix].idx = ++index;
                                orderItems.push($scope.grid[ix]);
                            }
                        }
                    }


                    dialog.close(true);
                };

                /**
                 * Closes the dialog telling the caller not to add the product
                 * to the basket.
                 */
                $scope.cancel = function cancel() {
                    dialog.close($q.reject());
                };


                function openDialogNumpad() {
                    var numpadDialog = DialogService.openDialogNumpad(null, dialog).then(function (discount) {
                      discount = discount > $scope.total ? $scope.total : discount;
                      setSpecificDiscount(discount);

                      // TODO
                      // if product has a grid, set discount to all types
                      // otherwise, set discount to product
                    });
                }

                $scope.openDialogNumpad = openDialogNumpad;


                function setSpecificDiscount(discount) {
                  $scope.specificDiscount = discount || 0;
                }

                $scope.setSpecificDiscount = setSpecificDiscount;
            }]);
}(angular));
