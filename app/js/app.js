(function(){

	'use strict';

	// Declare app level module which depends on filters, and services
	var listDigest = angular.module('listDigest', [
	  'ngRoute',
	  'ngSanitize',
	  'listDigest.filters',
	  'listDigest.services',
	  'listDigest.directives',
	  'listDigest.controllers'
	]);

	listDigest.config(['$routeProvider', function($routeProvider) {
	  $routeProvider.when('/search', {templateUrl: 'app/partials/search.html', controller: 'ListDigestCtrl'});
	  $routeProvider.when('/list/:listid', {templateUrl: 'app/partials/list.html', controller: 'ListCtrl'});
	  $routeProvider.when('/user/:userid', {templateUrl: 'app/partials/list.html', controller: 'ListCtrl'});
	  $routeProvider.otherwise({redirectTo: '/search'});
	}]);


})();
