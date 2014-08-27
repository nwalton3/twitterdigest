<?php

	$key = 'UhQ5KAkrlaUayWLGKnQTVqfYK';
	$secret = 'zq6Pr3omAWdSINbq8rwyIyVD5pHe1fIyY954YZYTkBBGMeU4bb';

	$cleanKey = urlencode( $key );
	$cleanSecret = urlencode( $secret );

	$credentials = $cleanKey . ":" . $cleanSecret;


	$url = 'https://api.twitter.com/oauth2/token';
	$data = 'grant_type=client_credentials';

	// use key 'http' even if you send the request to https://...
	$options = array(
	    'http' => array(
	        'header'  => "Content-type: application/x-www-form-urlencoded;charset=UTF-8\r\nAuthorization: Basic " . $credentials,
	        'method'  => 'POST',
	        'content' => http_build_query($data),
	    ),
	);
	$context  = stream_context_create($options);
	$result = file_get_contents($url, false, $context);

	var_dump($result);

?>