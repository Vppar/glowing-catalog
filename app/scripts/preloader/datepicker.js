angular.module("template/datepicker/popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/popup.html",
    "<ul class=\"dropdown-menu\" fast-click ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\" class=\"dropdown-menu\">\n" +
    "   <li ng-transclude></li>\n" +
    "   <li class=\"divider\"></li>\n" +
    "   <li style=\"padding: 9px;\">\n" +
    "       <span class=\"btn-group\">\n" +
    "           <button class=\"btn btn-small btn-inverse\" ng-click=\"today()\">Hoje</button>\n" +
    "           <button class=\"btn btn-small btn-info\" ng-click=\"showWeeks = ! showWeeks\" ng-class=\"{active: showWeeks}\">Semanas</button>\n" +
    "           <button class=\"btn btn-small btn-danger\" ng-click=\"clear()\">Limpar</button>\n" +
    "       </span>\n" +
    "       <button class=\"btn btn-small btn-success pull-right\" ng-click=\"isOpen = false\">Fechar</button>\n" +
    "   </li>\n" +
    "</ul>");
}]);