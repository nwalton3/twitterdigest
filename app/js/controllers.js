(function(){

	'use strict';


	/* Controllers */

	var ldControllers = angular.module('listDigest.controllers', [
		'ngRoute', 
		'ngSanitize'
	]);


	ldControllers.controller('ListDigestCtrl', ['$scope', 'Lists',
		function($scope, Lists) {
			$scope.lists = [];
			$scope.screen_name = '';

			$scope.findLists = function() {
				$scope.lists = Lists.query( { path: 'lists/list.json', q: 'screen_name=' + $scope.screen_name } );
			}
		}
	]);


	ldControllers.controller('ListCtrl', ['$scope', '$routeParams', 'Lists', '_',
		function($scope, $routeParams, Lists, _) {

			// Define globals
			$scope.params = $routeParams;
			$scope.numTweets = 200;
			$scope.tweetsToShow = 20;
			$scope.isList = false;
			$scope.isUser = false;
			var path = '';
			var query = '';


			// This is a list
			if ( $scope.params.listid ) {
				$scope.path = 'lists/statuses.json';
				$scope.query = 'count=' + $scope.numTweets + '&list_id=' + $scope.params.listid;

				$scope.list = Lists.get( { path: 'lists/show.json', q: 'list_id=' + $scope.params.listid }, 
					function(){ // success
						$scope.user = $scope.list.user;
						$scope.isList = true;
					}
				);
			} 
			// This is a user
			else if ( $scope.params.userid ) {
				$scope.path = 'statuses/user_timeline.json';
				$scope.query = 'count=' + $scope.numTweets + '&user_id=' + $scope.params.userid;

				$scope.user = Lists.get( { path: 'users/show.json', q: 'user_id=' + $scope.params.userid }, 
					function() { // success
						$scope.isUser = true;
					}
				);
			} 
			// There was an error
			else {
				return;
			}


			// Query the API
			$scope.tweets = Lists.query({ 
					path: $scope.path, 
					q: $scope.query,
				}, 
				function() { // Success function
					var tweets = $scope.tweets;
					var most_retweets = _.max(tweets, function(t){ return t.retweet_count; });
					var most_favorites = _.max(tweets, function(t){ return t.favorite_count; });
					var most_followers = _.max(tweets, function(t){ return t.user.followers_count; });

					// Set the sorting filters
					$scope.maxRetweets = most_retweets.retweet_count;
					$scope.maxFavorites = most_favorites.favorite_count;
					$scope.maxFollowers = most_followers.user.followers_count;
				}
			);


			// Sort function
			$scope.tweetSort = function(tweet) {

				var retweet_weight = 1;
				var favorite_weight = 1.5;
				var follower_weight = -0.5;

				var retweet_index = tweet.retweet_count / $scope.maxRetweets;
				var favorite_index = tweet.favorite_count / $scope.maxFavorites;
				var follower_index = tweet.user.followers_count / $scope.maxFollowers;

				var rt_value  = retweet_index * retweet_weight;
				var fav_value = favorite_index * favorite_weight;
				var fol_value = follower_index * follower_weight;

				var index = rt_value + fav_value + fol_value;

				return -1 * index;
			}
		}
	]);


})();
