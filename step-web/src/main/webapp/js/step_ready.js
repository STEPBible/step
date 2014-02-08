$(window).on("load", function () {
    window.step = window.step || {};
    step.datasources = new DataSourceList;
    step.datasources.fetch();
    step.settings = new SettingsModelList;
    step.settings.fetch();

    if (step.settings.length == 0) {
        step.settings.add(new SettingsModel);
    }

//    step.options = new OptionsList;
//    step.options.fetch();

    if (step.datasources.length == 0) {
        var ds = [
            { name: DS_VERSIONS, remoteUrl: MODULE_GET_ALL_MODULES, remoteParams: ["true"], ttl: TTL_DAY }
        ];
        step.datasources.add(ds);
    }
    step.datasources.refresh();

    //setup views
    require(["select2"], function (module) {
        new MainSearchView({
            model: { data: step.datasources }
        });
    });

    step.router = new StepRouter();
    step.passages = new PassageModelList();
    step.passages.fetch();

    //need to clean up passages... Ideally, by changing the values of passageIds to be 0,1,2,3,4,...
    for (var ii = 0; ii < step.passages.length; ii++) {
        step.passages.at(ii).save({ passageId: ii }, {silent: true });
    }

    //now passage 0 is the one from the URL
    if (window.tempModel) {
        //now we can create the correct views
        var modelZero = step.passages.findWhere({ passageId: 0});
        if(modelZero == undefined) {
            modelZero = new PassageModel({ passageId: 0 });
            step.passages.add(modelZero);
        }
        modelZero.save(window.tempModel);
        new PassageMenuView({
            model: modelZero
        });

        new PassageDisplayView({
            model: modelZero,
            partRendered: true
        });
    }
    //TODO: need to make sure we reset various properties
    //such as filter and pageNumber

    //create passage if not present

    
    if (step.passages.length == 0) {
        step.passages.add(new PassageModel({ passageId: 0 }));
    }


    Backbone.history.start({pushState: true});
});
