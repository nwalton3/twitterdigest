(function(){

	'use strict';


	/* Animations */

	var myModule = angular.module('listDigest.animations', ['ngAnimate']);

	myModule.animation('.animate-repeat',
		['$timeout', function($timeout) {
	 
		var queue = { enter : [], leave : [] };
		function queueAllAnimations(event, element, done, onComplete) {
			var index = queue[event].length;
			queue[event].push({
				element : element,
				done : done
			});
			queue[event].timer && $timeout.cancel(queue[event].timer);
			queue[event].timer = $timeout(function() {
				var elms = [], doneFns = [];
				angular.forEach(queue[event], function(item) {
					item && elms.push(item.element);
					doneFns.push(item.done);
				});
				var onDone = function() {
					angular.forEach(doneFns, function(fn) {
						fn();
					});
				};
				onComplete(elms, onDone);
				queue[event] = [];
			}, 10, false);

			return function() {
				queue[event] = [];
			}
		};

		return {
			enter : function(element, done) {
				element.css('opacity', 0)
				var cancel = queueAllAnimations('enter',
					element, done, function(elements, done) {
				
					TweenMax.allTo(elements, 0.2, { opacity : 1, right: 0 }, 0.1, done);
				});
				return function onClose(cancelled) {
					cancelled && cancel();
				};
			},
			move : function(element, done) {
				element.css('opacity', 0)
				var cancel = queueAllAnimations('move',
					element, done, function(elements, done) {
				
					TweenMax.allTo(elements, 1, { opacity : 1 }, 0.2, done);
				});
				return function onClose(cancelled) {
					cancelled && cancel();
				};
			},
			leave : function(element, done) {
				var cancel = queueAllAnimations('leave',
					element, done, function(elements, done) {

					TweenMax.allTo(elements, 1, { opacity : 0 }, 0.2, done);
				});
				return function onClose(cancelled) {
					cancelled && cancel();
				};
			}
		}
	}]);


})();