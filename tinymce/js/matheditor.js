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

/**
 * Useful MathQuill API documentation: https://github.com/mathquill/mathquill
 */

/**
 * Constructor for the {@code MathEditor} widget.
 *
 * @param container the container identifier, will append the widget into this container
 * @param editor the active editor object, this object must implement the {@code getLang(ident)}
 *          method which simply retrieves a localized string
 * @param insertHander a callback which accepts one argument that is the value to be inserted, that
 *          is {@code function(latex) { do something with returned value }}, this function is
 *          triggered when the user clicks the insert button, if this is {@code undefined} then the
 *          insert button is NOT shown, in which case one can access the user input via the
 *          {@code Matheditor.prototype.getLatex()} method
 * @param buttonList a list of the buttons to show within the editor, this is simply a comma
 *          delimited list of button identifiers (see the content[] array defined at the bottom of
 *          this file for all the button names), a simple example would be "alpha,plus,cos"
*/
MathEditor = function(container, editor, insertHandler, buttonList) {
    this.top_container = $(container);
    this.editor = editor;
    this.insertHandler = insertHandler;
    if(buttonList) {
        this.setButtonList(buttonList, false);
    }
    this.content = this.getContent_();
    this.colours = this.getColours_();
    this.decorate_();
};

/**
 * Constructor for the {@code Button} object which are used as different mathematical operators
 * to be inserted into the equation.
 *
 * @param name the name of the button, shown in the form of a tooltip
 * @param latex the latex command corresponding to the button
 * @param xcoord the x position of the top-left corner of the icon within the sprite file
 * @param ycoord the y position of the top-left corner of the icon within the sprite file
 * @param width the width of the icon (by default it is 25)
 * @param height the height of the icon (by default it is 25)
 */
 MathEditor.Button = function(name, latex, xcoord, ycoord, width, height) {
    this.name = name;
    this.latex = latex;
    this.xcoord = xcoord;
    this.ycoord = ycoord;
    if(width) {
        this.width = width;
    } else {
        this.width = 25;
    }
    if(height) {
        this.height = height;
    } else {
        this.height = 25;
    }
};

/**
 * Factory method to create a generic button with a LaTeX command. Will simply use the
 * {@code mathquill('write', latex)} API call to MathQuill when inserting the value in the
 * equation.
 *
 * @param name the name of the button, shown in the form of a tooltip
 * @param latex the latex command corresponding to the button
 * @param xcoord the x position of the top-left corner of the icon within the sprite file
 * @param ycoord the y position of the top-left corner of the icon within the sprite file
 * @param width the width of the icon (by default it is 25)
 * @param height the height of the icon (by default it is 25)
 */
 MathEditor.B = function(name, latex, xcoord, ycoord, width, height) {
    return new MathEditor.Button(name, latex, xcoord, ycoord, width, height);
};

/**
 * Factory method to create a generic button that will prompt the user to specify a matrix size
 * first before making a call to the MathQuill API.
 *
 * @param name the name of the button, shown in the form of a tooltip
 * @param prepend the latex command prepend, this will usually be something like '\\left('
 * @param postpend the latex command postpend, this will usually be something like '\\right)'
 * @param xcoord the x position of the top-left corner of the icon within the sprite file
 * @param ycoord the y position of the top-left corner of the icon within the sprite file
 * @param width the width of the icon (by default it is 25)
 * @param height the height of the icon (by default it is 25)
*/
MathEditor.BM = function(name, prepend, postpend, xcoord, ycoord, width, height) {
    var button = new MathEditor.Button(name, null, xcoord, ycoord, width, height);
    button.matrix = true;
    button.prepend = prepend;
    button.postpend = postpend;
    return button;
};

/**
 * Constructor for the {@code Tab} object. This is simply a grouping of buttons that correspond to
 * a particular category and consequently a tab in the widget.
 *
 * @param name the name of the tab, shown at the top of the widget
 * @param buttons the set of buttons corresponding to this tab
 */
 MathEditor.Tab = function(name, buttons) {
    this.name = name;
    this.buttons = buttons;
};

/**
 * Convenience factory method for the {@code Tab} object.
 *
 * @param name the name of the tab, shown at the top of the widget
 * @param buttons the set of buttons corresponding to this tab
 */
 MathEditor.T = function(name, buttons) {
    return new MathEditor.Tab(name, buttons);
};

/**
 * Sentinel object to indicate a new line within the editor tab.
 */
 MathEditor.Break = function() {
    // Empty
};

