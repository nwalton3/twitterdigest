<?php

/* 
 * auth.php
 * Author: Nate Walton
 * Credit: With much help from @lgladdy - https://gist.github.com/lgladdy/5141615
 * Twitter API 1.1
 */




// Get the config file
require_once('config.php');
define( API_BASE, 'https://api.twitter.com/' );
define( API_URL, API_BASE . '1.1/' );

// Make sure there's a session going
session_start();


print '{ "key": "' . get_api_access_token() . '"}';




/* Func: Request
 * Desc: Submit a request to the twitter API. Returns results of API query in JSON format.
 * Args: @path - String - The path within the twitter API (ex: 'lists/list.json')
 *		 @params - Named Array - Key/value pairs of GET parameters to pass to the API
 *					(ex: array('id' => '555555555') )
 */
function request( $path, $params ) {

	$token = $_SESSION['access_token'];
	$data = http_build_query( $params );
	 
	//Try a twitter API request now.
	$options = array(
		'http' => array(
			'method' => 'GET',
			'header' => 'Authorization: Bearer ' . $token,
			'user_agent' => 'Twitter List Digest v0.1'
		)
	);
	 
	$context = stream_context_create( $options );
	$json = file_get_contents( API_URL . $path . '?' . $data, false, $context );
	$result = json_decode( $json, true );
	 
	return $result;
}



/* Func: Get_api_access_token
 * Desc: Get the bearer token, from the session if possible, or from the request_bearer_token 
 *		 function. Sets the session variable for future calls if needed. Returns a string.
 * Args: none
 */
function get_api_access_token() {

	if ( empty($_SESSION['access_token']) )
	{
		$_SESSION['access_token'] = request_bearer_token();
	}
	return $_SESSION['access_token'];
}



/* Func: Request_bearer_token
 * Desc: Get the bearer token from the Twitter API based on the credentials in config.php. 
 * Args: none
 */
function request_bearer_token() {

	$key = urlencode( API_KEY );
	$secret = urlencode( API_SECRET );
	$bearer_token_creds = base64_encode( $key . ':' . $secret );

	//Get a bearer token.
	$opts = array(
		'http'=>array(
			'method' => 'POST',
			'header' => 'Authorization: Basic ' . $bearer_token_creds . "\r\n" .
						'Content-Type: application/x-www-form-urlencoded;charset=UTF-8',
			'user_agent' => 'Twitter List Digest v0.1',
			'content' => 'grant_type=client_credentials'
		)
	);

	$context = stream_context_create( $opts );
	$json = file_get_contents( API_BASE . 'oauth2/token', false, $context );

	$result = json_decode( $json, true );

	if ( !is_array($result) || !isset($result['token_type']) || !isset($result['access_token']) ) {
	  die( "Something went wrong. This isn't a valid array: " . $json) ;
	}

	if ( $result['token_type'] !== "bearer" ) {
	  die( "Invalid token type. Twitter says we need to make sure this is a bearer." );
	}


	//Set our bearer token. Now issued, this won't ever* change unless it's invalidated by a call to /oauth2/invalidate_token.
	//*probably - it's not documentated that it'll ever change.
	$bearer_token = $result['access_token'];

	return $bearer_token;
}




// END auth.php
?>