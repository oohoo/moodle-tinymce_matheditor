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
    this.initialized = false;
};

MathEditor.Button = function(name, display, latex) {
    this.name = name;
    this.display = display;
    this.latex = latex;
};

MathEditor.B = function(name, display, latex) {
    return new MathEditor.Button(name, display, latex);
};

MathEditor.BC = function(name, display, cmd) {
    var button = new MathEditor.Button(name, display, null);
    button.cmd = cmd;
    return button;
};

MathEditor.BM = function(name, display, cmd) {
    var button = new MathEditor.Button(name, display, null);
    button.cmd = cmd;
    button.matrix = true;
    return button;
};

MathEditor.Tab = function(name, buttons) {
    this.name = name;
    this.buttons = buttons;
};

MathEditor.T = function(name, buttons) {
    return new MathEditor.Tab(name, buttons);
};

MathEditor.prototype.decorate = function() {
    this.generateTabs_();
    this.generatePanes_();
    this.generateMatrixInput_();

    // Equation field
    this.equation = $('<span class="matheditor-equation mathquill-editable"></span>').appendTo(this.container);

    // Latex Field
    this.latex = $('<textarea class="matheditor-latex"></textarea>').appendTo(this.container);
    this.latex.hide();

    this.generateLatexButton_();

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
    this.content[0].dom.addClass('matheditor-tabs-active');
};

MathEditor.prototype.generateMatrixInput_ = function() {
    this.form = $('<div class="matheditor-form"></div>').appendTo(this.container);
    this.form.click(function(e) {
        e.stopPropagation();
    });
    this.form.append('Rows: ');
    this.form.rows = $('<input type="number" min="1" class="matheditor-form-number" value="1">').appendTo(this.form);
    this.form.append('<br/>Columns: ');
    this.form.cols = $('<input type="number" min="1" class="matheditor-form-number" value="1">').appendTo(this.form);
    this.form.append('<br/>');
    var button = $('<button>' + this.editor.getLang('matheditor.create') + '</button>').appendTo(this.form);
    var self = this;
    button.click(function(e) {
        e.stopPropagation();
        self.form.hide();
        self.insertMatrix_();
    });
    this.form.hide();
};

MathEditor.prototype.generateLatexButton_ = function() {
    var self = this;
    var footerDiv = $('<div class="matheditor-latexbutton"></div>').appendTo(this.container);
    this.latexButton = $('<div>' + this.editor.getLang('matheditor.latex')
            + ' <input type="checkbox"></div>').appendTo(footerDiv);
    this.latexButton.click(function(e) {
        self.latex.toggle();
        var checkbox = self.latexButton.find(':checkbox');
        if(self.latex.is(':visible')) {
            checkbox.prop('checked', true);
        } else {
            checkbox.prop('checked', false);
        }
    });
};

MathEditor.prototype.insertMatrix_ = function() {
    MathQuill.setMatrixSize(this.form.rows.val(), this.form.cols.val());
    this.equation.mathquill('cmd', '\\matrix');
    this.updateLatex_();
};

MathEditor.prototype.matrixInputReset_ = function() {
    this.form.rows.val(1);
    this.form.cols.val(1);
};

MathEditor.prototype.bindEvents_ = function() {
    var editor = this;
    $('html').click(function() {
        editor.form.hide();
    });

    $(this.content).each(function(index, tab) {
        tab.dom.mouseover(function() {
            editor.hidePanes_();
            tab.dom.addClass('matheditor-tabs-active');
            tab.pane.show();
        });
        $(tab.buttons).each(function(buttonIndex, button) {
            button.dom.click(function(e) {
                if (button.matrix) {
                    e.stopPropagation();
                    editor.activeMatrix = button;
                    editor.matrixInputReset_();
                    editor.form.css({
                        top: button.dom.offset().top + 15,
                        left: button.dom.offset().left + 15
                    });
                    editor.form.toggle();
                } else {
                    if (button.cmd != null) {
                        editor.equation.mathquill('cmd', button.cmd);
                    } else {
                        editor.equation.mathquill('write', button.latex);
                    }
                    editor.updateLatex_();
                }
            });
        });
    });
    this.equation.bind('input propertychange keyup', function(e) {
        editor.updateLatex_();
    });
};

MathEditor.prototype.updateLatex_ = function() {
    this.latex.text('');
    this.latex.text(this.equation.mathquill('latex'));
};

