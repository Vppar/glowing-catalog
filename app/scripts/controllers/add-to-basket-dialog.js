(function(angular) {
    'use strict';

    angular.module('tnt.catalog.basket.add', [
        'tnt.catalog.service.data',
        'tnt.catalog.service.dialog',
        'tnt.catalog.misplaced.service',
        'tnt.catalog.config'
    ]).controller(
            'AddToBasketDialogCtrl',
            ['$scope', '$filter', '$q', 'dialog', 'OrderService', 'DataProvider', 'ArrayUtils', 'InventoryKeeper', 'StockService', 'DialogService', 'Misplacedservice', 'CatalogConfig','$location',
            function($scope, $filter, $q, dialog, OrderService, DataProvider, ArrayUtils, InventoryKeeper, StockService, DialogService, Misplacedservice, CatalogConfig, $location) {

                $scope.config = CatalogConfig;
                
                $scope.getImageData = function(name){
                    return DataProvider.images[name];
                };
                
                var Discount = Misplacedservice.discount;

                var orderItems = OrderService.order.items;
                var inventory = InventoryKeeper.read();


                // Find the product and make a copy to the local scope.
                var product = ArrayUtils.find(DataProvider.products, 'id', dialog.data.id);
                $scope.showDiscount = dialog.data.showDiscount;

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
                var filter = {
                    parent: dialog.data.id,
                    active: true
                };
                
                var grid = angular.copy(ArrayUtils.filter(inventory, filter));
                

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
                  var items = [];
                  for (var idx in grid) {
                    var orderProduct = ArrayUtils.find(orderItems, 'id', grid[idx].id);
                    items.push(orderProduct || grid[idx]);
                  }

                  return Discount.getTotalItemDiscount(items);
                }

                var index = orderItems.length - 1;
                $scope.product = product;
                $scope.gridLength = grid.length;
                
                if(dialog.data.idItem){
                    $scope.grid = [];
                    $scope.grid.push(ArrayUtils.find(grid, 'id',dialog.data.idItem));
                }else{
                    $scope.grid = grid;
                }
                if($scope.grid[0].option){
                    $scope.uniqueName = $scope.grid[0].SKU + ' - ' + $scope.grid[0].option;
                }else{
                    $scope.uniqueName = $scope.grid[0].SKU;
                }
                $scope.total = 0;
                $scope.itemDiscount = getProductDiscount();


                var originalTotal = 0;
                var originalQty = 0;

                function updateTotal() {
                    var total = 0, count = 0;
                    for ( var ix in $scope.grid) {
                        var price = $scope.grid[ix].price ? $scope.grid[ix].price : product.price;
                        total += $scope.grid[ix].qty * price;
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
                    
                    var price = $scope.grid[ix].price ? $scope.grid[ix].price : product.price;
                    originalTotal += $scope.grid[ix].qty * price;
                    originalQty += $scope.grid[ix].qty;
                }

                for (var ix in $scope.grid) {
                    $scope.$watch('grid[' + ix + '].qty', function () {
                      updateTotal();

                      var changedTotals = $scope.total !== originalTotal || $scope.count !== originalQty;

                      if (changedTotals) {
                          clearItemDiscount();
                      }
                    });
                }


                function clearItemDiscount() {
                    $scope.itemDiscount = 0;
                }


                /**
                 * Closes the dialog telling the caller to add the product to
                 * the basket.
                 */
                $scope.addToBasket = function addToBasket() {
                    var items = [];

                    for ( var ix in $scope.grid) {
                        var orderProduct = ArrayUtils.find(orderItems, 'id', $scope.grid[ix].id);
                        if (orderProduct) {
                          items.push(orderProduct);
                        } else if ($scope.grid[ix].qty) {
                          items.push($scope.grid[ix]);
                        }
                    }

                    Discount.distributeItemDiscount(items, $scope.itemDiscount);

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
                    if ($scope.count > 0) {
                        var data = {
                          initial : $scope.itemDiscount,
                          relative : $scope.total
                        };

                        var numpadDialog = DialogService.openDialogNumpad(data, dialog).then(function (discount) {
                          discount = discount > $scope.total ? $scope.total : discount;
                          setItemDiscount(discount);
                        });
                        return numpadDialog;
                    }

                    return $q.reject();
                }

                $scope.openDialogNumpad = openDialogNumpad;


                function setItemDiscount(discount) {
                    $scope.itemDiscount = discount || 0;
                }

                $scope.setItemDiscount = setItemDiscount;
            }]);
}(angular));
