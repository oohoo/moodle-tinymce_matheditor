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
            if(editor.getParam('matheditor_latexserver'))
                var latexRenderer = editor.getParam('tinymce_matheditor/latexserver');
            else
                var latexRenderer = 'http://www.tabuleiro.com/cgi-bin/mathtex.cgi?';

            var imageUrl = function(latex) {
                return '<img class="matheditor" '
                + 'style="vertical-align:middle" '
                + 'src="' + latexRenderer + latex + '" '
                + 'alt="' + latex + '"/>';
            };

            // Recognize that a user has clicked on the image, and pop-up the mathquill dialog box
            var updateEventHandlers = function(editor) {
                // Initialize event-handlers for all math elements
                Y.one(editor.getDoc()).all('.matheditor').on('click', function(e) {
                    var latex = e.target.getAttribute('alt');
                    editor.execCommand('mceMathEditor', latex);
                });
            };

            // Event handler for the dialog box opening action
            editor.addCommand('mceMathEditor', function(latex) {
                editor.windowManager.open({
                    file : editor.getParam("moodle_plugin_base") + 'matheditor/matheditor.php?lang=' + lang,
                    width : 540,
                    height : 307,
                    inline : 1,
                    popup_css : false
                }, {
                    plugin_url : url, // Plugin absolute URL
                    latex : latex
                });
            });

            // Register the button with the editor, the location of the button
            // can be set in the Moodle TinyMCE general settings page. By
            // default it is hidden.
            editor.addButton('matheditor', {
                title : 'matheditor:description',
                cmd : 'mceMathEditor',
                image : url + '/img/icon.png'
            });

            // Generate an image from the supplied latex and insert it into the tinyMCE document
            editor.addCommand('mathEditorInsert', function(latex) {
                if (!latex) return;
                var content = imageUrl(latex);
                var selection = Y.one(editor.selection.getNode());
                if(selection.hasClass('matheditor')) {
                    selection.remove();
                }

                //var content = '<div class="matheditor">$$' + latex + '$$</div>';
                editor.selection.setContent(content);
                updateEventHandlers(editor);
            });

            // Replace LaTeX code with an image on editor load
            var convertLatexToImage = function(editor, o) {
                var equations = editor.dom.select('span.matheditor', o.node);
                for(var i = 0; i < equations.length; i++) {
                    var equation = Y.one(equations[i]);
                    var latex = equation.getHTML().replace(/\\\(|\\\)/g, '');
                    equation.replace(imageUrl(latex));
                }
            };
            editor.onLoadContent.add(convertLatexToImage);
            editor.onSetContent.add(convertLatexToImage);

            // Use mathquill-rendered-latex when getting the contents of the document
            editor.onPreProcess.add(function(ed, o) {
                if (o.get) {
                    var equations = ed.dom.select('.matheditor', o.node);
                    for(var i = 0; i < equations.length; i++) {
                        var equation = Y.one(equations[i]);
                        var latex = equation.getAttribute('alt');
                        var content = '<span class="matheditor">\\(' + latex + '\\)</span>';
                        equation.replace(content);
                    }
                }
            });

            editor.onInit.add(function() {
                updateEventHandlers(editor);
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