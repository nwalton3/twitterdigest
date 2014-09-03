(function(){

	'use strict';

	/* Filters */

	var ldFilters = angular.module('listDigest.filters', []);

	ldFilters.filter('parseDate', [ 
		function() {
			return function(date) {
				return Date.parse(date);
			};
		}
	]);

	ldFilters.filter('parseDay', [ '$filter',
		function( $filter ) {
			return function(date) {
				var d = Date.parse(date);
				var now = Date.now();

				var dateFilter = $filter('date');

				var dFormat = dateFilter(d, 'dd MMM yyyy');
				var nowFormat = dateFilter(now, 'dd MMM yyyy');

				var isToday = dFormat == nowFormat;

				if (isToday) {
					return "Today";
				} else {
					return dateFilter(d, "MMM d");
				}
			};
		}
	]);

	ldFilters.filter('parseTweet', ['$filter',
		function() {
			return function(tweet) {
				var e = tweet.entities;
				var urls = e.urls;
				var users = e.user_mentions;
				var hashtags = e.hashtags;
				var media = e.media;
				var t = tweet.text;
				var newt = t;
				
				var replaceStrings = function( items ) {
					if ( items ) 
					{
						var l = items.length;

						for (var i = 0; i < l; i++ ) {
							var item = items[i];
							var string = t.substring(item.indices[0], item.indices[1]);
							var repl = '';

							if ( items == urls ) {
								repl = '<a class="external_url" target="_blank" href="' + item.url + '">' + item.display_url + '</a>';
							} else if ( items == users ) {
								repl = '<a class="user" href="/#/user/' + item.id + '">@' + item.screen_name + "</a>";
							} else if ( items == hashtags ) {
								repl = '<span class="hashtag">#' + item.text + '</span>';
							} else if ( items == media ) {
								return;
							}

							newt = newt.replace(string, repl);
						}
					}
				};

				replaceStrings( urls );
				replaceStrings( users );
				replaceStrings( hashtags );

				return newt;
			}
		}
	]);


})();


// https://twitter.com/jmspool/status/507304729157042177