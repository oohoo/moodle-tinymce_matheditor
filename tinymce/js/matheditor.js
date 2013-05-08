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

MathEditor = function(container) {
    this.container = $(container);
    this.initialized = false;
};

MathEditor.Button = function(name, display, latex) {
    this.name = name;
    this.display = display
    this.latex = latex;
    this.dom = null;
};

MathEditor.B = function(name, display, latex) {
    return new MathEditor.Button(name, display, latex);
}

MathEditor.Tab = function(name, buttons) {
    this.name = name;
    this.buttons = buttons;
    this.dom = null;
    this.pane = null;
};

MathEditor.T = function(name, buttons) {
    return new MathEditor.Tab(name, buttons);
}

MathEditor.prototype.content = [
    MathEditor.T('matheditor:greek', [
        MathEditor.B('matheditor:alpha', '&#x03B1', '\\alpha'),
        MathEditor.B('matheditor:beta', '&#x03B2', '\\beta'),
        MathEditor.B('matheditor:gamma', '&#x03B3', '\\gamma'),
        MathEditor.B('matheditor:delta', '&#x03B4', '\\delta'),
        MathEditor.B('matheditor:epsilon', '&#x03B5', '\\epsilon'),
        MathEditor.B('matheditor:zeta', '&#x03B6', '\\zeta'),
        MathEditor.B('matheditor:eta', '&#x03B7', '\\eta'),
        MathEditor.B('matheditor:theta', '&#x03B8', '\\theta'),
    ])
];

MathEditor.prototype.decorate = function() {
    this.generateTabs_();
    this.generatePanes_();

    // Equation field
    this.equation = $('<span class="mathquill-editable"></span>')
        .appendTo(this.container);

    this.bindEvents_();
    this.initialized = true;
    console.log(this.content);
};

MathEditor.prototype.generateTabs_ = function() {
    var tabList = $('<ul></ul>').appendTo(this.container);
    $(this.content).each(function(index, tab) {
        tab.dom = $('<li>' + tab.name + '</li>').appendTo(tabList);
    });
};

MathEditor.prototype.generatePanes_ = function() {
    var editor = this;
    $(this.content).each(function(index, tab) {
        tab.pane = $('<div></div>').appendTo(editor.container);
        $(tab.buttons).each(function(index, button) {
            button.dom = $('<button title="'+ button.name +'">' + button.display + '</button>').appendTo(tab.pane);
        });
    });
};

MathEditor.prototype.bindEvents_ = function() {
    var editor = this;
    $(this.content).each(function(index, tab) {
        tab.dom.click(function() {
            tab.pane.toggle();
        });
        $(tab.buttons).each(function(buttonIndex, button) {
            button.dom.click(function() {
                editor.equation.mathquill('cmd', button.latex);
            })
        });
    });
};

MathEditor.prototype.checkInitialized_ = function() {
    if(!this.initialized) {
        throw "decorate() must be called before running this operation"
    }
};
