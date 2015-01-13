<?php

/**
 * @file
 * A single location to store configuration.
 */

$host = $_SERVER['HTTP_HOST'];

define('CONSUMER_KEY', 'UhQ5KAkrlaUayWLGKnQTVqfYK');
define('CONSUMER_SECRET', 'zq6Pr3omAWdSINbq8rwyIyVD5pHe1fIyY954YZYTkBBGMeU4bb');

define('OAUTH_CALLBACK', 'https://' . $host . '/connect/auth_user.php');

//if ($host == 'twd.local:8890')