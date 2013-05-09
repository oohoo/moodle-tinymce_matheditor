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
    this.editor = tinymce.activeEditor;
    console.log(this.editor);
    this.initialized = false;
};

MathEditor.Button = function(name, display, latex, image) {
    this.name = name;
    this.display = display
    this.latex = latex;
    this.image = image;
    this.dom = null;
};

MathEditor.B = function(name, display, latex, image) {
    return new MathEditor.Button(name, display, latex, image);
};

MathEditor.Tab = function(name, buttons) {
    this.name = name;
    this.buttons = buttons;
    this.dom = null;
    this.pane = null;
};

MathEditor.T = function(name, buttons) {
    return new MathEditor.Tab(name, buttons);
};

MathEditor.prototype.decorate = function() {
    this.generateTabs_();
    this.generatePanes_();

    // Equation field
    this.equation = $('<div class="matheditor-equation mathquill-editable"></div>').appendTo(this.container);
    // Latex Field
    this.latex = $('<br/><textarea class="matheditor-latex"></textarea>').appendTo(this.container);

    this.bindEvents_();
    this.initialized = true;
};

MathEditor.prototype.generateTabs_ = function() {
    var editor = this;
    var tabList = $('<div class="matheditor-tabs"><ul></ul></div>').appendTo(this.container);
    $(this.content).each(function(index, tab) {
        tab.dom = $('<li>' + editor.editor.getLang(tab.name) + '</li>').appendTo(tabList);
    });
};

MathEditor.prototype.generatePanes_ = function() {
    var editor = this;
    $(this.content).each(function(index, tab) {
        tab.pane = $('<div class="matheditor-pane"></div>').appendTo(editor.container);
        tab.pane.hide();
        $(tab.buttons).each(function(index, button) {
            button.dom = $('<button title="'+ button.name +'"></button>').appendTo(tab.pane);
            if(button.image != null) {
                button.dom.append('<img src="tinymce/img/' + button.image + '"/>');
            } else {
                button.dom.html(button.display);
            }
        });
    });
    this.content[0].pane.show();
};

MathEditor.prototype.bindEvents_ = function() {
    var editor = this;
    $(this.content).each(function(index, tab) {
        tab.dom.mouseover(function() {
            editor.hidePanes_();
            tab.pane.show();
        });
        $(tab.buttons).each(function(buttonIndex, button) {
            button.dom.click(function() {
                editor.equation.mathquill('write', button.latex);
                editor.latex.text(editor.equation.mathquill('latex'));
            })
        });
    });
    this.latex.bind('input propertychange', function(e) {

    });
};

MathEditor.prototype.hidePanes_ = function() {
    $(this.content).each(function(index, tab) {
        tab.pane.hide();
    });
};

MathEditor.prototype.checkInitialized_ = function() {
    if(!this.initialized) {
        throw "decorate() must be called before running this operation"
    }
};

