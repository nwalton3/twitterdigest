/* App.js */

(function(){

	var app = angular.module('listDigest', [ ]);

	app.controller('ListDigestCtrl', function(){
		this.users = userList;
	});

	var userList = [
		{
			real_name: 'Nate Walton',
			screen_name: 'natewalton',
			show: true,
		},
		{
			real_name: 'Ethan Marcotte',
			screen_name: 'beep',
			show: false,
		},
	];

})();
