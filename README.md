# MathEditor
For [Moodle](https://moodle.org) and [TinyMCE](http://www.tinymce.com/)

![MathEditor](/image1.jpg "MathEditor")

### Prerequisites:

NodeJS and Node Package Manager, follow instructions stated here:

* https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#ubuntu-mint

**NOTE:** The Ubuntu repositories do not have the latest version of node, using `sudo apt-get` to retrieve these dependencies will not work!

Moodle 2.5+
* https://moodle.org

### Installation Instructions (FOR DEVELOPMENT):

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

### Installation Instructions (FOR DEPLOYMENT):

1. Clone the repository (preferably somewhere outside your moodle installation)
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
7. Deploy the project
    `make deploy`
8. A zip file called `matheditor.zip` is created and is ready for distribution
9. To install this file, upload the zip file in your Moodle plugin installation page as a **TinyMCE Plugin Type**
    `http://moodle_root/admin/tool/installaddon/index.php`

### MathQuill

The MathQuill (http://mathquill.com/) library was forked as part of this plugin to add some extra functionality.
The forked repository can be found at https://github.com/raywainman/mathquill.

A summary of the changes can be seen by visiting the latest commits on the forked project or the list below:
* Added a few new bracket types, including angle brackets, ceiling and floor
* Added vector and hat notatoin (thanks to https://github.com/mathquill/mathquill/pull/185)
* Added support for matrices (including being able to parse and render them from LaTeX code)

### Development Notes

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
