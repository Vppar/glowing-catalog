(function(angular) {
    'use strict';

    angular.module('tnt.catalog.grid.entity', []).factory('Grid', function Grid() {
        var service = function svc(id, grid) {

            if (arguments.length != svc.length) {
                throw 'Grid must be initialized with an id and a grid(array of ids)';
            }

            // TODO check if grid is an array

            ObjectUtils.ro(this, 'id', id);
            ObjectUtils.ro(this, 'grid', grid);
        };

        return service;
    });

    angular.module('tnt.catalog.grid.keeper', []).service('GridKeeper', function GridKeeper(Grid) {
        var grid = [];

        this.build = function(products) {
            for ( var ix in products) {
                var product = products[ix];

                var gridItem = new Grid(product.id, []);

                // TODO add section and line

                if (product.parent) {
                    var parent = ArrayUtils.find(grid, 'id', product.parent);

                    parent.grid.push(gridItem);
                } else {
                    grid.push(gridItem);
                }
            }
        };
    });

    angular.module('tnt.catalog.grid', [
        'tnt.catalog.grid.entity', 'tnt.catalog.grid.keeper'
    ]);
})(angular);
