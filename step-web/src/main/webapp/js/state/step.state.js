step.state = {
	detail : {

		store : function(level) {
			$.cookie("detailLevel", level);
		},

		get : function() {
			var level = $.cookie("detailLevel");
			if (level != null || level == "") {
				return parseInt(level);
			} else {
				$.cookie("detailLevel", 0);
			}
		}
	},

	passage: {
		store: function(passageId, version, reference, options, interlinearVersions, start, end, multiRange) {
			this.startVerseId(passageId, start);
			this.endVerseId(passageId, end);
			this.multiRange(passageId, multiRange);
			this.version(passageId, version, false);
			this.reference(passageId, reference, false);
			this.options(passageId, options, false);
			this.interlinearVersions(passageId, interlinearVersions, false); 
			
			//fire change of state 
			this._fireStateChanged(passageId);
		},
		
		hasChanged: function(p, v, r, o, i) {
			return 	this.version(p) != v ||
			 	   	this.reference(p) != r ||
			 	   	!compare(this.options(p), o) ||
			 	   	this.interlinearVersions(p) != i;
		},
		
		restore: function(passageId) {
		    this._restoreVersion(passageId);
		    this._restoreReference(passageId);
			
			//we restore the menu options manually:
			this._restoreMenuOptions(passageId, this.options(passageId));
			this._restoreInterlinearVersions(passageId, this.interlinearVersions(passageId));
			this._restorePassageSync();
			this._fireStateChanged(passageId);
			
			$.shout("application-ready");
		},
		
		version: function(passageId, version, fireChange) {
			if(version) {
				$(".passageVersion", step.util.getPassageContainer(passageId)).val(version);
			}
			return this._storeAndRetrievePassageCookieState(passageId, "version", version, fireChange);
		},

		reference: function(passageId, reference, fireChange) {
			//if we're in sync mode and passageId != 0, then we don't 
			//accept any changes, we return reference of passage 0
			if(passageId != 0 && this.syncMode()) {
				if(reference) {
					//ignore if reference passed in + do not fire state changes
					return;
				}
				
				//if we're asked for a value, return that of passageId=0
				return this._storeAndRetrievePassageCookieState(0, "reference", reference, fireChange);
			} 
			
			//store reference
			var ref = this._storedReference(passageId, reference, fireChange);
			
			if(this.syncMode() && reference) {
				//we need to alert all passages if reference has changed
				this._fireStateChangedAllButFirst();
			}
			
			return ref;
		},
		
		_storedReference: function(passageId, reference, fireChange) {
			if(reference) {
				$(".passageReference", step.util.getPassageContainer(passageId)).val(reference);
			}
			return this._storeAndRetrievePassageCookieState(passageId, "reference", reference, fireChange);
		},
		
		options: function(passageId, options, fireChange) {
			//menus take care of themselves, so no need to do anything here, but call the underlying storage
			return this._storeAndRetrievePassageCookieState(passageId, "options", options, fireChange);
		},

		interlinearVersions: function(passageId, interlinearVersions, fireChange) {
			return this._storeAndRetrievePassageCookieState(passageId, "interlinearVersions", interlinearVersions, fireChange);
		},
		
		syncMode: function(syncMode, fireChange) {
			//always store syncMode against passage 0
			var mode;
			if(syncMode != null) {
				mode = this._storeAndRetrievePassageCookieState(0, "syncMode", syncMode, false);

				//state changed
				this._fireStateChangedAllButFirst();
			} else {
				//check we have something stored...
				mode = this._storeAndRetrievePassageCookieState(0, "syncMode");
				if(isEmpty(mode)) {
					mode = false;
					this._storeAndRetrievePassageCookieState(0, "syncMode", mode, fireChange);
				}
				return mode == true || mode == "true";
			}
		},
		
		range: function(p, s, e, m) {
			this.startVerseId(p, s);
			this.endVerseId(p, e);
			this.multiRange(p, m);
		},
		
		startVerseId: function(passageId, startVerseId) {
			return parseInt(this._storeAndRetrievePassageCookieState(passageId, "startVerseId", startVerseId, false));
		},
		
		endVerseId: function(passageId, endVerseId) {
			return parseInt(this._storeAndRetrievePassageCookieState(passageId, "endVerseId", endVerseId, false));
		},
		
		multiRange: function(passageId, multiRange) {
		    var m = this._storeAndRetrievePassageCookieState(passageId, "multiRange", multiRange, false); 
			return m == true || m == "true";
		},
		
		scrolling: function(passageId, scrolling) {
	        if(this.multiRange(passageId)) {
	            step.util.raiseError("Continuous scrolling cannot be enabled for mutliple ranges");
	            return false;
	        }
		    
	        var s = this._storeAndRetrievePassageCookieState(passageId, "scrolling", scrolling, scrolling == false || scrolling == "false");
		    return s == true || s == "true";
		},
		
		_storeAndRetrievePassageCookieState: function(passageId, key, obj, fireChange) {			
			var originalValue = $.cookie("step.passage." + passageId + "." + key);
			if(obj != null) {
				var newObj = obj;
				if($.isArray(obj)) {
					newObj = obj.join();
				}

				if(newObj != originalValue) {
					//store first
					$.cookie("step.passage." + passageId + "." + key, obj);
					if(fireChange == null || fireChange == true) {
						this._fireStateChanged(passageId);
					}
					
					//then return
					return $.cookie("step.passage." + passageId + "." + key);
				}
			}
			
			return originalValue;
		},

		_restoreMenuOptions: function(passageId, options) {
		    if(step.util.isBlank(options)) {
                //make sure that the state matches the state of the menu items selected
                var opts = step.menu.getSelectedOptionsForMenu(passageId, 'DISPLAY');
                if(opts) {
                    //we read this from the defaults that are already ticked, so just store
                    this.options(passageId, opts, false);
                }
                return;
            }
		    
		    var menuOptions = $.isArray(options) ? options : options.split(",");
            $.shout("initialise-passage-display-options", { passageId: passageId, menuOptions: menuOptions});
        },

        _restoreInterlinearVersions: function(passageId, interlinearVersions) {
            $.shout("initialise-interlinear-versions", { passageId: passageId});
        },
        
        _restorePassageSync: function() {
            $.shout("initialise-passage-sync", this.syncMode());
        },

        _restoreVersion: function(passageId) {            
            var v = this.version(passageId);
            if(!step.util.isBlank(v)) {
                this.version(passageId, v, false);    
            } else {
                //use the pre-populated value
                this.version(passageId, $(".passageVersion", step.util.getPassageContainer(passageId)).val(), false);
            }
        },
        
        _restoreReference: function(passageId) {
            var r = this._storedReference(passageId);
            if(!step.util.isBlank(r)) {
                this._storedReference(passageId, r, false);
            } else {
                this.reference(passageId, $(".passageReference", step.util.getPassageContainer(passageId)).val(), false);
            }
        },

        _fireStateChanged: function(passageId) {
			$.shout("passage-state-has-changed-" + passageId, {passageId: passageId});
		},
		
		_fireStateChangedAllButFirst: function() {
			var self = this;
			var passageIds = step.util.getAllPassageIds();
			if(passageIds) {
				$.each(passageIds, function(i, item) {
					if(item != 0) {
						self._fireStateChanged(item);
					}
				});
			}
		}
	}
};