MathEditor.Colour = function(name, colour) {
    this.name = name;
    this.colour = colour;
};

MathEditor.C = function(name, colour) {
    return new MathEditor.Colour(name, colour);
};

/**
 * Decorates the specified container with the widget. Generates all of the DOM nodes and appends
 * them to this container.
 *
 * @private
 */
 MathEditor.prototype.decorate_ = function() {
    this.container = $('<div class="matheditor-container"></div>')
    .appendTo(this.top_container);

    this.generateTabs_();
    this.generatePanes_();
    this.generateMatrixInput_();

    // Equation field
    this.equation = $('<div class="matheditor-equation"></span>')
    .appendTo(this.container);
    this.equation.mathquill('editable');

    // Latex Field
    this.latex = $('<textarea class="matheditor-latex"></textarea>')
    .appendTo(this.container);
    this.latex.css('visibility', 'hidden');
    this.generateLatexButton_();

    this.bindEvents_();
};

/**
 * Removes the editor from the specified container (given in the constructor).
 *
 * @private
 */
 MathEditor.prototype.undecorate_ = function() {
    this.top_container.empty();
};

/**
 * Generates the top category tabs across the top of the widget.
 *
 * @private
 */
 MathEditor.prototype.generateTabs_ = function() {
    var self = this;
    var tabList = $('<div class="matheditor-tabs"><ul></ul></div>').appendTo(this.container);
    var paneContainer = $('<div class="matheditor-panes"></div>').appendTo(self.container);
    $(this.content).each(function(index, tab) {
        tab.dom = $('<li>' + self.editor.getLang(tab.name) + '</li>').appendTo(tabList);
        tab.pane = $('<div class="matheditor-pane"></div>').appendTo(paneContainer);
        tab.pane.hide();
    });
    if(!self.buttonMap) {
        this.generateSideBar_(paneContainer);
    }
    $('<div class="matheditor-clear"></div>').appendTo(paneContainer);
};

/**
 * Generates the panes for each category and the buttons within each.
 *
 * @private
 */
 MathEditor.prototype.generatePanes_ = function() {
    var self = this;
    $(this.content).each(function(index, tab) {
        var tabHasContent = false;
        $(tab.buttons).each(function(index, button) {
            // Filter out buttons that the user doesn't want
            if(self.buttonMap && !self.buttonMap[button.name] && tab.name !== 'matheditor.variables') {
                return;
            }
            if(button instanceof MathEditor.Break) {
                tab.pane.append('<br/>');
            } else {
                var classValue = '';
                if(!button.matrix) {
                    classValue = 'class="matheditor-pane-button"';
                }

                if(self.buttonMap && self.singleTab) {
                    var targetTab = self.content[self.content.length - 1].pane;
                } else {
                    tabHasContent = true;
                    var targetTab = tab.pane;
                }
                if(button.xcoord != null) {
                    button.dom = $('<button ' + classValue + ' style="background-position:-' +
                        button.xcoord + 'px -' + button.ycoord + 'px; width:' + (this.width+2) + 'px;' +
                        'height:' + (this.height+2) + 'px;" title="' + self.editor.getLang(button.name) +'"></button>').appendTo(targetTab);
                }
                //button.dom.html('\\(' + button.display + '\\)');
            }
        });
        if(!tabHasContent) {
            tab.dom.hide();
            tab.hasContent = false;
        } else {
            tab.hasContent = true;
        }
    });

    // Activate the first SHOWN tab
    var oneActive = false;
    $(this.content).each(function(index, tab) {
        if(tab.hasContent && !oneActive) {
            oneActive = true;
            tab.pane.css('display', 'inline-block');
            tab.dom.addClass('matheditor-tabs-active');
        }
    });
    if(this.buttonMap) {
        this.content[this.content.length - 1].pane.show();
        this.content[this.content.length - 1].dom.addClass('matheditor-tabs-active');
    }
};

MathEditor.prototype.generateSideBar_ = function(element) {
    var self = this;
    var sidebar = $('<div class="matheditor-sidebar"></div>').appendTo(element);
    this.colourDropdown = $('<button><div class="matheditor-colour matheditor-colour-black" '
        + 'title="' + self.editor.getLang('matheditor.font_color') + '"></div></button>')
    .appendTo(sidebar);
    this.generateColourPicker_(sidebar);
    this.bold = $('<button class="matheditor-bold" title="' + self.editor.getLang('matheditor.bold')
        + '">B</button>').appendTo(sidebar);
    this.italic = $('<button class="matheditor-italic" title="' + self.editor.getLang('matheditor.italic')
        + '">I</button>')
    .appendTo(sidebar);
};

