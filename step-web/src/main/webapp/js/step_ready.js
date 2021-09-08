(function () {

    function initDataSources() {
        //format the versions correctly
        step.keyedVersions = {};
        step.itemisedVersions = [];
        for (var ii = 0; ii < window.tempVersions.length; ii++) {
            var tempVersion = window.tempVersions[ii];
            var item = {item: tempVersion, itemType: 'version'};
            step.itemisedVersions.push(item);
            step.keyedVersions[tempVersion.initials] = tempVersion;
            step.keyedVersions[tempVersion.shortInitials] = tempVersion;
        }

        //now mark some versions as recommended
        markAsRecommended('ESV');
        markAsRecommended('NIV');
        markAsRecommended('OHB');
        markAsRecommended('SBLG');
        markAsRecommended('LXX');
        markAsRecommended('SBLG');
        markAsRecommended('Neno');
        markAsRecommended('NVI');
        markAsRecommended('PNVI');

        markAsRecommended('FreSegond');
        markAsRecommended('GerElb1905');
        markAsRecommended('GerSch');
        markAsRecommended('ItaRive');
        markAsRecommended('RusSynodal');
        markAsRecommended('NRT');

        //save 100k of space
        window.tempVersions = null;
    };

    function markAsRecommended(version) {
        var v = step.keyedVersions[version];
        if (v) {
            v.recommended = true;
        }
    }

    function initSettings() {
        var settings = new SettingsModelList;
        settings.fetch();
        if (settings.length == 0) {
            var setting = new SettingsModel;
            settings.add(setting);
            setting.save();
        }
        step.settings = settings.at(0);

        //override some particular settings to avoid UI shifting on load:
        //we never open up a related words section
        step.settings.save({relatedWordsOpen: false});
		
		step.touchDevice = false;
		var ua = navigator.userAgent.toLowerCase(); 
		if ((ua.indexOf("android") > -1) || (ua.indexOf("iphone") > -1) || (ua.indexOf("ipad") > -1) ||
			((ua.indexOf("macintosh") > -1) && (navigator.maxTouchPoints == 5))) // iPad requesting a desktop web site
			step.touchDevice = true;
		step.tempKeyInput = "";
		if (!step.touchDevice) {
			var timer;
			$(document).keyup(function(e) {
				if (($('#s2id_masterSearch:visible').length == 0) && ($("textarea:visible").length == 0)) {
					var code = (e.keyCode ? e.keyCode : e.which);
					console.log("key " + code);
					if ((code == 186) || (code == 13)) {
						if (step.tempKeyInput === "t") step.util.startPickBible();
						else if (step.tempKeyInput === "s") step.util.searchSelectionModal();
						step.tempKeyInput = "";
					}
					else if ((code > 64) && (code < 91)) { // 65 = A, 90 = Z
						timer && clearTimeout(timer);
						step.tempKeyInput += String.fromCharCode(code).toLowerCase();
						if (step.tempKeyInput.length >= 2) {
							step.util.passageSelectionModal();
						}
						else {
							timer = setTimeout( function( ) { // If input is less than 2 characters within 1.5 seconds, clear the input
								step.tempKeyInput = "";
							}, 1500);
						}
					}
				}
			});
		}
    };

    function initSearchDropdown() {
        //setup search view
        window.searchView = new MainSearchView();
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
            }
        });
    }

    function identifyLikelyPreviousPassage(firstModel) {
        if (!step.passages || !firstModel) {
            return null;
        }

        var firstReference = firstModel.signature;
        for (var ii = 0; ii < step.passages.length; ii++) {
            var p = step.passages.at(ii);
            if (p.get("signature") == firstReference) {
                //likely to be the same passage (crude, I know!)
                return p;
            }
        }

        return step.passages.at(0);
    }

    function initCoreModelsAndRouter() {
        step.router = new StepRouter();
        step.passages = new PassageModelList();
        step.passages.fetch();
        step.bookmarks = new HistoryModelList();
        step.bookmarks.fetch();


        //need to clean up passages... Ideally, by changing the values of passageIds to be 1,2,3,4,...
        //we reserve 0 for the first column
        for (var ii = 0; ii < step.passages.length; ii++) {
            //start at 1, and go onwards from then
            var p = step.passages.at(ii);
            p.save({
                passageId: ii + 1,
                pageNumber: 1,
                results: p.get("firstPageResults"),
                linked: null
            }, {
                silent: true
            });
        }

        //now passage 0 is the one from the URL
        if (window.tempModel) {
            //because of page size, the 'value' is empty, so we'll need to put this back into the model after everything is over
            var pageValue = $(".passageContainer").find(".passageContent").html().trim();

            //now we can create the correct views
            var modelZero = new PassageModel({passageId: 0, position: -1});
            step.passages.add(modelZero);

            //reset some attributes that weren't on the model to start with (because of space reasons)
            window.tempModel.createSilently = true;
            var likelyPreviousPassage = identifyLikelyPreviousPassage(window.tempModel);

            modelZero.save(window.tempModel, {silent: true});
            modelZero.save({
                isQuickLexicon: likelyPreviousPassage ? likelyPreviousPassage.get("isQuickLexicon") : true,
				isSimilarWord: likelyPreviousPassage ? likelyPreviousPassage.get("isSimilarWord") : true,
				// isEnWithEsLexicon: likelyPreviousPassage ? likelyPreviousPassage.get("isEnWithZhLexicon") : true,
                isEnWithZhLexicon: likelyPreviousPassage ? likelyPreviousPassage.get("isEnWithZhLexicon") : true,
                isVerseVocab: likelyPreviousPassage ? likelyPreviousPassage.get("isVerseVocab") : true,
                results: null,
                linked: null,
                value: pageValue
            }, {silent: true});
            new PassageMenuView({
                model: modelZero
            });

            step.router.handleRenderModel(modelZero, true, $.getUrlVar('q'), -1);

            $(".helpMenuTrigger").one('click', function () {
                require(["view_help_menu"], function () {
                    new ViewHelpMenuOptions({});
                });
            });
        }

        if (step.passages.length == 0) {
            step.passages.add(new PassageModel({passageId: 0}));
        }

        // new ExamplesView({ el: $(".examplesColumn") });
		
	    var stepUsageCountStorageOrCookie = (window.localStorage) ? window.localStorage.getItem("step.usageCount") : $.cookie('step.usageCount');
		var stepUsageCount = parseInt(stepUsageCountStorageOrCookie, 10);
		if (isNaN(stepUsageCount)) stepUsageCount = 0;
		if ((stepUsageCount > 12) && (window.innerWidth > 767)) {
			// step.util.showOrHideTutorial(true);
			step.util.ui.showTutorial();
		}
		else new ExamplesView({ el: $(".examplesColumn") });
		stepUsageCount ++;
		if (window.localStorage) window.localStorage.setItem("step.usageCount", stepUsageCount);
		else $.cookie('step.usageCount', stepUsageCount);

        $("#stepDisclaimer").popover();
    }

    //can this be done before load? self executing function
    function registerColumnChangeEvents() {
        Backbone.Events.listenTo(Backbone.Events, "columnsChanged", function () {
            step.util.reNumberModels();
        });
        step.util.reNumberModels();
    }

    $(window).on("load", function () {
        //disable amd
        define.amd = null;

        //first of all, if we have a fragment, let's get rid of it
        if ((window.location.hash || "").indexOf("#") != -1) {
            window.location.hash = "";
        }

        window.step = window.step || {};
        initSettings();
        initDataSources();
        patchBackboneHistory();
        initCoreModelsAndRouter();
        initSearchDropdown();

        Backbone.history.start({pushState: true, silent: true});

        new FeedbackView();
        if (step.passages.length > 1) {
            //delete all passages that are not passageId: 0
            _.each(step.passages.reject(function (m) {
                return m.get("passageId") == 0
            }), function (m) {
                m.destroy();
            });

            //we restore previous passages
//            new RestorePassageView({ callback: function() {
//                registerColumnChangeEvents();
//            }});
//        } else {
//            registerColumnChangeEvents();
        }

        //do cookie notification
        var countriesRequiringCookie = "UNKNOWN GB DE FR IT ES PL RO NL BE GR SE PT AT BG CY CZ DK EE FI HR HU IE LT LU LV MT SI SK";
        if (countriesRequiringCookie.indexOf(step.userCountryCode) > -1) step.util.raiseOneTimeOnly("cookie_notification", 'info');
        var tmp = localStorage.getItem('colorCode-openStatus');
        if (tmp) {
            localStorage.removeItem('colorCode-openStatus');
            step.util.ui.openStats();
        }
        var tmp = localStorage.getItem('colorCode-InfoMsg');
        if (tmp) {
            localStorage.removeItem('colorCode-InfoMsg');
            if (tmp != '""') step.util.raiseOneTimeOnly(JSON.parse(tmp), 'info');
        }
        if (step.state.getIncompleteLanguage()) {
            step.util.raiseOneTimeOnly("machine_translated", 'info');
        }
        step.util.trackAnalytics('interface', 'language', step.state.language(1));
        if (window.localStorage) {
            var storedVersion = window.localStorage.getItem("step.version");
            var downloadedVersion = step.state.getCurrentVersion();
            if (storedVersion != downloadedVersion) {
                //we're upgrading to the new version
                console.log("Upgrading versions: ", storedVersion, downloadedVersion);
                window.localStorage.setItem("step.version", downloadedVersion);
            }
        }

        //iframe
        if (window != window.top) {
            step.util.showOrHideTutorial(true);
            var button = $("<button class='stepBreakout btn btn-default btn-xs'><span class='glyphicon glyphicon-new-window'></button>");
            $(".headerButtons").append(button);
            button.on("click", function () {
                window.open(window.location);
            });
        }
		if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) $("#panel-icon").hide(); // Firefox has some issues with this.
		step.util.showIntro();
    });
	$( window ).resize(function() {
		step.util.refreshColumnSize();
	});
})();
