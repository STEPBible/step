//var step;
//var __s;
var DETAIL_LEVELS;

module("STEP JQuery Detail Slider widget", {
    setup: function () {
        DETAIL_LEVELS = ["Basic", "Intermediate", "Advanced"];
//        step = {
//            util : {ui : { autocompleteSearch : function() { } } },
//            defaults : { passage : {}}
//        },
//            __s = {};
//        $.widget("custom.versions", { options : {}});
//        $.widget("custom.detailSlider", { options : {}});
//
    }
});

test("Detail Slider widget - Check value and label in sync", function () {
    var detailSlider = $("<div>")
        .append("<div level='0' id='level0'>")
        .append("<div level='1' id='level1'>")
        .append("<div level='2' id='level2'>")
        .detailSlider();

    var changes = 0;
    detailSlider.change(function() { changes++; });

    //check label is basic
    equals(detailSlider.find(".sliderDetailLevelLabel", detailSlider).text(), "Basic");
    equals(detailSlider.detailSlider("value"), 0);
    equals($("#level0", detailSlider).css('display'), "block");
    equals($("#level1", detailSlider).css('display'), "none");
    equals($("#level2", detailSlider).css('display'), "none");

    // now slide
    detailSlider.detailSlider("handleSlide", 1);
    equals(detailSlider.find(".sliderDetailLevelLabel", detailSlider).text(), "Intermediate");
    equals(detailSlider.detailSlider("value"), 1);
    equals($("#level0", detailSlider).css('display'), "block");
    equals($("#level1", detailSlider).css('display'), "block");
    equals($("#level2", detailSlider).css('display'), "none");

    detailSlider.detailSlider("handleSlide", 2);
    equals(detailSlider.find(".sliderDetailLevelLabel", detailSlider).text(), "Advanced");
    equals(detailSlider.detailSlider("value"), 2);
    equals($("#level0", detailSlider).css('display'), "block");
    equals($("#level1", detailSlider).css('display'), "block");
    equals($("#level2", detailSlider).css('display'), "block");

    //check changes triggered
    equals(2, changes);
});


test("Detail Slider widget - Test change to 0 goes to 0", function () {
    var detailSlider = $("<div>").detailSlider();

    // now slide to 1 and back
    detailSlider.detailSlider("handleSlide", 1);
    detailSlider.detailSlider("handleSlide", 0);
    equals(detailSlider.detailSlider("value"), 0);
    equals(detailSlider.find(".sliderDetailLevelLabel", detailSlider).text(), "Basic");
});