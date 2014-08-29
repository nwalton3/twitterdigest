(function(){

	'use strict';


	/* Services */

	var ldServices = angular.module('listDigest.services', ['ngResource']);
	  
	ldServices.value('version', '0.1');

	ldServices.factory('Token', ['$resource',
		function($resource){
			return $resource('/connect/auth.php');
		}
	]);

	ldServices.factory('Lists', ['$resource', 'Token',
		function($resource, Token){

			var apiUrl = 'https://api.twitter.com/1.1/lists/list.json';
			var paramDefaults = { screen_name: 'natewalton' };
			var queryParams = { headers: { 'Authorization': 'Bearer ' + this.key } };

			if ( !this.bearerToken ) {
				this.bearerToken = Token.get();
				this.key = this.bearerToken.key;
			}

			return $resource( apiUrl, paramDefaults, { query: queryParams } );
		}
	]);

})();
