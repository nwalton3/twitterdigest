(function(){

	'use strict';


	/* Services */

	var ldServices = angular.module('listDigest.services', ['ngResource']);
	  
	ldServices.value('version', '0.1');

	ldServices.factory('Lists', ['$resource', 
		function listsFactory( $resource ) {
			return $resource('/connect/auth.php', { }, {
				get: {method:'GET', params: { path: '@path', q: encodeURIComponent('@q') }, isArray:false, cache: true},
				query: {method:'GET', params: { path: '@path', q: encodeURIComponent('@q') }, isArray:true, cache: true},
			});
		}
	]);

	// ldServices.factory('User', ['$resource', 
	// 	function tweetsFactory( $resource ) {
	// 		return $resource('/connect/user.php', { }, {
	// 			get: {method:'GET', params: { path: '@path', q: encodeURIComponent('@q') }, isArray:false, cache: true},
	// 			query: {method:'GET', params: { path: '@path', q: encodeURIComponent('@q') }, isArray:true, cache: true},
	// 		});
	// 	}
	// ]);

	ldServices.factory('_', [
		function underscoreFactory() {
			return window._;
		}
	]);

	ldServices.factory('typogr', [
		function typogrifyFactory() {
			return window.typogr;
		}
	]);

})();
