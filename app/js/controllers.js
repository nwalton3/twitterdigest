(function(){

	'use strict';


	/* Controllers */

	var ldControllers = angular.module('listDigest.controllers', []);

	ldControllers.controller('ListDigestCtrl', ['$scope', 'Lists',
	  function($scope, Lists) {
	    $scope.lists = Lists.query();
	  }]);

})();
