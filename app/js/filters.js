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


	ldFilters.filter('typogr', ['typogr',
		function( typogr ) {
			return typogr.typogrify( text );
		}
	]);


	ldFilters.filter('parseTweet', ['$filter', 'typogr',
		function( $filter, typogr ) {
			return function(tweet) {
				var e = tweet.entities;
				var urls = e.urls;
				var users = e.user_mentions;
				var hashtags = e.hashtags;
				var media = e.media;
				var rt = tweet.retweeted_status;
				var t = tweet.text;
				var newt = t;
				
				var replaceString = function(string, repl) {
					newt = newt.replace(string, repl);
				};

				var replaceEntities = function( items ) {
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
								repl = '<a class="user" href="/#/' + item.screen_name + '">@' + item.screen_name + "</a>";
								string = new RegExp( string + '\\b' );

							} else if ( items == hashtags ) {
								repl = '<a class="hashtag" target="_blank" href="https://twitter.com/hashtag/' + item.text + '?src=hash">#' + item.text + '</a>';
								string = new RegExp( string + '\\b' );

							} else if ( items == media && item.type == 'photo' ) {
								repl = '';
							}

							replaceString( string, repl );
						}
					}
				};

				// Get the full original tweet text from the retweet entity
				if ( rt ) {
					var rt_handle = t.match(/RT\s@[0-9a-zA-Z_-]*\:/g);
					newt = '<span class="rt">' + rt_handle + "</span> " + rt.text;
				}

				// Process all of the entities into better html
				replaceEntities( urls );
				replaceEntities( users );
				replaceEntities( hashtags );
				replaceEntities( media );
				replaceString(/^“/, '<span class="openingquote">“</span>');
				replaceString(/\s(https?\:\/\/\S*)/, ' <a target="blank" href="$1">$1</a>');


				return typogr.typogrify(newt);
			}
		}
	]);


})();


// https://twitter.com/jmspool/status/507304729157042177