var ColorView = Backbone.View.extend({
	colorTemplate: _.template(
        '<script src="js/color_code_config.js"></script>' +
		'<div id="ColorCode" class="passageContainer examplesContainer">' +
			'<div id="sideBarVerbClrs"></div>' +
			'<div id="sideBarHVerbClrs"></div>' +
		'</div>'
	),
    events: {
        'click .closeColumn': 'onClickClose'
    },
    initialize: function () {
        this.render();
    },
    render: function () {
        this.$el.append(this.colorTemplate());
        initializeClrCodeHtmlModalPage("sidebar");
    },
    onClickClose: function () {
        step.util.showOrHideTutorial(true);
    }
});
