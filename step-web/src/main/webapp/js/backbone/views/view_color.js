var ColorView = Backbone.View.extend({
	colorTemplate:
        '<link href="css/color_code_grammar.<%= jsVersion %>css" rel="stylesheet"/>' +
        '<link rel="stylesheet" href="css/spectrum.css"/>' +
        '<script src="js/color_code_config.<%= jsVersion %>js"></script>' +
        '<script src="libs/spectrum.js"></script>' +
		'<div id="ColorCode" class="passageContainer examplesContainer colorCodeContainer">' +
            '<div id="sideBargenderNumClrs"></div><br>' +
			'<div id="sideBarVerbClrs"></div><br>' +
			'<div id="sideBarHVerbClrs"></div><br>' +
            '<a id="colorAdvancedConfig" href="javascript:step.util.showConfigGrammarColor()">Advanced configuration</a>' +
            '<p id="noColorGrammar" style="color:red;display:none">The passage your selected probably does not have grammar information</p>' +
		'</div>' +
        '<script>' +
        '$( document ).ready(function() {' +
            'initializeClrCodeSidebar();' +
        '});' +
        '</script>',
    events: {
        'click .closeColumn': 'onClickClose'
    },
    initialize: function () {
        var activePassage = step.util.activePassage();
        var selectedOptions = activePassage.get("selectedOptions");
        if ((typeof selectedOptions === "string") && (selectedOptions.indexOf("C") == -1)) { // Color grammar not selected
            var availableOptions = activePassage.get("options");
            if ((typeof availableOptions === "string") && (availableOptions.indexOf("C") > -1)) { // Color grammar is available
                if (typeof c4 === "undefined") cf.initCanvasAndCssForClrCodeGrammar(); //c4 is currentClrCodeConfig.  It is called to c4 to save space
                var C_Greek = 0; // This need to match definition in color_code_grammar.js
                var C_enableVerbClr = 0; // This need to match definition in color_code_grammar.js
                var C_enableGenderNumberClr = 3; // This need to match definition in color_code_grammar.js
                if (c4[C_Greek][C_enableVerbClr] || // Enabled Greek verb color code 
                    c4[C_enableGenderNumberClr] ||  // Or enabled noun
                    c4[C_OT][C_enableVerbClr] )     // Or enabled OT verb color code 
                    activePassage.set("selectedOptions", selectedOptions + "C");
            }
        }
        this.render();
    },
    render: function () {

        var jsVersion = ($.getUrlVars().indexOf("debug") > -1) ? "" : step.state.getCurrentVersion() + ".min.";
        var colorTab = $(_.template(this.colorTemplate)({ jsVersion: jsVersion }));
        if (step.touchDevice && !step.touchWideDevice) {
            step.util.showLongAlert("", "<b>" + __s.display_grammarColor + "</b>", [ colorTab ]);
            step.sidebar = null;
            $(".closeColumn").click(function (ev) {
                step.util.closeModal("showLongAlertModal");
            });
        }
        else
            $("div#color.tab-pane.active").empty().append(colorTab);
    },
    onClickClose: function () {
        step.util.showOrHideTutorial(true);
    }
});
