(function () {
    function initDataSources() {
        //format the versions correctly
        step.keyedVersions = {};
        step.itemisedVersions = [];
        for(var ii = 0; ii < window.tempVersions.length; ii++) {
            var tempVersion = window.tempVersions[ii];
            var item = { item: tempVersion, itemType : 'version' };
            step.itemisedVersions.push(item);
            step.keyedVersions[tempVersion.initials] = tempVersion;
        }
        //save 100k of space
        window.tempVersions = null;
    };

    function initSettings() {
        var settings = new SettingsModelList;
        settings.fetch();
        if (settings.length == 0) {
            var setting = new SettingsModel;
            settings.add(setting);
            setting.save();
        }
        step.settings = settings.at(0);
    };

    function initSearchDropdown() {
        //setup search view
        var searchView = new MainSearchView();
        //we will sync the URL on load, if and only if there are arguments, i.e. not the home page...
        //to be firmed up
        searchView.syncWithUrl(step.util.activePassage());
    }

    function patchBackboneHistory() {
        //override history in backbone
        Backbone.history = _.extend(Backbone.history, {
            getFragment: function (fragment) {
                if (fragment == null) {
                    var path = window.location.pathname;
                    if (path && path[0] == '/') {
                        path = path.slice(1);
                    }
                    var query = window.location.search;
                    if (query) {
                        path += query;
                    }
                    return path;
                }
                return fragment.replace(/^[#\/]|\s+$/g, '');
            }});
    }

    function initCoreModelsAndRouter() {
        step.router = new StepRouter();
        step.passages = new PassageModelList();
        step.passages.fetch();
        step.bookmarks = new HistoryModelList();
        step.bookmarks.fetch();

        //need to clean up passages... Ideally, by changing the values of passageIds to be 0,1,2,3,4,...
        for (var ii = 0; ii < step.passages.length; ii++) {
            step.passages.at(ii).save({ passageId: ii }, {silent: true });
        }

        //now passage 0 is the one from the URL
        if (window.tempModel) {
            //now we can create the correct views
            var modelZero = step.passages.findWhere({ passageId: 0});
            if (modelZero == undefined) {
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

            $(".helpMenuTrigger").one('click', function () {
                require(["view_help_menu"], function () {
                    new ViewHelpMenuOptions({});
                });
            });
        }
        if (step.passages.length == 0) {
            step.passages.add(new PassageModel({ passageId: 0 }));
        }
    }

    //can this be done before load? self executing function
    $(window).on("load", function () {
        window.step = window.step || {};
        initSettings();
        initDataSources();
        patchBackboneHistory();
        initCoreModelsAndRouter();
        initSearchDropdown();
        Backbone.history.start({pushState: true, silent: true });
    });
})();
