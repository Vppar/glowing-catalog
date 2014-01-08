(function(angular) {
    'use strict';

    /**
     * 
     * <pre>
     * 
     * @test Grid.constructor#1
     * Validate the data on the returned object
     * 
     * @test Grid.constructor#2
     * Validate the read only fields
     * 
     * </pre>
     * 
     */
    
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

    angular.module('tnt.catalog.grid.keeper',['tnt.utils.array']).service('GridKeeper', function GridKeeper(Grid,ArrayUtils) {
        var grid = [];
        /**
         * <pre>
         * 
         *  @spec GridKeeper.build#1
         *  Given a valid array of products
         *  when the build is triggered
         *  then the grid should be populated with the products and their parents 
         * 
         *  @spec GridKeeper.build#2
         *  Given a invalid array of products
         *  when the build is triggered
         *  nothing should be added to the grid
         * 
         * </pre>
         * 
         * Build a grid of items from an array.
         * 
         * @param An array of products
         */
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
        
        this.read = function(){
            return angular.copy(grid);
        };
        
    });

    angular.module('tnt.catalog.grid', [
        'tnt.catalog.grid.entity', 'tnt.catalog.grid.keeper'
    ]);
})(angular);