MathEditor.prototype.generateColourPicker_ = function(element) {
    var self = this;
    this.colourPicker = $('<div class="matheditor-form"></div>').appendTo(element);
    $(this.colours).each(function(index, colour) {
        colour.dom = $('<div class="matheditor-colour matheditor-colour-' + colour.colour + '" '
            + 'title="' + self.editor.getLang(colour.name) + '"></div>')
        .appendTo(self.colourPicker);
    });
    this.colourPicker.hide();
};

/**
 * Generates the matrix parameter input form (rows and columns prompt).
 *
 * @private
 */
 MathEditor.prototype.generateMatrixInput_ = function() {
    this.form = $('<div class="matheditor-form"></div>').appendTo(this.container);
    this.form.append('Rows: ');
    this.form.rows = $('<input type="number" min="1" class="matheditor-form-number" value="1">')
    .appendTo(this.form);
    this.form.append('<br/>Columns: ');
    this.form.cols = $('<input type="number" min="1" class="matheditor-form-number" value="1">')
    .appendTo(this.form);
    this.form.append('<br/>');
    this.form.button = $('<button>' + this.editor.getLang('matheditor.create') + '</button>')
    .appendTo(this.form);
    this.form.hide();
};

/**
 * Generates the LaTeX toggle button in the bottom right of the widget, this button is used to
 * toggle the LaTeX text box.
 *
 * @private
 */
 MathEditor.prototype.generateLatexButton_ = function() {
    var footerDiv = $('<div class="matheditor-buttons"></div>').appendTo(this.container);
    this.latexButton = $('<div class="matheditor-buttons-latex">'
        + this.editor.getLang('matheditor.latex')
        + ' <input type="checkbox"></div>').appendTo(footerDiv);
    if(this.insertHandler) {
        this.insertButton = $('<div class="matheditor-buttons-insert">'
            + this.editor.getLang('matheditor.insert') + ' &#x25B6</div>')
        .appendTo(footerDiv);
    }
};

/**
 * Inserts a matrix into the equation, this is triggered after the user has entered the matrix
 * parameters.
 *
 * @private
 */
 MathEditor.prototype.insertMatrix_ = function() {
    var latex = this.activeMatrix.prepend;
    latex += '\\begin{matrix}';
    for(var row = 0; row < this.form.rows.val(); row++) {
        // There are column-1 ampersands (since it is a delimiter)
        for(var col = 0; col < this.form.cols.val() - 1; col++) {
            latex += '&';
        }
        // Same idea as the ampersand, the backslashes are only used as delimiters
        if(row != (this.form.rows.val() -1)) {
            latex += '\\\\';
        }
    }
    latex += '\\end{matrix}';
    latex += this.activeMatrix.postpend;
    this.equation.mathquill('write', latex);
    this.updateLatex_();
};

/**
 * Resets the Matrix size input form to the default 2x2 size.
 *
 * @private
 */
 MathEditor.prototype.matrixInputReset_ = function() {
    this.form.rows.val(2);
    this.form.cols.val(2);
};