MathEditor.prototype.hidePanes_ = function() {
    $(this.content).each(function(index, tab) {
        tab.dom.removeClass('matheditor-tabs-active');
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
        MathEditor.B('matheditor.subscript', '&#x2610<sub>&#x25A1</sub>', '{}_{}'),
        MathEditor.B('matheditor.superscript', '&#x2610<sup>&#x25A1</sup>', '{}^{}'),
        MathEditor.B('matheditor.ln', 'ln', '\\ln{}'),
        MathEditor.B('matheditor.exponential', 'e', 'e^{}'),
        MathEditor.B('matheditor.round_braces', '( )', '\\left( \\right)'),
        MathEditor.B('matheditor.square_braces', '[ ]', '\\left[ \\right]'),
        MathEditor.B('matheditor.absolute_braces', '| |', '\\left| \\right|'),
        MathEditor.B('matheditor.fraction', '<sup>&#x25A1</sup>/<sub>&#x25A1</sub>', '\\frac{}{}'),
        MathEditor.B('matheditor.vector', '&#x25A1&#x20D7', '\\vec{}'),
        MathEditor.B('matheditor.hat', '&#x25A1&#x0302', '\\hat{}'),
        MathEditor.B('matheditor.log', 'log', '\\log{}'),
        MathEditor.B('matheditor.logbase', 'log&#x25A1', '\\log_{}'),
        MathEditor.B('matheditor.curly_braces', '{ }', '\\left\\{ \\right\\}'),
        MathEditor.BC('matheditor.angle_braces', '&#x27E8 &#x27E9', '\\langle'),
        // MathEditor.B('matheditor.doubleabsolute_braces', '&#x2225 &#x2225', '\\left\\| \\right\\|') BROKEN
    ]),
    MathEditor.T('matheditor.operators', [
        MathEditor.B('matheditor.plus', '+', '+'),
        MathEditor.B('matheditor.minus', '-', '-'),
        MathEditor.B('matheditor.times', '×', '\\times'),
        MathEditor.B('matheditor.division', '÷', '\\div'),
        MathEditor.B('matheditor.bullet', '&#x2219', '\\bullet'),
        MathEditor.B('matheditor.plus_minus', '±', '\\pm'),
        MathEditor.B('matheditor.equal', '=', '='),
        MathEditor.B('matheditor.definition', '&#x2255', '≔'),
        MathEditor.B('matheditor.square_root', '&#x221A', '\\sqrt{}'),
        MathEditor.BC('matheditor.ceiling', '&#x2308 &#x2309', '\\lceil'),
        MathEditor.B('matheditor.sum', '&#x2211', '\\sum'),
        MathEditor.B('matheditor.product', '&#x220F', '\\prod'),
        MathEditor.B('matheditor.coproduct', '&#x2210', '\\coprod'),
        MathEditor.B('matheditor.less', '<', '<'),
        MathEditor.B('matheditor.less_equal', '&#x2264', '\\le'),
        MathEditor.B('matheditor.greater', '>', '>'),
        MathEditor.B('matheditor.greater_equal', '&#x2265', '\\ge'),
        MathEditor.B('matheditor.factorial', '!', '!'),
        MathEditor.B('matheditor.minus_plus', '&#x2213', '\\mp'),
        MathEditor.B('matheditor.not_equal', '&#x2260', '\\neq'),
        MathEditor.B('matheditor.asymptotically_equal', '&#x2243', '\\simeq'),
        MathEditor.B('matheditor.square_root_power', '<sup>&#x25A1</sup>&#x221A', '\\sqrt[{}]{}'),
        MathEditor.BC('matheditor.floor', '&#x230A &#x230B', '\\lfloor'),
    ]),
    MathEditor.T('matheditor.calculus', [
        MathEditor.B('matheditor.limit', 'lim', '\\lim'),
        MathEditor.B('matheditor.derivative', '<sup>d</sup>/<sub>dx</sub>', '\\frac{d}{dx}'),
        MathEditor.B('matheditor.integral', '&#x222B', '\\int')
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
        MathEditor.BM('matheditor.matrix_square', 'Matrix', '\\begin{array}&\\&\\&'),
    ]),
    MathEditor.T('matheditor.miscellaneous', [
        MathEditor.B('matheditor.infinity', '&#x221E', '\\infty'),
        MathEditor.B('matheditor.primes', '&#x2119', '\\primes'),
        MathEditor.B('matheditor.naturals', '&#x2115', '\\naturals'),
        MathEditor.B('matheditor.integers', '&#x2124', '\\integers'),
        MathEditor.B('matheditor.irrationals', '&#x1D540', '\\irrationals'),
        MathEditor.B('matheditor.rationals', '&#x211A', '\\rationals'),
        MathEditor.B('matheditor.reals', '&#x211D', '\\reals'),
        MathEditor.B('matheditor.complex', '&#x2102', '\\complex'),
        MathEditor.B('matheditor.perpendicular', '&#x22A5', '\\perp'),
        MathEditor.B('matheditor.parallel', '&#x2225', '\\parallel'),
        MathEditor.B('matheditor.therefore', '&#x2234', '\\therefore'),
        MathEditor.B('matheditor.because', '&#x2235', '\\because'),
        MathEditor.B('matheditor.dots_horizontal', '&#x22EF', '\\cdots'),
        MathEditor.B('matheditor.dots_vertical', '&#x22EE', '\\vdots'),
        MathEditor.B('matheditor.dots_diagonal', '&#x22F0', '\\ddots'),
    ]),
];