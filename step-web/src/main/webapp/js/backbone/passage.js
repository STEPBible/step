var Passage = Backbone.Model.extend({
    defaults: function () {
        return {
            version: "KJV",
            reference: "Mat 1",
            extraVersions: [],
            interlinearMode: undefined,
            detailLevel : 0
        }
    }
});
