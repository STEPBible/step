//hear the resize to resize our passage content
$(window).resize(function() {
    step.passage.ui.resize();
});

step.passage.ui = {
    resize : function() {
        $(".passageContent").height($(window).height() - $(".passageContent").position().top);
    },
};

