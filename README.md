# MathEditor
For [Moodle](https://moodle.org) and [TinyMCE](http://www.tinymce.com/)

![MathEditor](https://github.com/oohoo/moodle-tinymce_matheditor/blob/master/image1.png?raw=true "MathEditor")

## Installation

1. Get the zip file `matheditor.zip` ([DOWNLOAD](http://dl.bintray.com/raywainman/generic/matheditor.zip?direct))
2. To install this file, upload the zip file in your Moodle plugin installation page as a **TinyMCE Plugin Type**
    `http://moodle_root/admin/tool/installaddon/index.php`
3. Navigate to the TinyMCE options within moodle (Site Administration->Plugins->Text Editors->
   TinyMCE HTML Editor->General Settings)
   `http://moodle_root/admin/settings.php?section=editorsettingstinymce`
4. Ensure the MathEditor Plugin is enabled
5. Add the MathEditor button to the editor by pasting the `matheditor` keyword within the "Editor Toolbar"
   field. Ensure buttons are separated by commas and groups separated by `|`s.
6. The MathEditor button should now have appeared within the editor and is ready to use.

#### Customisation

To define your own LaTeX rendering server (used to render the equation preview image within the TinyMCE editor
itself) go to the Moodle settings page for TinyMCE and in the `Custom Configuration` field, add the following
JSON code: `{"matheditor_latexserver" : "<your server>"}`.

#### Works best when paired with the [Moodle MathJax Filter](https://github.com/oohoo/moodle-filter_mathjax)

## Development

### Prerequisites:

NodeJS and Node Package Manager, follow instructions stated here:

* https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#ubuntu-mint

**NOTE:** The Ubuntu repositories do not have the latest version of node, using `sudo apt-get` to retrieve these dependencies will not work!

Moodle 2.5+ (probably works in lower versions too, no testing has been done)
* https://moodle.org

### Development Instructions:

1. Clone the repository into the `moodle_root/lib/editors/tinymce/plugins/matheditor` folder
2. Within the main repository directory, fetch the submodule
   `git submodule init`
3. Update the submodule
   `git submodule update`
4. `cd` into the MathQuill directory
   `cd vendor/mathquill_custom`
5. Update the dependencies within the submodule
   `npm install`
6. Navigate back up to the project root
   `cd ../../`
7. Build the project
   `make`
8. Install the plugin within your Moodle installation, to do so visit the administrator's notification page
   `http://moodle_root/admin/index.php`
9. Navigate to the TinyMCE options within moodle (Site Administration->Plugins->Text Editors->
   TinyMCE HTML Editor->General Settings)
   `http://moodle_root/admin/settings.php?section=editorsettingstinymce`
10. Ensure the MathEditor Plugin is enabled
11. Add the MathEditor button to the editor by pasting the `matheditor` keyword within the "Editor Toolbar"
   field. Ensure buttons are separated by commas and groups separated by `|`s.
12. The MathEditor button should now have appeared within the editor and is ready to use.
13. **To Deploy**:
    `make deploy` and a zip file called `matheditor.zip` is created and ready for distribution

### MathQuill

The MathQuill (http://mathquill.com/) library was forked as part of this plugin to add some extra functionality.
The forked repository can be found at https://github.com/raywainman/mathquill.

A summary of the changes can be seen by visiting the latest commits on the forked project or the list below:
* Added a few new bracket types, including angle brackets, ceiling and floor
* Added vector and hat notatoin (thanks to https://github.com/mathquill/mathquill/pull/185)
* Added support for matrices (including being able to parse and render them from LaTeX code)

### Notes

* At this point in time, once a user is finished writing an equation, the LaTeX code is passed to TinyMCE and then
converted to an image to be rendered within the editor. This image holds the raw LaTeX within its `alt` tag. Upon
saving the contents of the editor, the image is converted to a simple `span` element containing the LaTeX code
surrounded by double dollar signs `$$ LaTeX Here $$` to be recognized by the Moodle MathJax filter
(see https://github.com/oohoo/moodle-filter_mathjax). Upon re-editing the contents, the TinyMCE pre-processor will
detect this `span` and reconvert it to an image. This ensures that no LaTeX code is actually ever exposed to the user.
For more details on how this is done, see the `editor_plugin.js` file.

### References

Another TinyMCE plugin which uses MathQuill:
* https://github.com/laughinghan/tinymce_mathquill_plugin

### Known Issues
* Equations cannot be edited once they have been inserted into the TinyMCE text area on mobile devices. Unfortunately
as far as I know, this is not something that can be fixed. Other plugins also have this same problem (images, links).
