(function(){

	'use strict';


	/* Services */

	var ldServices = angular.module('listDigest.services', ['ngResource']);
	
	ldServices.value('version', '0.1');

	ldServices.factory('TwitterAPI', ['$resource',
		function listsFactory( $resource ) {
			return $resource('/connect/auth_user.php', { }, {
				get: {method:'GET', params: { path: '@path', q: encodeURIComponent('@q') }, isArray:false, cache: true},
				query: {method:'GET', params: { path: '@path', q: encodeURIComponent('@q') }, isArray:true, cache: true},
				save: {method:'POST', params: { path: '@path', id: '@id', post: true }, isArray:false, cache: false},
			});
		}
	]);

	ldServices.service('sharedProperties', [
		function sharedPropertiesService() {
			var currentFriend = { data: null };
			var friendList = { data: null };
			
			return {
				getCurrentFriend: function() {
					return currentFriend;
				},
				getFriendList: function() {
					return friendList;
				}
			};
		}
	]);

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

	ldServices.factory('TweenMax', [
		function tweenMaxFactory() {
			return window.TweenMax;
		}
	]);


})();
