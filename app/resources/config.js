(function (angular) {
    'use strict';

    /**
     * Providing configs since... ever.
     */
    angular.module('tnt.catalog.config', []).service('CatalogConfig', function CatalogConfig () {
        ObjectUtils.ro(this, 'firebaseURL', 'voppwishlist.firebaseio.com');
        ObjectUtils.ro(this, 'cdnURL', 'https://vopp.com.br/wishlist/');
        ObjectUtils.ro(this, 'imageBaseURL', 'images/catalog/products/');
    });
})(angular);