/**
 * Binds all of the events for the widget.
 *
 * @private
 */
 MathEditor.prototype.bindEvents_ = function() {
    var self = this;
    // Matrix Input Form Events
    $('html').click(function() {
        self.form.hide();
        self.colourPicker.hide();
    });
    this.form.click(function(e) {
        e.stopPropagation();
    });
    this.form.button.click(function(e) {
        e.stopPropagation();
        self.form.hide();
        self.insertMatrix_();
        e.preventDefault();
    });

    // Tabs and button events
    $(this.content).each(function(index, tab) {
        tab.dom.mouseover(function() {
            self.hidePanes_();
            tab.dom.addClass('matheditor-tabs-active');
            tab.pane.css('display', 'inline-block');
        });
        $(tab.buttons).each(function(buttonIndex, button) {
            if(button instanceof MathEditor.Break) {
                return;
            }
            if(self.buttonMap && !self.buttonMap[button.name]
                && tab.name !== 'matheditor.variables') {
                return;
            }
            button.dom.click(function(e) {
                if (button.matrix) {
                    e.stopPropagation();
                    self.activeMatrix = button;
                    self.matrixInputReset_();
                    var offsetTop = e.pageY - self.container.offset().top;
                    var offsetLeft = e.pageX - self.container.offset().left;
                    self.form.css({
                        top: offsetTop + 15,
                        left: offsetLeft
                    });
                    self.form.toggle();
                } else {
                    if (button.cmd != null) {
                        self.equation.mathquill('cmd', button.cmd);
                    } else {
                        self.equation.mathquill('write', button.latex);
                    }
                    self.updateLatex_();
                }
                e.preventDefault();
            });
        });
    });

    // Equation box events
    this.equation.bind('input propertychange keyup', function() {
        self.updateLatex_();
    });

    // LaTeX text event
    this.latex.bind('input propertychange', function() {
        self.updateEquation_();
    });

    // LaTeX button events
    this.latexButton.click(function() {
        var checkbox = self.latexButton.find(':checkbox');
        if(self.latex.css('visibility') == 'visible') {
            self.latex.css('visibility', 'hidden');
            checkbox.prop('checked', false);
        } else {
            self.latex.css('visibility', 'visible');
            checkbox.prop('checked', true);
        }
    });

    // Insert TinyMCE content
    if(this.insertHandler) {
        this.insertButton.click(function() {
            self.insertHandler(self.latex.val());
        });
    }

    if(!this.buttonMap) {
        // Colour picker events
        this.colourDropdown.click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.colourPicker.toggle();
        });

        $(this.colours).each(function(index, colour) {
            colour.dom.click(function() {
                self.colourPicker.hide();
                self.equation.mathquill('color', colour.colour);
                self.updateLatex_();
            });
        });

        // Bold and Italic buttons
        this.bold.click(function() {
            self.equation.mathquill('bold');
            self.updateLatex_();
        });
        this.italic.click(function() {
            self.equation.mathquill('italic');
            self.updateLatex_();
        });
    }
};

/**
 * Refreshes the LaTeX textbox with the latest LaTeX code from the equation pane. Uses the
 * {@code mathquill('latex')} API call.
 *
 * @private
 */
 MathEditor.prototype.updateLatex_ = function() {
    var latex = this.equation.mathquill('latex');
    this.latex.val('');
    this.latex.val(latex);
    if(this.callback) {
        this.callback(latex);
    }
};

/**
 * Refreshes the MathQuill equation box with the latest LaTeX code from the LaTeX text box.
 *
 * @private
 */
 MathEditor.prototype.updateEquation_ = function() {
    var latex = this.latex.val();
    this.equation.mathquill('revert');
    this.equation.mathquill('editable');
    this.equation.mathquill('write', latex);
    if(this.callback) {
        this.callback(latex);
    }
};

/**
 * Hides all the button panes.
 *
 * @private
 */
 MathEditor.prototype.hidePanes_ = function() {
    $(this.content).each(function(index, tab) {
        tab.dom.removeClass('matheditor-tabs-active');
        tab.pane.hide();
    });
};

/**
 * Sets the active equation to the LaTeX value given.
 *
 * @param latex the equation latex string
 */
 MathEditor.prototype.setLatex = function(latex) {
    if(latex != '') {
        this.equation.mathquill('write', latex);
        this.updateLatex_();
    }
};

/**
 * Gets the LaTeX of the current user input equation.
 *
 * @return string the latex for the current equation
 */
 MathEditor.prototype.getLatex = function() {
    return this.latex.val();
};

/**
 * Set an onchange callback event which is fired every time the user modifies the equation.
 *
 * @param callback function with one argument which is the new latex code
 */
 MathEditor.prototype.onChange = function(callback) {
    this.callback = callback;
};

/**
 * Sets the buttons shown in the editor.
 *
 * @param buttonList a list of the buttons to show within the editor, this is simply a comma
 *          delimited list of button identifiers (see the content[] array defined at the bottom of
 *          this file for all the button names), a simple example would be "alpha,plus,cos"
 * @param redocorate the editor (true/false)
 * @param singleTab show all buttons in a single tab
 */
 MathEditor.prototype.setButtonList = function(buttonList, redecorate, singleTab) {
    this.singleTab = singleTab;
    buttonList = buttonList.split(',');
    // Only use single tab if there are less than 20 buttons
    if(buttonList.length > 20) {
        this.singleTab = false;
    }
    this.buttonMap = [];
    var buttonMap = this.buttonMap;
    $(buttonList).each(function(index, name) {
        buttonMap['matheditor.' + name.trim()] = true;
    });
    var singleTab = new MathEditor.T('asd', []);
    this.content.push(singleTab);
    if(redecorate) {
        var latex = this.getLatex();
        this.undecorate_();
        this.decorate_(); // Redraw the editor
        this.setLatex(latex);
    }
};

