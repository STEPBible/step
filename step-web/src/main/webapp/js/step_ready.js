
$(window).on("load", function() {
    window.step = window.step || {};
    step.datasources = new DataSourceList;
    step.datasources.fetch();

//    step.options = new OptionsList;
//    step.options.fetch();
    
    if(step.datasources.length == 0) {
        var ds = [{ name: DS_VERSIONS, remoteUrl: MODULE_GET_ALL_MODULES, remoteParams: ["true"], ttl: TTL_DAY }];
        step.datasources.add(ds);
    }
    step.datasources.refresh();
    
    //setup views
    require(["select2"], function (module) {
        new MainSearchView({
            model: { data: step.datasources }
        });
    });

    step.passages = new PassageModelList();
    step.passages.fetch();

    //create passage if not present
    step.passages.add(new PassageModel({ passageId: 0, data: undefined }));
    
    new PassageMenuView({
        model: step.passages.at(0)
    });
    
    step.router = new StepRouter();
    Backbone.history.start();
});
