<?php
/**
 * Plugin Name: Map OSM
 * Description: Description of the Map OSM.
 * Version: 1.0.0
 * Author: bPlugins LLC
 * Author URI: http://bplugins.com
 * License: GPLv3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.txt
 * Text Domain: map-osm
 */

// ABS PATH
if ( !defined( 'ABSPATH' ) ) { exit; }

// Constant
define( 'MOSM_VERSION', isset( $_SERVER['HTTP_HOST'] ) && 'localhost' === $_SERVER['HTTP_HOST'] ? time() : '1.0.0' );
define( 'MOSM_DIR_URL', plugin_dir_url( __FILE__ ) );
define( 'MOSM_DIR_PATH', plugin_dir_path( __FILE__ ) );



require_once MOSM_DIR_PATH . 'inc/block.php';