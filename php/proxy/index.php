<?php
/**
 * fetch google font css
 * with spoofed user agent
 * to get differnt font formats
 */
header('Content-Type: text/css');
$query_base = 'https://fonts.googleapis.com/css2?family=';
$query_family = isset($_GET['family']) ? urlencode($_GET['family']) : '';
$query_display = isset($_GET['display']) ? '&display=' . urlencode($_GET['display']) : '';
$query_text = isset($_GET['text']) ? '&text=' . urlencode($_GET['text']) : '';


$query = '';
//if meta query
$query = isset( $_GET['meta']) ? 'https://fonts.google.com/metadata/fonts' : '' ;
$query = $query ? $query : $query_base . $query_family . $query_display . $query_text;

//echo $query;




/**
 * switch between user agents to request different formats
 * default format: woff2 - static fonts
 * if query contains ".." range delimiters use variable fonts agent
 */
$format = isset($_GET['format']) ? str_replace('truetype', 'ttf', $_GET['format']) : (strpos($query, '..' === false) ? 'woff2' : 'vf');

/**
 * set formats defaults
 * to prevent typo based cache files
 */
if( 
    strpos($format, 'vf') === false &&
    strpos($format, 'woff2') === false &&
    strpos($format, 'woff') === false &&
    strpos($format, 'ttf') === false &&
    strpos($format, 'svg') === false &&
    strpos($format, 'eot') === false){
    $format = 'woff2';
}

$query_format = '&format=' . $format;



// exit if no family specified
if ( 
    strpos($query, 'metadata') === false &&
    (strpos($query, '?family=') === false) || strpos($query, 'https://fonts.googleapis.com') === false) {
    //exit();
}


/**
 * agent list from:
 * https://github.com/majodev/google-webfonts-helper/blob/master/server/config.ts
 */

switch ($format) {
    case 'vf':
        $agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0";
        break;
    case 'woff2':
        $agent = "Mozilla/5.0 (Windows NT 6.3; rv:39.0) Gecko/20100101 Firefox/39.0";
        break;
    case 'woff':
        $agent = "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0";
        break;
    case 'ttf':
        $agent = "Mozilla/5.0 (Windows; U; Windows NT 6.0; sv-SE) AppleWebKit/525.27.1 (KHTML, like Gecko) Version/3.2.1 Safari/525.27.1";
        break;
    case 'svg':
        $agent = "Mozilla/4.0 (iPad; CPU OS 4_0_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/4.1 Mobile/9A405 Safari/7534.48.3";
        break;
    case 'eot':
        $agent = "Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)";
        break;
    default:
        $agent = "Mozilla/5.0 (Windows NT 6.3; rv:39.0) Gecko/20100101 Firefox/39.0";
        break;
}

/**
 * curl request
 * sending custom user agent
 */
$ch = curl_init();
curl_setopt($ch, CURLOPT_USERAGENT, $agent);
curl_setopt($ch, CURLOPT_URL, $query);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

if(curl_exec($ch) === false){
    echo 'Connection error: ' . curl_error($ch);
    exit();
}else{
    $output = curl_exec($ch);
}


/**
 * dont't return malformed queries
 * containing HTML error response
 */
if (strpos($output, '</') === false) {
    // output css
    echo $output;
    // create cache
    //file_put_contents($cache_file, $output);

} else {
    // error
    echo '/*** malformed query ***/';
}
curl_close($ch);
?>