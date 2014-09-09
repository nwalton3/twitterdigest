(function(){

	'use strict';

	// Declare app level module which depends on filters, and services
	var listDigest = angular.module('listDigest', [
	  'ngRoute',
	  'ngSanitize',
	  'ngAnimate',
	  'listDigest.filters',
	  'listDigest.services',
	  'listDigest.directives',
	  'listDigest.controllers'
	]);

	listDigest.config(['$routeProvider', function($routeProvider) {
	  $routeProvider.when('/', {templateUrl: 'app/partials/search.html', controller: 'ListCtrl'});
	  $routeProvider.when('/:username', {templateUrl: 'app/partials/list.html', controller: 'ListCtrl'});
	  $routeProvider.when('/:username/:listname', {templateUrl: 'app/partials/list.html', controller: 'ListCtrl'});
	  $routeProvider.otherwise({redirectTo: '/'});
	}]);


})();
