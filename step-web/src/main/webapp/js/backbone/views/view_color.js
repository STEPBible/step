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
            '<a href="javascript:step.util.showConfigGrammarColor()">Advanced color code grammar configuration</a>' +
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
        var options = $.getUrlVars().options;
        if ((typeof options === "undefined") || ((typeof options === "string") && (options.indexOf("C") == -1))) {
            $(".dropdown-toggle.showSettings").click();
            $("a[data-value='C']").click();
            $(".dropdown-toggle.showSettings").click();
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
