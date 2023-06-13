(function () {

    function initDataSources() {
        //format the versions correctly
        step.keyedVersions = {};
        step.itemisedVersions = [];
        for (var ii = 0; ii < window.bibleVersions.length; ii++) {
            var tempVersion = {};
            var currentVersion = window.bibleVersions[ii];
            tempVersion["initials"] = currentVersion[0];
            tempVersion["name"] = currentVersion[1];
            tempVersion["originalLanguage"] = currentVersion[2];
            tempVersion["languageCode"] = currentVersion[3];
            tempVersion["category"] = currentVersion[4];
            tempVersion["languageName"] = currentVersion[5];
            tempVersion["shortInitials"] = currentVersion[6];
            var trueFalseValues = currentVersion[7].split("");
            tempVersion["hasStrongs"] = (trueFalseValues[0]) === "T" ? true : false;
            tempVersion["hasMorphology"] = (trueFalseValues[1]) === "T" ? true : false;
            tempVersion["hasRedLetter"] = (trueFalseValues[2]) === "T" ? true : false;
            tempVersion["hasNotes"] = (trueFalseValues[3]) === "T" ? true : false;
            tempVersion["hasHeadings"] = (trueFalseValues[4]) === "T" ? true : false;
            tempVersion["questionable"] = (trueFalseValues[5]) === "T" ? true : false;
            tempVersion["hasSeptuagintTagging"] = (trueFalseValues[6]) === "T" ? true : false;
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
        window.bibleVersions = null; // save 68k of space
        for (var i = 0; i < window.availLangs.length; i++) {
            var curElement = window.availLangs[i];
            var currentLang = {};
            currentLang["code"] = curElement[0];
            currentLang["originalLanguageName"] = curElement[1];
            currentLang["userLocaleLanguageName"] = curElement[2];
            var trueFalseValues = curElement[3].split("");
            currentLang["complete"] = (trueFalseValues[0] === "T") ? true : false;
            currentLang["partial"] = (trueFalseValues[1] === "T") ? true : false;
            var newLiElement = "<li ";
            var userLangCode = step.userLanguageCode;
            if (userLangCode === "iw") userLangCode = "he"; // iw is Modern Hebrew and he is old Hebrew
            else if (userLangCode === "in") userLangCode = "id"; // in is the old Indonesia language code
            if (userLangCode === currentLang.code)
                newLiElement += "class=active ";
            if (!currentLang.complete) {
                var title = (currentLang.partial) ? __s.partially_translated : __s.machine_translated;
                newLiElement += 'title="' + title + '" ';
            }
            newLiElement += '><a onclick="window.localStorage.clear(); $.cookie(\'lang\', \'' + 
                currentLang.code + '\')"' + ' lang="' +
                currentLang.code + '" href="/?lang=' + currentLang.code;
            if ($.getUrlVars().indexOf("debug") > -1)
                newLiElement += "&debug";
            newLiElement += '">' + currentLang.originalLanguageName + " - " + currentLang.userLocaleLanguageName;
            if (!currentLang.complete)
                newLiElement += "*";
            newLiElement += "</a></li>";
            $("#languageMenu").append(newLiElement);
        }
        window.availLangs = null; // No longer needed, save 2k of memory
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
                const element = document.getElementById('quickLexicon');
                if ((element) && (typeof element.scrollTop === "number") && ($('#down-arrow').length = 1)) {
                    if ((e.keyCode == 39) || (e.keyCode == 40) || (e.keyCode == 34) || // down arrow, right arrow, page down
                        (e.keyCode == 40) || (e.keyCode == 190)) { // > or alt-right-arrow
                        element.scrollTop += 150;
                        e.preventDefault();
                        return false;
                    } else if ((e.keyCode == 38) || (e.keyCode == 37) || (e.keyCode == 33) || // up arrow, left arrow, page up
                        (e.keyCode == 38) || (e.keyCode == 188)) { // > or alt-right-arrow
                        element.scrollTop = Math.max(0, element.scrollTop - 150);
                        e.preventDefault();
                        return false;
                    }
                }

				if (($('#s2id_masterSearch:visible').length == 0) && ($("textarea:visible").length == 0) &&
                    ($('textarea#userTextInput:visible').length == 0) && // input area of the search modal
					(!e.altKey) && (!e.ctrlKey)) {
					var code = (e.keyCode ? e.keyCode : e.which);
                    if ((code == 188) || (code == 190)) {
                        var pC = $(".passageContainer");
                        if (pC.length > 1) {
                            var curActiveId = $(".passageContainer.active")[0].getAttribute("passage-id");
                            var panelToMakeActive = 0;
                            for (var i = 0; i < pC.length; i ++) {
                                if ($(".passageContainer")[i].getAttribute("passage-id") == curActiveId) {
                                    if (code == 188) {
                                        if (i > 0) panelToMakeActive = i - 1;
                                        else panelToMakeActive = pC.length - 1;
                                    }
                                    else {
                                        if (i < (pC.length - 1)) panelToMakeActive = i + 1;
                                        else panelToMakeActive = 0;
                                    }
                                    step.util.activePassageId(panelToMakeActive);
                                    break;
                                }
                            }
                        }
                        step.tempKeyInput = "";
                    }
                    else if (code == 37) {
                        if (e.shiftKey) $("a.previousChapter").click();
                        else $(".passageContainer.active").find("a.previousChapter").click();
                        step.tempKeyInput = "";
                    }
                    else if (code == 39) {
                        if (e.shiftKey) $("a.nextChapter").click();
                        else $(".passageContainer.active").find("a.nextChapter").click();
                        step.tempKeyInput = "";
                    }
                    else if (code == 187) {
                    	step.util.createNewColumn();
                    	step.tempKeyInput = "";
                    }
                    else if (code == 191) {
                    	step.util.ui.showTutorial();
                    	step.tempKeyInput = "";
                    }
					else if (((code > 48) && (code < 52)) || ((code > 64) && (code < 91))) { // 49 = 1, 51 = 3, 65 = A, 90 = Z
                        var curChar = String.fromCharCode(code).toLowerCase();
                        if (e.shiftKey) {
                            step.tempKeyInput = "";
                            if ((curChar === "t") || (curChar === "b")) step.util.startPickBible();
                            else if (curChar === "s") step.util.searchSelectionModal();
                            else if (curChar === "h") step.util.ui.initSidebar('history');
                            else if ((curChar === "p") || (curChar === "r")) step.util.passageSelectionModal();
                            else if ((curChar === "a") || (curChar === "v")) step.util.ui.initSidebar('analysis');
                            else if (curChar === "c") {
                                $(".sidebar-offcanvas").find("a.glyphicon-remove").click();
                                $("#welcomeExamples").find(".closeColumn").click();
                            }
                        }
                        else {
                            timer && clearTimeout(timer);
                            step.tempKeyInput += curChar;
                            timer = setTimeout( function( ) { // If input is less than 2 characters within 1.5 seconds, clear the input
                                    step.tempKeyInput = "";
                            }, 1500);
                            if (step.tempKeyInput.length >= 2) {
                                var arrayOfTyplicalBooksChapters = JSON.parse(__s.list_of_bibles_books);
                                for (var i = 0; i < arrayOfTyplicalBooksChapters.length; i++) {
                                    var tempVar = arrayOfTyplicalBooksChapters[i][0];
                                    if (!(false || !!document.documentMode)) tempVar = tempVar.normalize("NFD"); // For characters with accent.  For example, Spanish
                                    if (tempVar.replace(/[\u0300-\u036f\s]/g,"").toLowerCase().indexOf(step.tempKeyInput) == 0) {
                                        step.util.passageSelectionModal();
                                        step.tempKeyInput = "";
                                        return;
                                    }
                                }
                                step.tempKeyInput = step.tempKeyInput.substr(1); // does not match any of 66 books, remove the first character
                            }
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
		
        var stepUsageCountStorageOrCookie = step.util.localStorageGetItem("step.usageCount");
        var stepUsageCount = parseInt(stepUsageCountStorageOrCookie, 10);
        if (isNaN(stepUsageCount)) stepUsageCount = 0;
        var urlVars = $.getUrlVars();
        if ((urlVars.indexOf("skipwelcome") > -1) || (urlVars.indexOf("clickvocab") > -1)) {
            step.util.showOrHideTutorial('true'); // URL has skipwelcome
            if (urlVars.indexOf("clickvocab") > -1) {
                var pos = urlVars.q.indexOf("strong=");
                if (pos > -1) {
                    var strongNum = urlVars.q.substring(pos+7).split('|')[0].split('&')[0];
                    step.util.ui.showDef(strongNum);
                }
            }
        }
		else {
			if ((stepUsageCount > 12) && (window.innerWidth > 767)) step.util.ui.showTutorial();
			else new ExamplesView({ el: $(".examplesColumn") });
		}
		stepUsageCount ++;
		step.util.localStorageSetItem("step.usageCount", stepUsageCount);

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


        try {
            var query = $.getUrlVar("q") || "";

            // If the version (i.e., Bible text) is not specified in the URL, then determine
            // the version (and reference) defaults using the recent history

            if (query.search(/version/) == -1) {
                query = query.replace(/%3D/g, '=').replace(/%7C/g, '|');

                var history = new HistoryModelList;
                if (typeof history === "object") {
                history.fetch();
                var histIndex = 0;
                var mostRecentPassage = "";
                while (histIndex < history.length && mostRecentPassage == "") {
                    var histItem = history.at(histIndex);
                        if (typeof histItem === "object") {
                            var histItemArgs = histItem.get("args");
                            if ((typeof histItemArgs === "string") && (histItemArgs.search(/reference/) > -1)) {
                                mostRecentPassage = decodeURIComponent(histItemArgs)
                                    // get the version(s) from the most recent passage in history
                        var pos = mostRecentPassage.search(/version=[^|]+/);
                        var version = "";
                        while (pos > -1) {
                            var ver = RegExp.lastMatch;
                            ver = ver.replace(/version=/, '');
                            if (typeof step.keyedVersions[ver] === "object") {
                                version += 'version=' + ver + '|';
                            }
                            mostRecentPassage = mostRecentPassage.replace(/version=[^|]+/, '');
                            pos = mostRecentPassage.search(/version=[^|]+/);
                        }
                        version = version.replace(/\|$/, '');

                                if (query === "") {
                            // get the reference(s) from the most recent passage in history
                            pos = mostRecentPassage.search(/reference=[^|]+/);
                            while (pos > -1) {
                                query += RegExp.lastMatch + '|';
                                mostRecentPassage = mostRecentPassage.replace(/reference=[^|]+/, '');
                                pos = mostRecentPassage.search(/reference=[^|]+/);
                            }
                            query = query.replace(/\|$/, '');
                        }

                                if (version !== "" && query !== "") {
                            console.log("Opening to '%s'", version + '|' + query);
                                    //                            step.router.navigateSearch(version + '|' + query, true, true);
                                    var histItemOptions = histItem.get("options") || "";
                                    var histItemDisplay = histItem.get("display") || "";
                                    if ((typeof histItemOptions === "string") && (typeof histItemDisplay === "string"))
                                        step.router.doMasterSearch(version + '|' + query, histItemOptions, histItemDisplay);
                                }
                        }
                    }
                    ++histIndex;
                    }
                }
            }
        } catch (e) {
            console.log("navigate to version+query error: ", e);
        }

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
        var tmp = step.util.localStorageGetItem('colorCode-openStatus');
        if (tmp) {
            localStorage.removeItem('colorCode-openStatus');
            step.util.ui.openStats();
        }
        var tmp = step.util.localStorageGetItem('colorCode-InfoMsg');
        if (tmp) {
            localStorage.removeItem('colorCode-InfoMsg');
            if (tmp != '""') step.util.raiseOneTimeOnly(JSON.parse(tmp), 'info');
        }
        if (step.state.getIncompleteLanguage()) {
            step.util.raiseOneTimeOnly("machine_translated", 'info');
        }
        step.util.trackAnalytics('interface', 'language', step.state.language(1));
        if (window.localStorage) {
            var storedVersion = step.util.localStorageGetItem("step.version");
            var downloadedVersion = step.state.getCurrentVersion();
            if (storedVersion != downloadedVersion) {
                //we're upgrading to the new version
                console.log("Upgrading versions: ", storedVersion, downloadedVersion);
                step.util.localStorageSetItem("step.version", downloadedVersion);
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
		var ua = navigator.userAgent.toLowerCase();
		if (ua.indexOf('firefox') > -1) $("#panel-icon").hide(); // Firefox has some issues with this.
		var pos = Math.max(ua.indexOf("ipad"), ua.indexOf("iphone"));
        if ((typeof navigator.clipboard !== "object") || (typeof navigator.clipboard.writeText !== "function"))
            $("#copy-icon").hide();
		if ( ((pos > -1) && (ua.substr(pos + 4).search(/ cpu os [345678]_/) > -1)) || // older versions of iOS shows a light grey color.  Probably similiar issue as Internet Explorer
			(false || !!document.documentMode) ) { // Internet Explorer use the wrong css based on the <a> tag, so change it to black
			$("#panel-icon").css("color", "black");
			$("#stats-icon").css("color", "black");
			$("#bookmark-icon").css("color", "black");
			$("#examples-icon").css("color", "black");
			$("#fonts-icon").css("color", "black");
			$("#languages-icon").css("color", "black");
			$(".icon-language").css("color", "black");
			$("#raiseSupportTrigger").css("color", "black");
			$("#more-icon").css("color", "black");
		}
		step.util.showIntro();
    });
	$( window ).resize(function() {
		step.util.refreshColumnSize();
	});
})();
