The icons were created using Inkscape (http://inkscape.org/)

All the icons use the Symbola TTF Font. This font is located within the vendor/src/font folder. Install it on your system before
making any edits to the svg file.

To add a new icon:
====================
* Ensure Symbola font is installed *
1. Open the icons.svg file in Inkscape
2. Find an empty square for your icon. If there are none follow the following:
    a. Turn on guides, grid and snap (in the view menu)
    b. Drag new guide lines by clicking and dragging from the ruler
    c. Stretch the background square over the new section (the lime green square)
    d. Turn off snap
3. Create your icon
4. Set the opacity of the green background square to 0%
5. Click the "select all visible objects" button (Ctrl-Shift-A)
6. File->Export Bitmap
7. Replace the old icons.png file in the tinymce/img folder
8. Reset the opacity of the background square to a value other than 0%

Notes:
====================
- Each row is 25px
- The first 5 columns are 25px wide each
- The 6th column is 30px wide
- The 7th column is 50px wide

From these figures it is easy to determine the coordinate of the icon when used in the matheditor.js file.
