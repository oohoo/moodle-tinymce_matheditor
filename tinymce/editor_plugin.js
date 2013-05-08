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

(function() {
    tinymce.create('tinymce.plugins.MathEditorPlugin', {

        /**
         * Initializes the plugin. Called after the plugin is created. All
         * editor related tasks need to be done here.
         *
         * @param {tinymce.Editor} editor Editor instance
         * @param {string} url Absolute URL of the plugin location
         */
        init : function(editor, url) {
            lang = tinymce.activeEditor.getParam('language');

            // Event handler for the dialog box opening action
            editor.addCommand('mceMathEditor', function() {
                editor.windowManager.open({
                    file : editor.getParam("moodle_plugin_base") + 'matheditor/matheditor.php?lang=' + lang,
                    width : 540,
                    height : 380,
                    inline : 1
                }, {
                    plugin_url : url, // Plugin absolute URL
                });
            });

            // Register the button with the editor, the location of the button
            // can be set in the Moodle TinyMCE general settings page. By
            // default it is hidden.
            editor.addButton('matheditor', {
                title : 'matheditor.description',
                cmd : 'mceMathEditor',
                image : url + '/img/icon.gif'
            });
        },

        /**
         * Returns information about the plugin as a name/value array.
         *
         * @return {Object} Name/value array containing information about the plugin
         */
        getInfo : function() {
            return {
                longname : 'Moodle Math Editor plugin',
                author : 'Raymond Wainman (wainman@ualberta.ca)',
                authorurl : 'http://oohoo.biz',
                infourl : 'http://oohoo.biz',
                version : '1.0'
            };
        }
    });

    tinymce.PluginManager.add('matheditor', tinymce.plugins.MathEditorPlugin);
})();