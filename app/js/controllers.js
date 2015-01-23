(function(){

	'use strict';


	/* Controllers */

	var ldControllers = angular.module('listDigest.controllers', [
		'ngRoute', 
		'ngSanitize',
	]);





	// Header/Index
	ldControllers.controller('HeaderCtrl', [ '$scope', 'TwitterAPI', '$location', '_', 'sharedProperties',
		function( $scope, TwitterAPI, $location, _, sharedProperties ) {

			$scope.listSortable = "name";
			$scope.listsReverse = false;
			$scope.userSortable = "followers_count";
			$scope.usersReverse = true;
			$scope.currentFriend = sharedProperties.getCurrentFriend();
			$scope.friendList   = sharedProperties.getFriendList();

			// Get info about me
			if( !$scope.my ) {
				$scope.my = TwitterAPI.get( { path: 'account/verify_credentials', q: 'skip_status=true&include_entities=false' },
					function() { // Success
						$scope.my.friends = TwitterAPI.get( { path: 'friends/list', q: 'count=200&skip_status=true&include_user_entities=false' } );
						$scope.my.lists = TwitterAPI.query( { path: 'lists/list', q: 'reverse=true' } );
						$scope.my.settings = TwitterAPI.get( { path: 'account/settings' } );
					}, function(e) { // Error
						console.log("error:");
						console.log(e);
					}
				);
			}

			// Perform a search
			$scope.findUser = function() {
				$location.path('/' + $scope.screen_name );
			};



			// Sort Users
			$scope.changeUserSorting = function( value ) {
				if( $scope.userSortable == value ) {
					$scope.usersReverse = !$scope.usersReverse;
					return;
				}

				$scope.userSortable = value;

				if ( $scope.userSortable == "followers_count" ) {
					$scope.usersReverse = true;
				} else {
					$scope.usersReverse = false;
				}
			}



			// Sort Lists
			$scope.changeListSorting = function( value ) {
				if( $scope.listSortable == value ) {
					$scope.listsReverse = !$scope.listsReverse;
					return;
				}

				$scope.listSortable = value;

				if ( $scope.listSortable == "member_count" || $scope.listSortable == "subscriber_count" ) {
					$scope.listsReverse = true;
				} else {
					$scope.listsReverse = false;
				}
			}




			// Unfollow a user
			$scope.unfollow = function( user ) {
				var user_id = user.id_str;
				var unfollowed = TwitterAPI.save( { path: 'friendships/destroy', id: user_id },
					function() { // success
						if ( unfollowed.errors ) {
							console.log( 'ERROR: ' + unfollowed.errors[0].message );
							return;
						}
						user.following = false;
					}
				);
			};

		}
	]);






	// List page
	ldControllers.controller('ListCtrl', ['$scope', '$routeParams', '$location', 'TwitterAPI', '_', 'TweenMax', 'sharedProperties',
		function( $scope, $routeParams, $location, TwitterAPI, _, TweenMax, sharedProperties ) {

			// Define variables
			$scope.screen_name = '';
			$scope.tweets = [];
			$scope.lists = [];

			$scope.params = $routeParams;
			$scope.numTweets = 200;
			$scope.tweetsToShow = 10;
			$scope.isList = false;
			$scope.isUser = false;
			$scope.nextUser = null;
			$scope.friendList = null;
			$scope.currentFriend = sharedProperties.getCurrentFriend();
			$scope.friendList = sharedProperties.getFriendList();
			$scope.counter = {};

			// This is a list
			if ( $scope.params.listname ) {
				$scope.path = 'lists/statuses';
				$scope.query = 'count=' + $scope.numTweets + '&slug=' + $scope.params.listname + '&owner_screen_name=' + $scope.params.username;
				$scope.isList = true;

				$scope.list = TwitterAPI.get( { path: 'lists/show', q: 'slug=' + $scope.params.listname + '&owner_screen_name=' + $scope.params.username }, 
					function(){ // success
						$scope.user = $scope.list.user;
						$scope.tweetsToShow = 25;
					}
				);
			} 
			// This is a user
			else if ( $scope.params.username ) {
				$scope.path = 'statuses/user_timeline';
				$scope.query = 'count=' + $scope.numTweets + '&screen_name=' + $scope.params.username;
				$scope.isUser = true;
				$scope.user = _.find( $scope.friendList.data, function(friend){ return $scope.params.username == friend.screen_name } );

				$scope.user = TwitterAPI.get( { path: 'users/show', q: 'screen_name=' + $scope.params.username },
					function() { // success
						$scope.tweetsToShow = 10;
						$scope.currentFriend.data = $scope.user;
						$scope.nextUser = $scope.getNextUser();
					}
				);
			} 




			// Query the API
			if ( $scope.path && $scope.query ) {
				$scope.tweets = TwitterAPI.query({ 
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





			// Follow a user
			$scope.follow = function( user ) {
				var user_id = user.id_str;
				var followed = TwitterAPI.save( { path: 'friendships/create', id: user_id },
					function() { // success
						if ( followed.errors ) {
							console.log( 'ERROR: ' + followed.errors[0].message );
							return;
						}
						user.following = true;
					}
				);
			};



			// Favorite a tweet
			$scope.favorite = function( tweet ) {
				var fav = tweet.favorited;
				var path = 'favorites/create';
				var unfav = false;

				if (fav) {
					path = 'favorites/destroy';
					unfav = true;
				}

				var favorite = TwitterAPI.save( { path: path, id: tweet.id_str },
					function() { // success

						if ( favorite.errors ) {
							console.log( 'ERROR: ' + favorite.errors[0].message );
							return;
						}
						tweet.favorited = !unfav;
						if (!unfav) {
							tweet.favorite_count += 1;
						} else {
							tweet.favorite_count -= 1;
						}
					}
				);
			};



			// Retweet a tweet
			$scope.retweet = function( tweet ) {
				var rt = tweet.retweeted;

				var retweet = TwitterAPI.save( { path: 'statuses/retweet/' + tweet.id_str },
					function() { // success

						if ( retweet.errors ) {
							console.log( 'ERROR: ' + retweet.errors[0].message );
							return;
						}
						tweet.retweeted = true;
						tweet.retweet_count += 1;
						tweet.orderIndex = $scope.indexTweet(tweet);
					}
				);
			};



			// Reply to a tweet
			$scope.reply = function( e ) {
				console.log("reply clicked.");
			};



			// Show more tweets
			$scope.showMoreTweets = function() {
				if ( $scope.tweetsToShow + 10 <= $scope.numTweets ) {
					$scope.tweetsToShow += 10;
				}
			};



			// Sort tweets
			$scope.tweetSort = function( tweet ) {

				if ( !tweet.orderIndex ) {
					tweet.orderIndex = $scope.indexTweet(tweet);
				}

				return -1 * tweet.orderIndex;
			};



			// Get the next user in the ordered list of friends
			$scope.getNextUser = function() {

				var screen_name = $scope.screen_name;

				if( $scope.friendList.data !== null && $scope.friendList.data !== undefined ) {

					var list = $scope.friendList.data,
						currentFriend = _.find( list, function(friend) { return friend.screen_name == $scope.currentFriend.data.screen_name } ),
						currentIndex  = _.indexOf( list, currentFriend ),
						nextIndex  = currentIndex + 1;

						$scope.nextUser = list[nextIndex];
				} else {

					if ($scope.counter.nextUser) {
						$scope.counter.nextUser += 1;
					} else {
						$scope.counter.nextUser = 1;
					}
					
					if ($scope.counter.nextUser < 50 ) {
						setTimeout( $scope.getNextUser, 250 );
					} else {
						console.log('Could not get next user.');
					}
					
					return;
				}
				
				return $scope.nextUser;
			};



			// Get the username of the next user in the ordered list of friends
			$scope.getNextUserName = function() {

				var nextUser = $scope.getNextUser();
				return nextUser.screen_name;

			};




			// Index the tweet by an algorithm
			$scope.indexTweet = function( tweet ) {
				
				var retweet_weight, favorite_weight, follower_weight, link_weight, mention_weight, listed_weight,
					retweet_index, favorite_count, favorite_index, follower_index, link_index, mention_index, listed_index,
					rt_value, fav_value, fol_value, link_value, mention_value, lst_value, index;

				retweet_weight = 1;
				favorite_weight = 1.5;
				follower_weight = -0.5;
				link_weight = 0.25;
				mention_weight = 0.125;
				// listed_weight = 0.5;

				retweet_index = tweet.retweet_count / $scope.maxRetweets;
				favorite_count = tweet.retweeted_status ? tweet.retweeted_status.favorite_count : tweet.favorite_count;
				favorite_index = favorite_count / $scope.maxFavorites;
				follower_index = tweet.user.followers_count / $scope.maxFollowers;
				link_index = tweet.entities.urls.length;
				mention_index = tweet.entities.user_mentions.length;
				// listed_index = tweet.user.listed_count / $scope.maxListed;

				rt_value  = retweet_index * retweet_weight;
				fav_value = favorite_index * favorite_weight;
				fol_value = follower_index * follower_weight;

				if (link_index == 1 || link_index == 2) { link_value = link_weight }
				else if (link_index > 2) { link_value = -link_weight }
				else { link_value = 0 }

				if (mention_index == 1) { mention_value = mention_weight }
				else if (mention_index > 2) { mention_value = -mention_weight }
				else { mention_value = 0 }

				// lst_value = listed_index * listed_weight;

				index = rt_value + fav_value + fol_value + link_value + mention_value;
				return index;
			}



			// Load and show a tweet's media (photo)
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



})();
