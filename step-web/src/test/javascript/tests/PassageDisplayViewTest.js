var step;
var __s;

module("STEP Passage View Module", {
    setup: function () {
        step = {
//            util : {ui : { autocompleteSearch : function() { } } },
//            defaults : { passage : {
//                interNamedOptions: ["A", "B", "C", "INTERLINEAR"],
//                interOptions: ["x", "y", "z", "Interlinear"],
//                interOptionsNoInterlinear : ["x", "y", "z"]}}
        };

        __s = { error_bible_doesn_t_have_passage : "NO PASSAGE" };
//        $.widget("custom.versions", { options : {}});
    }
});

test("Test Passage is valid to be displayed", function() {
    var model = new PassageModel;
    var view = new PassageDisplayView({ model : model, el : $("<div><div class='passageContent'></div></div>")});

    //an empty passage is not valid
    var passageHtml = $("<div>");

    //check that passageContent has been updated with an error message
    ok(!view._isPassageValid(passageHtml));
    ok(view.$el.find(".passageContent").text().indexOf("NO PASSAGE") != -1);


    //now append an xgen, and check the same is true
    passageHtml.append("<div class='xgen'>");
    ok(!view._isPassageValid(passageHtml));
    ok(view.$el.find(".passageContent").text().indexOf("NO PASSAGE") != -1);

    //now append something other than xgen, and check the reverse is true
    passageHtml.append("<div>hi</div>");
    ok(view._isPassageValid(passageHtml));
    ok(!view.$el.find(".passageContent").text().indexOf("NO PASSAGE") != -1);
});

test("Test apply classes array", function() {
    var model = new PassageModel;
    var view = new PassageDisplayView({ model : model });

    var group1 = $("<div class='group'>").append("<span id='a'>").append("<span id='b'>").append("<span id='c'>");
    var group2 = $("<div class='group'>").append("<span id='d'>").append("<span id='e'>").append("<span id='f'>");
    var group3 = $("<div class='group'>").append("<span id='g'>").append("<span id='h'>").append("<span id='i'>");

    var content = $("<div>").append(group1).append(group2).append(group3);

    //this should skip :
    // a,d,g because of the offset,
    // b,e,h because of the undefined in the first array element,
    // c because of the exclusion
    view._applyCssClassesRepeatByGroup(content, ".group", [undefined, "myClass"],
        function(child) { return child.attr('id') == 'c'; }, 1);

    ok(!$("#a", content).hasClass("myClass"));
    ok(!$("#b", content).hasClass("myClass"));
    ok(!$("#c", content).hasClass("myClass"));
    ok(!$("#d", content).hasClass("myClass"));
    ok(!$("#e", content).hasClass("myClass"));
    ok($("#f", content).hasClass("myClass"));
    ok(!$("#g", content).hasClass("myClass"));
    ok(!$("#h", content).hasClass("myClass"));
    ok($("#i", content).hasClass("myClass"));
});

test("Test Passage check fonts are applied", function() {
    var model = new PassageModel;
    var view = new PassageDisplayView({ model : model });

    expect(10);
    view._applyCssClassesRepeatByGroup = function() { ok(true); };
    view._getFontClasses = function () { };

    //we expect an assertion for each one of these combinations
    view._doFonts(undefined, [], "INTERLINEAR", []);
    view._doFonts(undefined, [], "INTERLEAVED", []);
    view._doFonts(undefined, [], "INTERLEAVED_COMPARED", []);
    view._doFonts(undefined, [], "COLUMN", []);
    view._doFonts(undefined, [], "COLUMN_COMPARED", []);
    view._doFonts(undefined, ["TRANSLITERATION"], "NONE", []);
    view._doFonts(undefined, ["GREEK_VOCAB"], "NONE", []);
    view._doFonts(undefined, ["ENGLISH_VOCAB"], "NONE", []);
    view._doFonts(undefined, ["NOTES", "ENGLISH_VOCAB"], "NONE", []);
    view._doFonts(undefined, ["NOTES", "ENGLISH_VOCAB"], "INTERLEAVED_COMPARE", []);
});


test("Test Passage check languages are spliced in", function() {
    var model = new PassageModel;
    var view = new PassageDisplayView({ model : model });

    view._applyCssClassesRepeatByGroup = function() { ok(true); };
    view._getFontClasses = function () { return [] };

    // test case where array doesn't change
    var languages = ["a", "b"];
    view._doFonts(undefined, ["NOTES", ""], "NONE", languages);
    equals(languages, ["a", "b"]);

    //test each option
    languages = ["a", "b"];
    view._doFonts(undefined, ["TRANSLITERATION"], "NONE", languages);
    equals(languages, ["a", "en", "b"]);

    languages = ["a", "b"];
    view._doFonts(undefined, ["GREEK_VOCAB"], "NONE", languages);
    equals(languages, ["a", undefined, "b"]);

    languages = ["a", "b"];
    view._doFonts(undefined, ["ENGLISH_VOCAB"], "NONE", languages);
    equals(languages, ["a", "en", "b"]);

    //test multiple ones in one go
    languages = ["a", "b"];
    view._doFonts(undefined, ["TRANSLITERATION", "GREEK_VOCAB"], "NONE", languages);
    equals(languages, ["a", "en", undefined, "b"]);

});

test("Test Passage check fonts are applied normally", function() {
    var model = new PassageModel;
    var view = new PassageDisplayView({ model : model });

    view._applyCssClassesRepeatByGroup = function() { ok(false); };
    view._getFontClasses = function () { return ["someClass"] };

    //we expect an assertion for each one of these combinations
    var passageContent = $("<div>");
    view._doFonts(passageContent, [], "", []);

    ok(passageContent.hasClass("someClass"));
});

test("Test that note title attribute is set on inline notes", function() {
    var model = new PassageModel;
    var view = new PassageDisplayView({ model : model });
    var internalNote = $("<div><div class='verse'><span class='note'><a>Some note</a><span class='inlineNote'>Bob</span></span></div></div>");

    view._doInlineNotes(internalNote, 0);
    equals($("a", internalNote).attr("title"), "Bob");
});
