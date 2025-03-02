var ColorView = Backbone.View.extend({
	colorTemplate:
        '<link href="css/color_code_grammar.<%= jsVersion %>css" rel="stylesheet"/>' +
        '<link rel="stylesheet" href="css/spectrum.css"/>' +
        '<script src="js/color_code_config.<%= jsVersion %>js"></script>' +
        '<script src="libs/spectrum.js"></script>' +

		'<div id="ColorCode" class="passageContainer examplesContainer">' +
            '<div id="sideBargenderNumClrs"></div><br>' +
			'<div id="sideBarVerbClrs"></div><br>' +
			'<div id="sideBarHVerbClrs"></div><br>' +
            '<a href="javascript:step.util.showConfigGrammarColor()">Advanced configuration</a>' +
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
            if ((typeof availableOptions === "string") && (availableOptions.indexOf("C") > -1)) // Color grammar is available
                activePassage.set("selectedOptions", selectedOptions + "C");
        }
        this.render();
    },
    render: function () {

        var jsVersion = ($.getUrlVars().indexOf("debug") > -1) ? "" : step.state.getCurrentVersion() + ".min.";

        var colorTab = $(_.template(this.colorTemplate)({ jsVersion: jsVersion }));
        $("div#color.tab-pane.active").empty().append(colorTab);
//        this.$el.append(colorTab);
    },
    onClickClose: function () {
        step.util.showOrHideTutorial(true);
    }
});
