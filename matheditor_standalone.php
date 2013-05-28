<?php

/**
 * *************************************************************************
 * *                               MathEditor                             **
 * *************************************************************************
 * @package     tinymce                                                   **
 * @subpackage  matheditor                                                **
 * @name        MathEditor                                                **
 * @copyright   oohoo.biz                                                 **
 * @link        http://oohoo.biz                                          **
 * @author      Raymond Wainman (wainman@ualberta.ca)                     **
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later  **
 * *************************************************************************
 * ************************************************************************ */

define('NO_MOODLE_COOKIES', true); // Session not used here.

require(dirname(dirname(dirname(dirname(dirname(dirname(__FILE__)))))) . '/config.php');

$PAGE->set_context(context_system::instance());
$PAGE->set_url('/lib/editor/tinymce/plugins/matheditor/matheditor_standalone.php');
$PAGE->requires->jquery(); // TODO: Get this working

$editor = get_texteditor('tinymce');
$plugin = $editor->get_plugin('matheditor');

$editor = get_texteditor('tinymce');
$htmllang = get_html_lang();

header('Content-Type: text/html; charset=utf-8');
header('X-UA-Compatible: IE=edge');
?>
<!DOCTYPE html>
<html <?php echo $htmllang ?>
<head>
    <title><?php print_string('matheditor:desc', 'tinymce_matheditor'); ?></title>
    <?php //TODO: Do this in a better way, figure out how to utilize the $PAGE global to retrieve the dependency ?>
    <script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="<?php echo $plugin->get_tinymce_file_url('js/mathquill.min.js'); ?>"></script>
    <link rel="stylesheet" type="text/css" href="<?php echo $plugin->get_tinymce_file_url('css/mathquill.css'); ?>">
    <link rel="stylesheet" type="text/css" href="<?php echo $plugin->get_tinymce_file_url('css/matheditor.css'); ?>">
    <script type="text/javascript" src="<?php echo $plugin->get_tinymce_file_url('js/matheditor.js'); ?>"></script>
    <script type="text/javascript" src="all_strings.php"></script>
</head>
<body>
    <div id="editor">
    </div>
    <script type="text/javascript">
    (function() {
        var langHandler = {
            getLang: function(id) {
                id = id.split('.')[1];
                var value = mathEditor_allStrings[id];
                // See all_strings.php
                if(value) {
                    return value;
                } else {
                    return '{' + id + '}'
                }
            }
        };

        var editor = new MathEditor('#editor', langHandler, undefined);
    })();
    </script>
</body>
</html>