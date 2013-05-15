var step;
var __s;

module("STEP Passage Model", {
    setup: function () {
        step = {
            defaults: {passage: {
                interNamedOptions: ["A", "B", "C", "INTERLINEAR"],
                interOptions: ["x", "y", "z", "Interlinear"],
                interOptionsNoInterlinear : ["x", "y", "z"]
        }},
            util: { raiseInfo: function (){} },
            keyedVersions : {
                ESV : { hasStrongs : false},
                KJV : { hasStrongs : true }
            }
        };
        __s = { error_javascript_validation : "ERROR"};
        Backbone.Model.prototype.save = function(attributes) { return attributes; };
    }
})

test("PassageModel Does not trigger validation", function () {
    var model = new PassageModel
    var message = model.validate({
        reference: "Mat.2",
        version: "ESV"
    });
    equals(undefined, message);
});


test("PassageModel Just ESV versions, should be be strongless", function () {
    var model = new PassageModel({
        reference: "Mat.2",
        version: "ESV"
    });
    equals(model._hasStronglessVersion(["ESV"]), true);
});

test("PassageModel Just strong versions, should be not be strongless", function () {
    var model = new PassageModel({
        reference: "Mat.2",
        version: "KJV",
        extraVersions : ["KJV"]
    });
    equals(model._hasStronglessVersion(["KJV"]), false);
});

test("PassageModel Mixed versions, should be strongless", function () {
    var model = new PassageModel({
        reference: "Mat.2",
        version: "ESV",
        extraVersions : ["KJV"]
    });
    equals(model._hasStronglessVersion(["KJV"]), true);
});

test("PassageModel Fail Validation", function () {
    var model = new PassageModel
    var message = model.validate({ interlinearMode: "Bob" });
    equals(__s.error_javascript_validation, message);
});

test("PassageModel Succeeds Validation", function () {
    var model = new PassageModel
    equals(undefined, model.validate({ interlinearMode: "A" }));
    equals(__s.error_javascript_validation, model.validate({ interlinearMode: "a" }));
});

test("PassageModel Interlinear mode validates", function () {
    var model = new PassageModel
    equals(undefined, model.validate({ interlinearMode: "A" }));
    equals(__s.error_javascript_validation, model.validate({ interlinearMode: "a" }));
});

test("PassageModel Safe Interlinear mode", function () {
    var model = new PassageModel

    //no interlinear versions should return NONE all the time
    equals("NONE", model._getSafeInterlinearMode(undefined));
    equals("NONE", model._getSafeInterlinearMode(""));
    equals("NONE", model._getSafeInterlinearMode("A"));
    equals("NONE", model._getSafeInterlinearMode("x"));

    //with interlinear versions, but no interlinear mode, should return INTERLEAVED or INTERLINEAR
    equals("INTERLEAVED", model._getSafeInterlinearMode("", ["ESV", "KJV"]));
    equals("INTERLEAVED", model._getSafeInterlinearMode("NONE", ["ESV", "KJV"]));
    equals("INTERLEAVED", model._getSafeInterlinearMode(undefined, ["ESV"]));
    equals("INTERLINEAR", model._getSafeInterlinearMode(undefined, ["KJV"]));

    //if we specify a mode that doesn't exist, it should default to the right value
    equals("INTERLEAVED", model._getSafeInterlinearMode("bob", ["ESV"]));
    equals("INTERLINEAR", model._getSafeInterlinearMode("bob", ["KJV"]));

    //if we specify values that exist, we should get back the same value regardless
    //of whether that is the value itself, or the internationalised string
    equals("A", model._getSafeInterlinearMode("x", ["ESV"]));
    equals("A", model._getSafeInterlinearMode("A", ["ESV"]));
    equals("A", model._getSafeInterlinearMode("x", ["KJV"]));
    equals("A", model._getSafeInterlinearMode("A", ["KJV"]));

    //if we specify interlinear and interlinear is not available, then we get back interleaved
    equals("INTERLEAVED", model._getSafeInterlinearMode("INTERLINEAR", ["ESV"]));
    equals("INTERLEAVED", model._getSafeInterlinearMode("Interlinear", ["ESV"]));
});

