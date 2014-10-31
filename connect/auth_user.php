<?php
/* 
 * Signin.php
 */


/* Testing */
// ini_set('display_errors', 'On');
// error_reporting(E_ALL | E_STRICT);



/* Load required lib files and make sure there's a session going. */
session_start();
require_once('twitteroauth/twitteroauth/twitteroauth.php');
require_once('twitteroauth/config.php');


// If the redirect header is set to false, stay here and execute. Otherwise, go back to the home page. */
$redirect = isset( $_GET['redirect'] )  ?  $_GET['redirect']  :  false;

if( $redirect ) {
	header('location: /');
}


// Get params from request 
$path = isset( $_GET['path'] )  ?  $_GET['path']  :  false;
$q =    isset( $_GET['q'] )     ?  $_GET['q']     :  false;
$id =   isset( $_GET['id'] )    ?  $_GET['id']    :  false;
$post = isset( $_GET['post'] )  ?  $_GET['post']  :  false;


if ( !$path ) {
	$path = isset( $_POST['path'] )  ?  $_POST['path']  :  false;
	$q =    isset( $_POST['q'] )     ?  $_POST['q']     :  false;
	$id =   isset( $_POST['id'] )    ?  $_POST['id']    :  false;
	$post = isset( $_POST['post'] )  ?  $_POST['post']  :  false;
}



/* Execute request */
if ( $path !== false )
{
	// Return the result
	$result = request( $path, $q, $id, $post );
	print $result;
}
else if ( $_GET['signout'] ) {
	/* Make sure session stuff is cleared out. */
	unset($_SESSION['access_token']);
	unset($_SESSION['oauth_token']);
	unset($_SESSION['oauth_token_secret']);
	unset($_SESSION['oauth_status']);

	header('location: /');
}
else 
{
	print '{"result":"error"}';
}




/* Func: TwitterSignIn
 * Desc: Check login status and query API
 * Args: none
 */
function request( $path, $q, $id, $post ) {

	/* If temporary access tokens are available, connect to Twitter. */
	if ( !empty($_SESSION['oauth_token']) && !empty($_SESSION['oauth_token_secret']) ) {
		connect( $path, $q, $id, $post );
		return;
	}

	/* If access tokens are not available, reset the session. */
	if ( empty($_SESSION['access_token']) || empty($_SESSION['access_token']['oauth_token']) || empty($_SESSION['access_token']['oauth_token_secret']) ) {
	    clearSessionVars( $path, $q, $id, $post );
	    return;
	}

	/* Get user access tokens out of the session. */
	$access_token = $_SESSION['access_token'];

	/* Create a TwitterOauth object with consumer/user tokens. */
	$connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, $access_token['oauth_token'], $access_token['oauth_token_secret']);
	$connection->useragent = 'Twitter List Digest v0.1';
	$connection->decode_json = false;

	// Decode $path
	$path = urldecode( $path );



	/* Run the query */
	if ( $post ) {
		if ( $id ) {
			$paramArray = array("id" => $id);
			$query = $connection->post( $path, $paramArray );
		} else { 
			$query = $connection->post( $path );
		}
		

	} else {

		// Parse the parameters from $q into a PHP array
		$params = urldecode( $q );
		parse_str( $params, $paramArray );

		$query = $connection->get( $path, $paramArray );

	}

	return $query;
}





/* Func: ClearSessionVars
 * Desc: Clear all of the request token session variables and get new request tokens.
 * Args: none
 */
function clearSessionVars( $path, $q, $id, $post ) {

	/* Make sure session stuff is cleared out. */
	unset($_SESSION['access_token']);
	unset($_SESSION['oauth_token']);
	unset($_SESSION['oauth_token_secret']);
	unset($_SESSION['oauth_status']);

	/* Build TwitterOAuth object with client credentials. */
	$connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET);
	$connection->useragent = 'Twitter List Digest v0.1';
	 
	/* Get temporary credentials. */
	$request_token = $connection->getRequestToken(OAUTH_CALLBACK . '?path=' . $path . '&q=' . $q . '&post=' . $post . '&redirect=true');

	/* Save temporary credentials to session. */
	$_SESSION['oauth_token'] = $token = $request_token['oauth_token'];
	$_SESSION['oauth_token_secret'] = $request_token['oauth_token_secret'];
	 
	/* If last connection failed don't display authorization link. */
	switch ($connection->http_code) {
	  case 200:
	    /* Build authorize URL and redirect user to Twitter. */
	    $url = $connection->getAuthorizeURL($token);
	    header('Location: ' . $url);
	    break;
	  default:
	    /* Show notification if something went wrong. */
	    echo 'Could not connect to Twitter.';
	}

}






/* Func: Connect
 * Desc: Use the temporary request tokens to connect to Twitter and get access tokens.
 * Args: none
 */
function connect( $path, $q, $id, $post ) {

	/* If we don't have the request from Twitter, get it. */
	if( !isset($_REQUEST['oauth_verifier']) ) {
		clearSessionVars( $path, $q, $id, $post );
	}


	/* If the oauth_token is old run the connection again. */
	if ( isset($_REQUEST['oauth_token']) && $_SESSION['oauth_token'] !== $_REQUEST['oauth_token'] ) {
	  $_SESSION['oauth_status'] = 'oldtoken';

	  clearSessionVars( $path, $q, $id, $post );
	  return;
	}


	/* Create TwitteroAuth object with app key/secret and token key/secret from default phase */
	$connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, $_SESSION['oauth_token'], $_SESSION['oauth_token_secret']);
	$connection->useragent = 'Twitter List Digest v0.1';

	/* Request access tokens from twitter */
	$access_token = $connection->getAccessToken($_REQUEST['oauth_verifier']);

	/* Save the access tokens. Normally these would be saved in a database for future use. */
	$_SESSION['access_token'] = $access_token;

	/* Remove no longer needed request tokens */
	unset($_SESSION['oauth_token']);
	unset($_SESSION['oauth_token_secret']);

	/* If HTTP response is 200 continue otherwise send to connect page to retry */
	if (200 == $connection->http_code) {

	  /* The user has been verified and the access tokens can be saved for future use */
	  $_SESSION['status'] = 'verified';
	  request( $path, $q, $id, $post );

	} else {

	  /* Save HTTP status for error dialog on connnect page.*/
	  clearSessionVars( $path, $q, $id, $post );
	  echo $connection->http_code;

	}

}





?>