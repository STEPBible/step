
$(window).on("load", function() {
    window.step = window.step || {};
    step.datasources = new DataSourceList;
    step.datasources.fetch();
    step.settings = new SettingsModelList;
    step.settings.fetch();
    
    if(step.settings.length == 0) {
        step.settings.add(new SettingsModel);
    }
    
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
    
    //need to clean up passages... Ideally, by changing the values of passageIds to be 0,1,2,3,4,...
    for(var ii = 0; ii < step.passages.length; ii++) {
        step.passages.at(ii).save({ passageId: ii }, {silent: true });
    }
    
    //TODO: need to make sure we reset various properties
    //such as filter and pageNumber
    
    //create passage if not present
    if(step.passages.length == 0) {
        step.passages.add(new PassageModel({ passageId: 0 }));
        
    }
    new PassageMenuView({
        model: step.passages.findWhere({ passageId: 0})
    });
    
    step.router = new StepRouter();
    Backbone.history.start({pushState: true});
});