test("PassageModel Get Available options for interlinear mode", function () {
    var model = new PassageModel({ detailLevel : 2, version : "KJV" });

    //if extra versions has no strongs
    model.set("extraVersions", ["ESV"]);
    equals(step.defaults.passage.interOptionsNoInterlinear, model.getAvailableInterlinearOptions());

    //if extra versions has strongs
    model.set("extraVersions", ["KJV"]);
    equals(step.defaults.passage.interOptions, model.getAvailableInterlinearOptions());

    model.set("extraVersions", []);
    equals([], model.getAvailableInterlinearOptions());
});

test("PassageModel Overriden interlinear mode", function() {
   var model = new PassageModel;

    model.set("interlinearMode", "INTERLINEAR");

    model.set("detailLevel", 0);
    equals("NONE", model.get("interlinearMode"));


    model.set("detailLevel", 1);
    equals("NONE", model.get("interlinearMode"));

    //with a version, we get interleaved
    model.set("extraVersions", ["ESV"]);
    equals("INTERLEAVED", model.get("interlinearMode"));

    //with a version that supports strong numbers, we get INTERLINEAR
    model.set("extraVersions", ["KJV"]);
    equals("INTERLINEAR", model.get("interlinearMode"));

    model.set("detailLevel", 2);
    equals("INTERLINEAR", model.get("interlinearMode"));
});

test("PassageModel Get Internationalised option", function () {
    var model = new PassageModel({ detailLevel : 2, extraVersions : ["ESV"] });

    //if we don't have a value
    model.set("interlinearMode", "");
    equals("", model.getInternationalisedInterlinearMode());

    //if we have a value
    model.set("interlinearMode", "A");
    equals("x", model.getInternationalisedInterlinearMode());

    //if we don't have a value that doesn't exist
    model.set("interlinearMode", "bob");
    equals("", model.getInternationalisedInterlinearMode());

});

test("PassageModel Test extra versions are proxied correctly", function () {
    var storedExtraVersions = ["ESV"];
    var model = new PassageModel({ detailLevel : 0, extraVersions : storedExtraVersions });

    //at level 0, nothing
    model.set("detailLevel", 0);
    equals("", model.get("extraVersions"));

    //at level 1, what is stored
    model.set("detailLevel", 1);
    equals(storedExtraVersions, model.get("extraVersions"));

    //at level 2, what is stored
    model.set("detailLevel", 2);
    equals(storedExtraVersions, model.get("extraVersions"));
});

test("PassageModel Save interlinear without extra version attributes", function () {
    var model = new PassageModel({
        detailLevel : 2,
        extraVersions : ["ESV"],
        interlinearMode : "Interleaved"
    });

    //save doesn't really save, since we've mocked it out
    var savedAttributes = model.save({
        interlinearMode : "x"
    });

    //so instead we check the returned attributes
    equals(savedAttributes.interlinearMode, "A");
});

test("PassageModel - Check pretty URLs", function() {
    var model = new PassageModel({
        reference : "Gen.2",
        version : "ESV",
        detailLevel : 2,
        extraVersions : ["KJV"],
        interlinearMode : "Interleaved",
        passageId : 0,
        options : ["Notes"]
    });

    equals(model.getLocation(), "0/__passage/2/ESV/Gen.2/Notes/KJV/INTERLEAVED");

    //take off an argument and start again - this effectively sets the mode to default to interleaved
    model.set("interlinearMode", "");
    equals(model.getLocation(), "0/__passage/2/ESV/Gen.2/Notes/KJV/INTERLEAVED");

    //take off an argument and start again
    model.set("extraVersions", []);
    equals(model.getLocation(), "0/__passage/2/ESV/Gen.2/Notes");

    //take off an argument and start again
    model.set("options", []);
    equals(model.getLocation(), "0/__passage/2/ESV/Gen.2");

    //put something at the end we get some empty fragments
    model.set("extraVersions", ["ASV"]);
    model.set("interlinearMode", "Interlinear");
    equals(model.getLocation(), "0/__passage/2/ESV/Gen.2//ASV/INTERLEAVED");
});

test("Test validate options is array", function() {
    var model = new PassageModel;

    equals(undefined, model._validateOptions(undefined));
    equals(undefined, model._validateOptions([]));
    equals(undefined, model._validateOptions(["A", "B"]));
    equals(__s.error_javascript_validation, model._validateOptions("A,B"));
});
