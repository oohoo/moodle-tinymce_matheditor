<?php

/**
 * *************************************************************************
 * *                               MathEditor                             **
 * *************************************************************************
 * @package     tinymce                                                   **
 * @subpackage  matheditor                                                **
 * @name        MathEditor                                                **
 * @copyright   oohoo.biz, 2009 Petr Skoda (http://skodak.org)            **
 * @link        http://oohoo.biz                                          **
 * @author      Raymond Wainman (wainman@ualberta.ca), Petr Skoda         **
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later  **
 * *************************************************************************
 * ************************************************************************ */

/**
 * On-the-fly conversion of Moodle lang strings to TinyMCE expected JS format.
 *
 * @copyright  2009 Petr Skoda (http://skodak.org)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('NO_MOODLE_COOKIES', true);
define('NO_UPGRADE_CHECK', true);

require('../../../../../config.php');
require_once("$CFG->dirroot/lib/jslib.php");
require_once("$CFG->dirroot/lib/configonlylib.php");

$lang  = optional_param('elanguage', 'en', PARAM_SAFEDIR);
$rev   = optional_param('rev', -1, PARAM_INT);

$PAGE->set_context(context_system::instance());
$PAGE->set_url('/lib/editor/tinymce/plugins/matheditor/strings.php');

if (!get_string_manager()->translation_exists($lang, false)) {
    $lang = 'en';
    $rev = -1; // Do not cache missing langs.
}

$candidate = "$CFG->cachedir/tinymce_matheditor/$rev/$lang.js";
$etag = sha1("$lang/$rev");

if ($rev > -1 and file_exists($candidate)) {
    if (!empty($_SERVER['HTTP_IF_NONE_MATCH']) || !empty($_SERVER['HTTP_IF_MODIFIED_SINCE'])) {
        // we do not actually need to verify the etag value because our files
        // never change in cache because we increment the rev parameter
        js_send_unmodified(filemtime($candidate), $etag);
    }
    js_send_cached($candidate, $etag, 'all_strings.php');
}

$string = get_string_manager()->load_component_strings('tinymce_matheditor', $lang);

// Process the $strings to match expected tinymce lang array structure.
$result = array();

foreach ($string as $key=>$value) {
    $parts = explode(':', $key);
    if (count($parts) != 2) {
        // Ignore non-TinyMCE strings.
        continue;
    }

    $result[$parts[1]] = $value;
}

$output = 'var mathEditor_allStrings = '.json_encode($result).';';

if ($rev > -1) {
    js_write_cache_file_content($candidate, $output);
    // verify nothing failed in cache file creation
    clearstatcache();
    if (file_exists($candidate)) {
        js_send_cached($candidate, $etag, 'all_strings.php');
    }
}

js_send_uncached($output, 'all_strings.php');
