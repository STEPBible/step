var step;
var __s;

module("STEP Route Tests", {
    setup: function () {
    }
})

//test("Router - Check passage urls match the right bits.", function () {
//    StepRouter.prototype.changePassage = function() { console.log("HI");};
//    var router = new StepRouter({ passageModels : undefined });
//    try {
//        Backbone.history.start();
//    } catch(e) {
//        console.log("History started already...");
//    }
//
//    var args = [];
////    router.changePassage = function (passageId, detail, version, reference, options, interlinearMode, extraVersions) {
////        args = [passageId, detail, version, reference, options, interlinearMode, extraVersions];
////    };
//
//    var testData = [
//        ["passage/0/2/KJV/Mat.1", 0, 2, "KJV", "Mat.1"],
//        ["passage/0/2/KJV/Mat.1/NOTES/ESV/COLUMN_COMPARE", 0, 2, "KJV", "Mat.1", "NOTES", "ESV", "COLUMN_COMPARE"],
//        ["passage/0/2/KJV/Mat.1/NOTES", 0, 2, "KJV", "Mat.1", "NOTES", undefined, undefined],
//        ["passage/0/2/KJV/Mat.1//ESV/COLUMN_COMPARE", 0, 2, "KJV", "Mat.1", undefined, "ESV", "COLUMN_COMPARE"]
//    ];
//
//    for (var i = 0; i < testData.length; i++) {
//        router.navigate(testData[i][0], { trigger : true });
//
//        //check all args
//        equals(args, testData[i].slice(1), "Iteration " + i + " failed for route " + testData[i][0]);
//
//        //reset in case we have collisions between tests
//        args = [];
//    }
//});

