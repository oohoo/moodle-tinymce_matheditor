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
$PAGE->set_url('/lib/editor/tinymce/plugins/matheditor/matheditor.php');
$PAGE->requires->jquery();
$PAGE->set_title(get_string('matheditor:desc', 'tinymce_matheditor'));
$PAGE->set_pagelayout('popup');

$editor = get_texteditor('tinymce');
$plugin = $editor->get_plugin('matheditor');

$PAGE->requires->js(new moodle_url($editor->get_tinymce_base_url().'/tiny_mce_popup.js'));
$PAGE->requires->js(new moodle_url($plugin->get_tinymce_file_url('js/mathquill.min.js')));

$PAGE->requires->css(new moodle_url($plugin->get_tinymce_file_url('css/mathquill.css')));
$PAGE->requires->css(new moodle_url($plugin->get_tinymce_file_url('css/matheditor.css')));
$PAGE->requires->css(new moodle_url($plugin->get_tinymce_file_url('css/matheditor_tinymce.css')));

$PAGE->requires->js(new moodle_url($plugin->get_tinymce_file_url('js/matheditor.js')));
$PAGE->requires->js(new moodle_url('/filter/mathjax/vendor/mathjax/MathJax.js', array(
    'config' => 'TeX-AMS-MML_HTMLorMML',
    'delayStartupUntil' => 'onload',
    'showProcessingMessages' => 'false',
    'messageStyle' => 'none'
)));
echo $OUTPUT->header();

?>
<div id="editor">
</div>
<script type="text/javascript">
(function() {
    $(document).ready(function() {
        var tinyMceEditor = tinymce.activeEditor;

        // Callback function when the user clicks the insert button
        var insertHandler = function(latex) {
            tinyMceEditor.execCommand('mathEditorInsert', latex);
            tinyMCEPopup.close();
        };

        var editor = new MathEditor('#editor', tinyMceEditor, insertHandler);
        var latex = tinyMCEPopup.getWindowArg('latex');
        editor.setLatex(latex);

        console.log(MathJax);
    });
})();
</script>
<?php
echo $OUTPUT->footer();
?>