/**
 * Retrieves a comma delimited list of all the possible buttons that can appear within the editor.
 *
 * @returns a comma delimited list of button names
 */
 MathEditor.prototype.getButtonList = function() {
    var allButtons = [];
    $(this.content).each(function(tabIndex, tab) {
        $(tab.buttons).each(function(buttonIndex, button) {
            if(button instanceof MathEditor.Break) {
                return;
            }
            allButtons.push(button.name.substring(11));
        });
    });
    return allButtons.join(',');
};

/**
 * Adds a new tab labelled variables to the editor with the specified buttons.
 *
 * @param variables a 
 */
 MathEditor.prototype.setVariables = function(variables) {
    var variableTab = new MathEditor.T('matheditor.variables', []);
    $(variables).each(function() {
        variableTab.buttons.push(new MathEditor.B('', '\\(' + this + '\\)', this));
    });
    this.content.push(variableTab);
    var latex = this.getLatex();
    this.undecorate_();
    this.decorate_(); // Redraw the editor
    this.setLatex(latex);
};

/**
 * Generates all of the content for the math editor.
 *
 * @private
 */
 MathEditor.prototype.getContent_ = function() {
    return [
    MathEditor.T('matheditor.general', [
        MathEditor.B('matheditor.comma', ',', 0, 0),
        MathEditor.B('matheditor.bullet', '\\bullet', 25, 0),
        MathEditor.B('matheditor.plus_minus', '\\pm', 50, 0),
        MathEditor.B('matheditor.minus_plus', '\\mp', 75, 0),
        MathEditor.B('matheditor.equal', '=', 100, 0),
        MathEditor.B('matheditor.not_equal', '\\neq', 125, 0),
        MathEditor.B('matheditor.asymptotically_equal', '\\simeq', 150, 0),
        MathEditor.B('matheditor.approximately', '&#x223C', 175, 0),
        MathEditor.B('matheditor.subscript', '{\\placeholder}_{\\placeholder}', 0, 25),
        MathEditor.B('matheditor.subscript_left', '_{\\placeholder}{\\placeholder}', 25, 25),
        MathEditor.B('matheditor.superscript', '{\\placeholder}^{\\placeholder}', 50, 25),
        MathEditor.B('matheditor.superscript_left', '^{\\placeholder}{\\placeholder}', 75, 25),
        MathEditor.B('matheditor.subsuper_left', '^{\\placeholder}_{\\placeholder}{\\placeholder}', 100, 25),
        MathEditor.B('matheditor.subsuper', '{\\placeholder}^{\\placeholder}_{\\placeholder}', 125, 25),
        MathEditor.B('matheditor.fraction', '\\frac{}{}', 150, 25),
        MathEditor.B('matheditor.round_braces', '\\left( \\right)', 175, 25),
        MathEditor.B('matheditor.square_braces', '\\left[ \\right]', 0, 50),
        MathEditor.B('matheditor.absolute_braces', '\\left| \\right|', 25, 50),
        MathEditor.B('matheditor.curly_braces', '\\left\\{ \\right\\}', 50, 50),
        MathEditor.B('matheditor.angle_braces', '\\left\\langle \\right\\rangle', 75, 50),
        MathEditor.B('matheditor.vector', '\\vec{}', 100, 50),
        MathEditor.B('matheditor.hat', '\\hat{}', 125, 50),
        MathEditor.B('matheditor.overline', '\\overline{}', 150, 50),
        MathEditor.B('matheditor.bar', '\\bar{}', 175, 50),
        MathEditor.B('matheditor.log', '\\log', 0, 75),
        MathEditor.B('matheditor.logbase', '\\log_{}', 25, 75),
        MathEditor.B('matheditor.natural_log','\\ln', 50, 75),
        MathEditor.B('matheditor.exponential', 'e^{}', 75, 75),
        MathEditor.B('matheditor.sin', '\\sin', 100, 75),
        MathEditor.B('matheditor.cos', '\\cos', 125, 75),
        MathEditor.B('matheditor.tan', '\\tan', 150, 75),
        MathEditor.B('matheditor.sec', '\\sec', 175, 75),
        MathEditor.B('matheditor.csc', '\\csc', 0, 100),
        MathEditor.B('matheditor.cot', '\\cot', 25, 100),
        MathEditor.B('matheditor.sinh', '\\sinh', 200, 0, 30),
        MathEditor.B('matheditor.cosh', '\\cosh', 200, 25, 30),
        MathEditor.B('matheditor.tanh', '\\tanh', 200, 50, 30),
        MathEditor.B('matheditor.arcsin', '\\arcsin', 200, 75, 30),
        MathEditor.B('matheditor.arccos', '\\arccos', 200, 100, 30),
        MathEditor.B('matheditor.arctan', '\\arctan', 200, 125, 30)
        ]),
    MathEditor.T('matheditor.operators', [
        MathEditor.B('matheditor.plus', '+', 50, 100),
        MathEditor.B('matheditor.minus', '-', 75, 100),
        MathEditor.B('matheditor.times', '×', 100, 100),
        MathEditor.B('matheditor.division', '÷', 125, 100),
        MathEditor.B('matheditor.definition', '≔', 150, 100),
        MathEditor.B('matheditor.factorial', '!', 175, 100),
        MathEditor.B('matheditor.oplus', '\\oplus', 0, 125),
        MathEditor.B('matheditor.otimes', '\\otimes', 25, 125),
        MathEditor.B('matheditor.square_root', '\\sqrt{}', 50, 125),
        MathEditor.B('matheditor.square_root_power', '\\sqrt[{}]{}', 75, 125),
        MathEditor.B('matheditor.ceiling', '\\left\\lceil \\right\\rceil', 100, 125),
        MathEditor.B('matheditor.floor', '\\left\\lfloor \\right\\rfloor', 125, 125),
        MathEditor.B('matheditor.sum_limits', '\\sum_{}^{}', 150, 125),
        MathEditor.B('matheditor.sum', '\\sum', 175, 125),
        MathEditor.B('matheditor.product_limits', '\\prod_{}^{}', 0, 150),
        MathEditor.B('matheditor.product', '\\prod', 25, 150),
        MathEditor.B('matheditor.coproduct_limits', '\\coprod_{}^{}', 50, 150),
        MathEditor.B('matheditor.coproduct', '\\coprod', 75, 150),
        MathEditor.B('matheditor.less', '<', 100, 150),
        MathEditor.B('matheditor.less_equal', '\\le', 125, 150),
        MathEditor.B('matheditor.greater', '>', 150, 150),
        MathEditor.B('matheditor.greater_equal', '\\ge', 175, 150)
        ]),
    MathEditor.T('matheditor.calculus', [
        MathEditor.B('matheditor.limit', '\\lim_{}{\\placeholder}', 0, 175),
        MathEditor.B('matheditor.integral', '\\int', 50, 175),
        MathEditor.B('matheditor.integral_limits', '\\int^{}_{}', 25, 175),
        MathEditor.B('matheditor.integral_contour', '\\oint', 100, 175),
        MathEditor.B('matheditor.integral_contour_limits', '\\oint_{}', 75, 175),
        MathEditor.B('matheditor.integral_double', '\\int\\int', 0, 500),
        MathEditor.B('matheditor.integral_double_limits', '\\int\\int_{}', 150, 475),
        MathEditor.B('matheditor.integral_surface', '\\oint\\oint', 50, 500),
        MathEditor.B('matheditor.integral_surface_limits', '\\oint\\oint_{}', 75, 500),
        MathEditor.B('matheditor.integral_triple', '\\int\\int\\int', 25, 500),
        MathEditor.B('matheditor.integral_triple_limits', '\\int\\int\\int_{}', 175, 475),
        MathEditor.B('matheditor.integral_volume', '\\oint\\oint\\oint', 100, 500),
        MathEditor.B('matheditor.integral_volume_limits', '\\oint\\oint\\oint_{}', 125, 500),
        MathEditor.B('matheditor.differential', 'd', 125, 175),
        MathEditor.B('matheditor.partial', '\\partial', 150, 175),
        MathEditor.B('matheditor.nabla', '\\nabla', 175, 175)
        ]),
    MathEditor.T('matheditor.greek', [
        // Lower Case
        MathEditor.B('matheditor.alpha', '\\alpha', 0, 200),
        MathEditor.B('matheditor.beta', '\\beta', 25, 200),
        MathEditor.B('matheditor.gamma', '\\gamma', 50, 200),
        MathEditor.B('matheditor.delta', '\\delta', 75, 200),
        MathEditor.B('matheditor.epsilon', '\\epsilon', 100, 200),
        MathEditor.B('matheditor.zeta', '\\zeta', 125, 200),
        MathEditor.B('matheditor.eta','\\eta', 150, 200),
        MathEditor.B('matheditor.theta', '\\theta', 175, 200),
        MathEditor.B('matheditor.iota', '\\iota', 0, 225),
        MathEditor.B('matheditor.kappa', '\\kappa', 25, 225),
        MathEditor.B('matheditor.lambda', '\\lambda', 50, 225),
        MathEditor.B('matheditor.mu', '\\mu', 75, 225),
        MathEditor.B('matheditor.nu', '\\nu', 100, 225),
        MathEditor.B('matheditor.xi', '\\xi', 125, 225),
        MathEditor.B('matheditor.omicron', 'o', 150, 225),
        MathEditor.B('matheditor.pi', '\\pi', 175, 225),
        MathEditor.B('matheditor.rho', '\\rho', 0, 250),
        MathEditor.B('matheditor.sigma', '\\sigma', 25, 250),
        MathEditor.B('matheditor.tau', '\\tau', 50, 250),
        MathEditor.B('matheditor.upsilon', '\\upsilon', 75, 250),
        MathEditor.B('matheditor.phi', '\\phi', 100, 250),
        MathEditor.B('matheditor.chi', '\\chi', 125, 250),
        MathEditor.B('matheditor.psi', '\\psi', 150, 250),
        MathEditor.B('matheditor.omega', '\\omega', 175, 250),

        // Upper Case
        MathEditor.B('matheditor.alpha_uppercase', 'A', 0, 275),
        MathEditor.B('matheditor.beta_uppercase', 'B', 25, 275),
        MathEditor.B('matheditor.gamma_uppercase', '\\Gamma', 50, 275),
        MathEditor.B('matheditor.delta_uppercase', '\\Delta', 75, 275),
        MathEditor.B('matheditor.epsilon_uppercase', 'E', 100, 275),
        MathEditor.B('matheditor.zeta_uppercase', 'Z', 125, 275),
        MathEditor.B('matheditor.eta_uppercase', 'H', 150, 275),
        MathEditor.B('matheditor.theta_uppercase', '\\Theta', 175, 275),
        MathEditor.B('matheditor.iota_uppercase', 'I', 0, 300),
        MathEditor.B('matheditor.kappa_uppercase', 'K', 25, 300),
        MathEditor.B('matheditor.lambda_uppercase', '\\Lambda', 50, 300),
        MathEditor.B('matheditor.mu_uppercase', 'M', 75, 300),
        MathEditor.B('matheditor.nu_uppercase', 'N', 100, 300),
        MathEditor.B('matheditor.xi_uppercase', '\\Xi', 125, 300),
        MathEditor.B('matheditor.omicron_uppercase', 'O', 150, 300),
        MathEditor.B('matheditor.pi_uppercase', '\\Pi', 175, 300),
        MathEditor.B('matheditor.rho_uppercase', 'P', 0, 325),
        MathEditor.B('matheditor.sigma_uppercase', '\\Sigma', 25, 325),
        MathEditor.B('matheditor.tau_uppercase', 'T', 50, 325),
        MathEditor.B('matheditor.upsilon_uppercase', 'Y', 75, 325),
        MathEditor.B('matheditor.phi_uppercase', '\\Phi', 100, 325),
        MathEditor.B('matheditor.chi_uppercase', 'X', 125, 325),
        MathEditor.B('matheditor.psi_uppercase', '\\Psi', 150, 325),
        MathEditor.B('matheditor.omega_uppercase', '\\Omega', 175, 325)
        ]),
    MathEditor.T('matheditor.matrix', [
        MathEditor.BM('matheditor.matrix', '', '', 230, 0, 50, 50),
        MathEditor.BM('matheditor.matrix_parenthesis', '\\left(', '\\right)', 230, 50, 50, 50),
        MathEditor.BM('matheditor.matrix_bracket', '\\left[', '\\right]', 230, 100, 50, 50),
        MathEditor.BM('matheditor.matrix_bar', '\\left|', '\\right|', 230, 150, 50, 50)
        ]),
    MathEditor.T('matheditor.logicsets', [
        MathEditor.B('matheditor.implication', '\\Rightarrow', 0, 350),
        MathEditor.B('matheditor.implication_left', '\\Leftarrow', 25, 350),
        MathEditor.B('matheditor.equivalence', '\\Leftrightarrow', 50, 350),
        MathEditor.B('matheditor.negation', '\\not', 75, 350),
        MathEditor.B('matheditor.negation_tilde', '\\sim', 100, 350),
        MathEditor.B('matheditor.conjunction', '\\land', 125, 350),
        MathEditor.B('matheditor.disjunction', '\\lor', 150, 350),
        MathEditor.B('matheditor.forall', '\\forall', 175, 350),
        MathEditor.B('matheditor.exists', '\\exists', 0, 375),
        MathEditor.B('matheditor.not_exists', '\\nexists', 25, 375),
        MathEditor.B('matheditor.set_minus', '\\setminus', 50, 375),
        MathEditor.B('matheditor.empty_set', '\\varnothing', 75, 375),
        MathEditor.B('matheditor.union', '\\cup', 100, 375),
        MathEditor.B('matheditor.intersection', '\\cap', 125, 375),
        MathEditor.B('matheditor.subset_equal', '\\subseteq', 150, 375),
        MathEditor.B('matheditor.not_subset_equal', '\\notsubseteq', 175, 375),
        MathEditor.B('matheditor.subset', '\\subset', 0, 400),
        MathEditor.B('matheditor.not_subset', '\\notsubset', 25, 400),
        MathEditor.B('matheditor.superset_equal', '\\supseteq', 50, 400),
        MathEditor.B('matheditor.not_superset_equal', '\\notsupseteq', 75, 400),
        MathEditor.B('matheditor.superset', '\\supset', 100, 400),
        MathEditor.B('matheditor.not_superset', '\\notsupset', 125, 400),
        MathEditor.B('matheditor.in', '\\in', 150, 400),
        MathEditor.B('matheditor.not_in', '\\notin', 175, 400),
        MathEditor.B('matheditor.contains', '\\ni', 0, 425),
        MathEditor.B('matheditor.not_contains', '\\notni', 25, 425)
        ]),
    MathEditor.T('matheditor.miscellaneous', [
        MathEditor.B('matheditor.infinity', '\\infty', 50, 425),
        MathEditor.B('matheditor.primes', '\\primes', 75, 425),
        MathEditor.B('matheditor.naturals', '\\naturals', 100, 425),
        MathEditor.B('matheditor.integers', '\\integers', 125, 425),
        MathEditor.B('matheditor.irrationals', '\\irrationals', 150, 425),
        MathEditor.B('matheditor.rationals', '\\rationals', 175, 425),
        MathEditor.B('matheditor.reals', '\\reals', 0, 450),
        MathEditor.B('matheditor.complex', '\\complex', 25, 450),
        MathEditor.B('matheditor.perpendicular', '\\perp', 50, 450),
        MathEditor.B('matheditor.parallel', '\\parallel', 75, 450),
        MathEditor.B('matheditor.therefore', '\\therefore', 100, 450),
        MathEditor.B('matheditor.because', '\\because', 125, 450),
        MathEditor.B('matheditor.dots_horizontal', '\\cdots', 150, 450),
        MathEditor.B('matheditor.dots_vertical', '\\vdots', 175, 450),
        MathEditor.B('matheditor.dots_diagonal', '\\ddots', 0, 475),
        MathEditor.B('matheditor.arrow_left_long', '\\longleftarrow', 25, 475),
        MathEditor.B('matheditor.arrow_right_long', '\\longrightarrow', 50, 475),
        MathEditor.B('matheditor.arrow_left', '\\leftarrow', 150, 500),
        MathEditor.B('matheditor.arrow_right', '\\rightarrow', 175, 500),
        MathEditor.B('matheditor.angle', '\\angle', 75, 475),
        MathEditor.B('matheditor.hbar', '\\hbar', 100, 475),
        MathEditor.B('matheditor.alef', '\\aleph', 125, 475)
        ])
    ];
};

/**
 * Generates the colour objects for the editor.
 *
 * @private
 */
 MathEditor.prototype.getColours_ = function() {
    return [
    MathEditor.C('matheditor.black', 'black'),
    MathEditor.C('matheditor.red', 'red'),
    MathEditor.C('matheditor.blue', 'blue'),
    MathEditor.C('matheditor.magenta', 'magenta'),
    MathEditor.C('matheditor.green', 'green'),
    MathEditor.C('matheditor.purple', 'purple'),
    MathEditor.C('matheditor.orange', 'orange')
    ];
};