MathEditor.prototype.content = [
    MathEditor.T('matheditor.general', [
        MathEditor.B('matheditor.comma', ',', ','),
        MathEditor.B('matheditor.subscript', '', '{}_{}','subscript.png'),
        MathEditor.B('matheditor.superscript', '', '{}^{}','superscript.png'),
        MathEditor.B('matheditor.subsuperscript','','{}_{}^{}', 'subsuperscript.png'),
        MathEditor.B('matheditor.ln', 'ln', '\\ln{}'),
        MathEditor.B('matheditor.exponential', 'e', 'e^{}'),
        MathEditor.B('matheditor.round_braces', '( )', '\\left( \\right)'),
        MathEditor.B('matheditor.square_braces', '[ ]', '\\left[ \\right]'),
        MathEditor.B('matheditor.absolute_braces', '| |', '\\left| \\right|'),
        MathEditor.B('matheditor.subsuperscript_left','','_{}^{}{ }', 'subsuperscript_left.png'),
        MathEditor.B('matheditor.fraction', '', '\\frac{}{}', 'fraction.png'),
        //MathEditor.B('matheditor.vector', '', '\\vec{}', 'vector.png') BROKEN
        //MathEditor.B('matheditor.hat', '', '\\hat{}', 'hat.png'), BROKEN
        MathEditor.B('matheditor.log', 'log', '\\log{}'),
        MathEditor.B('matheditor.logbase', '', '\\log_{}', 'logbase.png'),
        MathEditor.B('matheditor.curly_braces', '{ }', '\\left\\{ \\right\\}'),
        //MathEditor.B('matheditor.angle_braces', '&#x27E8 &#x27E9', '\\left\\langle \\right\\rangle'), BROKEN
        //MathEditor.B('matheditor.doubleabsolute_braces', '|| ||', '\\left\\| \\right\\|') BROKEN
    ]),
    MathEditor.T('matheditor.operators', [
        MathEditor.B('matheditor.plus', '+', '+'),
        MathEditor.B('matheditor.minus', '-', '-'),
        MathEditor.B('matheditor.times', '×', '\\times'),
        MathEditor.B('matheditor.division', '÷', '\\div'),
        //MathEditor.B('matheditor.dot_product', '&#x22C5', '\\dot'), BROKEN
        MathEditor.B('matheditor.plus_minus', '±', '\\pm'),
        MathEditor.B('matheditor.equal', '=', '='),
        MathEditor.B('matheditor.definition', '&#x2255', '≔'),
        MathEditor.B('matheditor.square_root', '', '\\sqrt{}', 'squareroot.png'),
        //MathEditor.B('matheditor.ceiling', '&#x2308 &#x2309', '\\left\\lceil \\right\\rceil'), BROKEN
        MathEditor.B('matheditor.sum', '', '\\sum', 'sum.png'),
        MathEditor.B('matheditor.product', '', '\\prod', 'product.png'),
        MathEditor.B('matheditor.coproduct', '', '\\coprod', 'coproduct.png'),
        MathEditor.B('matheditor.less', '<', '<'),
        MathEditor.B('matheditor.less_equal', '&#x2264', '\\le'),
        MathEditor.B('matheditor.greater', '>', '>'),
        MathEditor.B('matheditor.greater_equal', '&#x2265', '\\ge'),
        MathEditor.B('matheditor.factorial', '!', '!'),
        MathEditor.B('matheditor.minus_plus', '&#x2213', '\\mp'),
        MathEditor.B('matheditor.not_equal', '&#x2260', '\\neq'),
        MathEditor.B('matheditor.asymptotically_equal', '&#x2243', '\\simeq'),
        MathEditor.B('matheditor.square_root_power', '', '\\sqrt[{}]{}', 'squareroot_power.png'),
        //MathEditor.B('matheditor.floor', '&#x230A &#x230B', '\\left\\lfloor \\right\\rfloor'), BROKEN
    ]),
    MathEditor.T('matheditor.calculus', [
        MathEditor.B('matheditor.limit', '', '\\lim', 'limit.png'),
        MathEditor.B('matheditor.derivative', '', '\\frac{d}{dx}', 'derivative.png'),
        MathEditor.B('matheditor.integral', '', '\\int', 'integral.png')
    ]),
    MathEditor.T('matheditor.greek', [
        // Lower Case
        MathEditor.B('matheditor.alpha', '&#x03B1', '\\alpha'),
        MathEditor.B('matheditor.beta', '&#x03B2', '\\beta'),
        MathEditor.B('matheditor.gamma', '&#x03B3', '\\gamma'),
        MathEditor.B('matheditor.delta', '&#x03B4', '\\delta'),
        MathEditor.B('matheditor.epsilon', '&#x03B5', '\\epsilon'),
        MathEditor.B('matheditor.zeta', '&#x03B6', '\\zeta'),
        MathEditor.B('matheditor.eta', '&#x03B7', '\\eta'),
        MathEditor.B('matheditor.theta', '&#x03B8', '\\theta'),
        MathEditor.B('matheditor.iota', '&#x03B9', '\\iota'),
        MathEditor.B('matheditor.kappa', '&#x03BA', '\\kappa'),
        MathEditor.B('matheditor.lambda', '&#x03BB', '\\lambda'),
        MathEditor.B('matheditor.mu', '&#x03BC', '\\mu'),
        MathEditor.B('matheditor.nu', '&#x03BD', '\\nu'),
        MathEditor.B('matheditor.xi', '&#x03BE', '\\xi'),
        MathEditor.B('matheditor.omicron', '&#x03BF', 'o'),
        MathEditor.B('matheditor.pi', '&#x03C0', '\\pi'),
        MathEditor.B('matheditor.rho', '&#x03C1', '\\rho'),
        MathEditor.B('matheditor.sigma', '&#x03C3', '\\sigma'),
        MathEditor.B('matheditor.tau', '&#x03C4', '\\tau'),
        MathEditor.B('matheditor.upsilon', '&#x03C5', '\\upsilon'),
        MathEditor.B('matheditor.phi', '&#x03C6', '\\phi'),
        MathEditor.B('matheditor.chi', '&#x03C7', '\\chi'),
        MathEditor.B('matheditor.psi', '&#x03C8', '\\psi'),
        MathEditor.B('matheditor.omega', '&#x03C9', '\\omega'),

        // Lower Case
        MathEditor.B('matheditor.alpha_uppercase', '&#x0391', 'A'),
        MathEditor.B('matheditor.beta_uppercase', '&#x0392', 'B'),
        MathEditor.B('matheditor.gamma_uppercase', '&#x0393', '\\Gamma'),
        MathEditor.B('matheditor.delta_uppercase', '&#x0394', '\\Delta'),
        MathEditor.B('matheditor.epsilon_uppercase', '&#x0395', 'E'),
        MathEditor.B('matheditor.zeta_uppercase', '&#x0396', 'Z'),
        MathEditor.B('matheditor.eta_uppercase', '&#x0397', 'H'),
        MathEditor.B('matheditor.theta_uppercase', '&#x0398', '\\Theta'),
        MathEditor.B('matheditor.iota_uppercase', '&#x0399', 'I'),
        MathEditor.B('matheditor.kappa_uppercase', '&#x039A', 'K'),
        MathEditor.B('matheditor.lambda_uppercase', '&#x039B', '\\Lambda'),
        MathEditor.B('matheditor.mu_uppercase', '&#x039C', 'M'),
        MathEditor.B('matheditor.nu_uppercase', '&#x039D', 'N'),
        MathEditor.B('matheditor.xi_uppercase', '&#x039E', '\\Xi'),
        MathEditor.B('matheditor.omicron_uppercase', '&#x039F', 'O'),
        MathEditor.B('matheditor.pi_uppercase', '&#x03A0', '\\Pi'),
        MathEditor.B('matheditor.rho_uppercase', '&#x03A1', 'P'),
        MathEditor.B('matheditor.sigma_uppercase', '&#x03A3', '\\Sigma'),
        MathEditor.B('matheditor.tau_uppercase', '&#x03A4', 'T'),
        MathEditor.B('matheditor.upsilon_uppercase', '&#x03A5', 'Y'),
        MathEditor.B('matheditor.phi_uppercase', '&#x03A6', '\\Phi'),
        MathEditor.B('matheditor.chi_uppercase', '&#x03A7', 'X'),
        MathEditor.B('matheditor.psi_uppercase', '&#x03A8', '\\Psi'),
        MathEditor.B('matheditor.omega_uppercase', '&#x03A9', '\\Omega'),
    ]),
    MathEditor.T('matheditor.algebra', [
        MathEditor.B('matheditor.matrix_square', '', '\\begin{array}&\\&\\&', 'matrix_square.png'),
    ])
];
