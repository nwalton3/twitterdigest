(function(){

	'use strict';


	/* Controllers */

	var ldControllers = angular.module('listDigest.controllers', [
		'ngRoute', 
		'ngSanitize',
	]);


	ldControllers.controller('ListCtrl', ['$scope', '$routeParams', '$location', 'Lists', '_',
		function($scope, $routeParams, $location, Lists, _) {

			// Define variables
			$scope.screen_name = '';
			$scope.params = $routeParams;
			$scope.numTweets = 200;
			$scope.tweetsToShow = 20;
			$scope.isList = false;
			$scope.isUser = false;
			var path = '';
			var query = '';


			// This is a list
			if ( $scope.params.listname ) {
				$scope.path = 'lists/statuses.json';
				$scope.query = 'count=' + $scope.numTweets + '&slug=' + $scope.params.listname + '&owner_screen_name=' + $scope.params.username;

				$scope.list = Lists.get( { path: 'lists/show.json', q: 'slug=' + $scope.params.listname + '&owner_screen_name=' + $scope.params.username }, 
					function(){ // success
						$scope.user = $scope.list.user;
						$scope.isList = true;
					}
				);
			} 
			// This is a user
			else if ( $scope.params.username ) {
				$scope.path = 'statuses/user_timeline.json';
				$scope.query = 'count=' + $scope.numTweets + '&screen_name=' + $scope.params.username;

				$scope.lists = Lists.query( { path: 'lists/list.json', q: 'screen_name=' + $scope.params.username } );
				$scope.user = Lists.get( { path: 'users/show.json', q: 'screen_name=' + $scope.params.username },
					function() { // success
						$scope.isUser = true;
					}
				);
			} 


			// Query the API
			if ( $scope.path && $scope.query ) {
				$scope.tweets = Lists.query({ 
						path: $scope.path, 
						q: $scope.query,
					}, 
					function() { // Success function
						var tweets = $scope.tweets;
						var most_retweets = _.max(tweets, function(t){ return t.retweet_count; });
						var most_favorites = _.max(tweets, function(t){ return t.favorite_count; });
						var most_followers = _.max(tweets, function(t){ return t.user.followers_count; });
						// var most_listed = _.max(tweets, function(t){ return t.user.listed_count; });

						// Set the sorting filters
						$scope.maxRetweets = most_retweets.retweet_count;
						$scope.maxFavorites = most_favorites.favorite_count;
						$scope.maxFollowers = most_followers.user.followers_count;
						// $scope.maxListed = most_listed.user.listed_count;
					}
				);
			}



			// Perform a search
			$scope.findUser = function() {
				$location.path('/' + $scope.screen_name );
			};


			// Sort function
			$scope.tweetSort = function( tweet ) {

				var retweet_weight = 1;
				var favorite_weight = 1.5;
				var follower_weight = -0.5;
				// var listed_weight = 0.5;

				var retweet_index = tweet.retweet_count / $scope.maxRetweets;
				var favorite_index = tweet.favorite_count / $scope.maxFavorites;
				var follower_index = tweet.user.followers_count / $scope.maxFollowers;
				// var listed_index = tweet.user.listed_count / $scope.maxListed;

				var rt_value  = retweet_index * retweet_weight;
				var fav_value = favorite_index * favorite_weight;
				var fol_value = follower_index * follower_weight;
				// var lst_value = listed_index * listed_weight;

				var index = rt_value + fav_value + fol_value /* + lst_value */;

				return -1 * index;
			}

			$scope.showMedia = function( e ) {
				var el = e.target;

				// If data has not been gathered from element, get it and then set element variables
				if ( !el.img && !el.src && !el.wrapper ) {
					var t     = angular.element(e.target);
					var media = t && t.parent();
					var m     = media.hasClass('tweet_media') ? media : false;
					var wrap  = t && t.next();
					var w     = wrap.hasClass('imgWrapper') ? wrap : false;
					var image = w && w.children();
					var i     = image.hasClass('tweet_image') ? image : false;
					var src   = i.attr('data-src');

					el.img = i;
					el.src = src;
					el.wrapper = m;

					el.img.attr('src', el.src);
				}

				el.wrapper.toggleClass('collapsed');
			};
		}
	]);





	ldControllers.directive('contenteditable', ['$sce',
		function( $sce ) {
			return {
				restrict: 'A', // only activate on element attribute
				require: '?ngModel', // get a hold of NgModelController
				link: function(scope, element, attrs, ngModel) {
					if (!ngModel) return; // do nothing if no ng-model

					// Specify how UI should be updated
					ngModel.$render = function() {
						element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
					};

					// Listen for change events to enable binding
					element.on('blur keyup change', function() {
						scope.$apply(read);
					});
					read(); // initialize

					// Write data to the model
					function read() {
						var html = element.html();
						// When we clear the content editable the browser leaves a <br> behind
						// If strip-br attribute is provided then we strip this out
						if ( html == '<br>' ) {
							html = '';
						}
						ngModel.$setViewValue(html);
					}
				}
			};
		}
	]);



})();
