import MessageUI

var mySWORDPlugin:SWORD? = nil


@objc(SWORD) class SWORD : CDVPlugin, MFMessageComposeViewControllerDelegate {
	var mgr = 0;
	var installMgr = 0
	var disclaimerConfirmed = false;

	var VERSEKEY_BOOK = Int(org_crosswire_sword_SWModule_VERSEKEY_BOOK);
	var VERSEKEY_CHAPTER = Int(org_crosswire_sword_SWModule_VERSEKEY_CHAPTER);
	var VERSEKEY_VERSE = Int(org_crosswire_sword_SWModule_VERSEKEY_VERSE);
	var VERSEKEY_TESTAMENT = Int(org_crosswire_sword_SWModule_VERSEKEY_TESTAMENT);
	var VERSEKEY_OSISREF = Int(org_crosswire_sword_SWModule_VERSEKEY_OSISREF);
	var VERSEKEY_CHAPTERMAX = Int(org_crosswire_sword_SWModule_VERSEKEY_CHAPTERMAX);
	var VERSEKEY_VERSEMAX = Int(org_crosswire_sword_SWModule_VERSEKEY_VERSEMAX);
	var VERSEKEY_BOOKNAME = Int(org_crosswire_sword_SWModule_VERSEKEY_BOOKNAME);
	var VERSEKEY_SHORTTEXT = Int(org_crosswire_sword_SWModule_VERSEKEY_SHORTTEXT);
	var VERSEKEY_BOOKABBREV = Int(org_crosswire_sword_SWModule_VERSEKEY_BOOKABBREV);
	var VERSEKEY_OSISBOOKNAME = Int(org_crosswire_sword_SWModule_VERSEKEY_OSISBOOKNAME);

    var LOG_ERROR = Int32(org_crosswire_sword_SWLog_LOG_ERROR);
    var LOG_WARN = Int32(org_crosswire_sword_SWLog_LOG_WARN);
    var LOG_INFO = Int32(org_crosswire_sword_SWLog_LOG_INFO);
    var LOG_TIMEDINFO = Int32(org_crosswire_sword_SWLog_LOG_TIMEDINFO);
    var LOG_DEBUG = Int32(org_crosswire_sword_SWLog_LOG_DEBUG);

	@objc(initSWORD:)
	func initSWORD(command: CDVInvokedUrlCommand) {
		mgr = 0
		installMgr = 0
		disclaimerConfirmed = false
		mySWORDPlugin = nil
		VERSEKEY_BOOK = Int(org_crosswire_sword_SWModule_VERSEKEY_BOOK);
		VERSEKEY_CHAPTER = Int(org_crosswire_sword_SWModule_VERSEKEY_CHAPTER);
		VERSEKEY_VERSE = Int(org_crosswire_sword_SWModule_VERSEKEY_VERSE);
		VERSEKEY_TESTAMENT = Int(org_crosswire_sword_SWModule_VERSEKEY_TESTAMENT);
		VERSEKEY_OSISREF = Int(org_crosswire_sword_SWModule_VERSEKEY_OSISREF);
		VERSEKEY_CHAPTERMAX = Int(org_crosswire_sword_SWModule_VERSEKEY_CHAPTERMAX);
		VERSEKEY_VERSEMAX = Int(org_crosswire_sword_SWModule_VERSEKEY_VERSEMAX);
		VERSEKEY_BOOKNAME = Int(org_crosswire_sword_SWModule_VERSEKEY_BOOKNAME);
		VERSEKEY_SHORTTEXT = Int(org_crosswire_sword_SWModule_VERSEKEY_SHORTTEXT);
		VERSEKEY_BOOKABBREV = Int(org_crosswire_sword_SWModule_VERSEKEY_BOOKABBREV);
		VERSEKEY_OSISBOOKNAME = Int(org_crosswire_sword_SWModule_VERSEKEY_OSISBOOKNAME);

        LOG_ERROR = Int32(org_crosswire_sword_SWLog_LOG_ERROR);
        LOG_WARN = Int32(org_crosswire_sword_SWLog_LOG_WARN);
        LOG_INFO = Int32(org_crosswire_sword_SWLog_LOG_INFO);
        LOG_TIMEDINFO = Int32(org_crosswire_sword_SWLog_LOG_TIMEDINFO);
        LOG_DEBUG = Int32(org_crosswire_sword_SWLog_LOG_DEBUG);

        org_crosswire_sword_SWLog_setLogLevel(LOG_ERROR);
        
		org_crosswire_sword_StringMgr_setToUpper({ (text: Optional<UnsafePointer<Int8>>, maxBytes: u_long) in
			let lower = String(cString: text!)
			let upper = lower.uppercased()
			strncpy(UnsafeMutablePointer<Int8>(mutating: text), upper, Int(maxBytes));
			return UnsafeMutablePointer<Int8>(mutating: text)
		})

		initMgr()

		let libswordVersion = String(cString: org_crosswire_sword_SWMgr_version(mgr))
		debugPrint("libswordVersion: " + libswordVersion)
        let info = [
            "version": libswordVersion
        ] as [AnyHashable : Any]
		self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: info), callbackId: command.callbackId)
	}


	func myToast(message: String) {
		let toastController: UIAlertController = UIAlertController(title: "", message: message, preferredStyle: .alert)
		self.viewController?.present(toastController, animated: true, completion: nil)
		DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
			toastController.dismiss(animated: true, completion: nil)
		}
	}


	func initMgr() {
		if (mgr == 0) {
			let baseDir = (FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.path)! + "/sword";
			mgr = org_crosswire_sword_SWMgr_newWithPath(baseDir)
            org_crosswire_sword_SWMgr_setGlobalOption(mgr, "Footnotes", "On")
            org_crosswire_sword_SWMgr_setGlobalOption(mgr, "Cross-references", "On")
debugPrint("initMgr, mgr: " + String(describing: mgr))
		}
	}


	func reinitMgr() {
		if (mgr != 0) {
			org_crosswire_sword_SWMgr_delete(mgr)
		}
		mgr = 0
		initMgr()
	}

    
    func reinitInstall() {
        if (installMgr != 0) {
            org_crosswire_sword_InstallMgr_delete(installMgr)
        }
        installMgr = 0
        initInstall()
    }
    
    func logError(message: String) {
        org_crosswire_sword_SWLog_logError(message)
    }
    func logDebug(message: String) {
        org_crosswire_sword_SWLog_logDebug(message)
    }
    func logWarning(message: String) {
        org_crosswire_sword_SWLog_logWarning(message)
    }
    func logInformation(message: String) {
        org_crosswire_sword_SWLog_logInformation(message)
    }
    func logTimedInformation(message: String) {
        org_crosswire_sword_SWLog_logTimedInformation(message)
    }

    
    func initInstall() {
    
        if (installMgr == 0) {
            logDebug(message: "initInstall: installMgr is null");
            let baseDir = (FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.path)! + "/sword";
            installMgr = org_crosswire_sword_InstallMgr_new(baseDir, { (message: Optional<UnsafePointer<Int8>>, totalBytes: u_long, completedBytes: u_long) in
                let msg = String(cString: message!)
                if (msg == "update") {
                    let response = [
                        "status": "update",
                        "totalBytes": totalBytes,
                        "completedBytes": completedBytes
                        ] as [String : Any]
                    if (mySWORDPlugin != nil && mySWORDPlugin!.callbackID != "") {
                        let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: response)
                        result?.setKeepCallbackAs(true)
                        mySWORDPlugin!.commandDelegate!.send(result, callbackId: mySWORDPlugin!.callbackID)
                    }
                }
                else {
                    let response = [
                        "status": "preStatus",
                        "totalBytes": totalBytes,
                        "completedBytes": completedBytes,
                        "message": msg
                        ] as [String : Any]
                    if (mySWORDPlugin != nil && mySWORDPlugin!.callbackID != "") {
                        let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: response)
                        result?.setKeepCallbackAs(true)
                        mySWORDPlugin!.commandDelegate!.send(result, callbackId: mySWORDPlugin!.callbackID)
                    }
                }
            })
            if (disclaimerConfirmed) {
                org_crosswire_sword_InstallMgr_setUserDisclaimerConfirmed(installMgr)
            }
            logDebug(message: "initInstall: instantiated InstallMgr with baseDir: \(baseDir)");
        }
    }

	@objc(SWMgr_getModuleByName:)
	func SWMgr_getModuleByName(command: CDVInvokedUrlCommand) {

		initMgr();

		let modName = command.arguments[0] as? String ?? ""
        let module = org_crosswire_sword_SWMgr_getModuleByName(mgr, modName)

        if (module == 0) {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK), callbackId: command.callbackId)
            return
        }
        
        let name = org_crosswire_sword_SWModule_getName(module)
        let description = org_crosswire_sword_SWModule_getDescription(module)
        let category = org_crosswire_sword_SWModule_getCategory(module)

        var response = [
            "name": name == nil ? "" : String(cString: name!),
            "description": description == nil ? "" : String(cString: description!),
            "category": category == nil ? "" : String(cString: category!)
        ]
        let language = org_crosswire_sword_SWModule_getConfigEntry(module, "Lang")
        response["language"] =  language == nil ? "" : String(cString: language!)
        let direction = org_crosswire_sword_SWModule_getConfigEntry(module, "Direction")
        response["direction"] =  direction == nil ? "" : String(cString: direction!)
        let font = org_crosswire_sword_SWModule_getConfigEntry(module, "Font")
        response["font"] =  font == nil ? "" : String(cString: font!)
        let shortCopyright = org_crosswire_sword_SWModule_getConfigEntry(module, "ShortCopyright")
        response["shortCopyright"] =  shortCopyright == nil ? "" : String(cString: shortCopyright!)
        let cipherKey = org_crosswire_sword_SWModule_getConfigEntry(module, "CipherKey")
        if (cipherKey != nil) {
            response["cipherKey"] = String(cString: cipherKey!)
        }
        let shortPromo = org_crosswire_sword_SWModule_getConfigEntry(module, "ShortPromo")
        response["shortPromo"] = shortPromo == nil ? "" : String(cString: shortPromo!)


		self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: response), callbackId: command.callbackId)
	}



    @objc(SWMgr_addExtraConfig:)
    func SWMgr_addExtraConfig(command: CDVInvokedUrlCommand) {
        let blob = command.arguments[0] as? String ?? ""
        let baseDir = (FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.path)! + "/sword";
        let confPath = baseDir + "/extraConfig.conf";
        let retVal = getStringArray(buffer: org_crosswire_sword_SWConfig_augmentConfig(confPath, blob))
	self.reinitMgr()
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
    }
    
    
    @objc(SWMgr_setExtraConfigValue:)
    func SWMgr_setExtraConfigValue(command: CDVInvokedUrlCommand) {
        let section = command.arguments[0] as? String ?? ""
        let key = command.arguments[1] as? String ?? ""
        let val = command.arguments[2] as? String ?? ""
        let baseDir = (FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.path)! + "/sword";
        let confPath = baseDir + "/extraConfig.conf";
        org_crosswire_sword_SWConfig_setKeyValue(confPath, section, key, val)
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWMgr_setExtraConfigValue"), callbackId: command.callbackId)
    }

    
    @objc(SWMgr_getExtraConfigValue:)
    func SWMgr_getExtraConfigValue(command: CDVInvokedUrlCommand) {
        let section = command.arguments[0] as? String ?? ""
        let key = command.arguments[1] as? String ?? ""
        let baseDir = (FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.path)! + "/sword";
        let confPath = baseDir + "/extraConfig.conf";
        let keyVal = org_crosswire_sword_SWConfig_getKeyValue(confPath, section, key)
        let retVal = keyVal == nil ? nil : String(cString:keyVal!)
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
    }
    
    
    @objc(SWMgr_getExtraConfigKeys:)
    func SWMgr_getExtraConfigKeys(command: CDVInvokedUrlCommand) {
        let section = command.arguments[0] as? String ?? ""
        let baseDir = (FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.path)! + "/sword";
        let confPath = baseDir + "/extraConfig.conf";
        let retVal = getStringArray(buffer: org_crosswire_sword_SWConfig_getSectionKeys(confPath, section))
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
    }

    
	@objc(SWMgr_getExtraConfigSections:)
	func SWMgr_getExtraConfigSections(command: CDVInvokedUrlCommand) {
		let baseDir = (FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.path)! + "/sword";
		let confPath = baseDir + "/extraConfig.conf";
        let retVal = getStringArray(buffer: org_crosswire_sword_SWConfig_getSections(confPath))
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
  }


    @objc(SWMgr_getAvailableLocales:)
    func SWMgr_getAvailableLocales(command: CDVInvokedUrlCommand) {
	initMgr()
        let retVal = getStringArray(buffer: org_crosswire_sword_SWMgr_getAvailableLocales(mgr))
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
    }


    @objc(SWMgr_setDefaultLocale:)
    func SWMgr_setDefaultLocale(command: CDVInvokedUrlCommand) {
        initMgr()
        let localeName = command.arguments[0] as? String ?? ""
        org_crosswire_sword_SWMgr_setDefaultLocale(mgr, localeName)
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWMgr_setDefaultLocale"), callbackId: command.callbackId)
    }
    

    @objc(SWMgr_translate:)
    func SWMgr_translate(command: CDVInvokedUrlCommand) {

        initMgr()

        let text = command.arguments[0] as? String ?? ""
        let localeName = command.arguments[1] as? String ?? ""

        let translated = org_crosswire_sword_SWMgr_translate(mgr, text, localeName == "null" || localeName == "" ? nil : localeName)
        let retVal = translated == nil ? nil : String(cString:translated!)
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
    }
    

    @objc(SWMgr_getPrefixPath:)
    func SWMgr_getPrefixPath(command: CDVInvokedUrlCommand) {

        initMgr()

        let prefixPath = org_crosswire_sword_SWMgr_getPrefixPath(mgr)
        let retVal = prefixPath == nil ? nil : String(cString:prefixPath!)
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
    }

    
    @objc(echo:)
    func echo(command: CDVInvokedUrlCommand) {
        let msg = command.arguments[0] as? String ?? ""
        myToast(message: msg)
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: msg), callbackId: command.callbackId)
    }
    
    
    @objc(HTTPUtils_makeRequest:)
    func HTTPUtils_makeRequest(command: CDVInvokedUrlCommand) {
        var url = command.arguments[0] as? String ?? ""
        let postData = command.arguments[1] as? String ?? ""
        let method = command.arguments[2] as? Int ?? 1
        
        if method == 1 {
            url += "?" + postData
        }
        var request = URLRequest(url: URL(string: url)!)
        request.httpMethod = method == 1 ? "GET" : "POST"
        if method == 2 {
            request.httpBody = postData.data(using: .utf8)
        }
        let session = URLSession.shared
        session.dataTask(with: request) {data, response, err in
            let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: String(data: data!, encoding: String.Encoding.utf8))
            pluginResult?.setKeepCallbackAs(false)
            self.commandDelegate!.send(pluginResult, callbackId: command.callbackId)
        }.resume()

        let pluginResult = CDVPluginResult(status: CDVCommandStatus_NO_RESULT)
        pluginResult?.setKeepCallbackAs(true)
        self.commandDelegate!.send(pluginResult, callbackId: command.callbackId)
  }
    
    
    @objc(SWModule_getBookNames:)
    func SWModule_getBookNames(command: CDVInvokedUrlCommand) {
        initMgr()
        let mod = getModule(command: command)
        var retVal = [[AnyHashable : Any]]()
        org_crosswire_sword_SWModule_begin(mod)
        while (org_crosswire_sword_SWModule_popError(mod) == 0) {
            let vkInfo = getStringArray(buffer: org_crosswire_sword_SWModule_getKeyChildren(mod));
            let bookInfo = [
                "name": vkInfo[VERSEKEY_BOOKNAME],
                "abbrev": vkInfo[VERSEKEY_BOOKABBREV],
                "osisName": vkInfo[VERSEKEY_OSISBOOKNAME],
                "chapterMax": Int(vkInfo[VERSEKEY_CHAPTERMAX]),
            ] as [AnyHashable : Any]
            retVal.append(bookInfo)

            org_crosswire_sword_SWModule_setKeyText(mod, "+book")
        }
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
    }
    
    
    @objc(SWModule_getVerseKey:)
    func SWModule_getVerseKey(command: CDVInvokedUrlCommand) {
        initMgr()
        let module = getModule(command: command)
        if (module != 0) {
            let retVal = getVerseKey(keyChildren: getStringArray(buffer: org_crosswire_sword_SWModule_getKeyChildren(module)))
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }


    @objc(SWModule_begin:)
    func SWModule_begin(command: CDVInvokedUrlCommand) {
        initMgr()
        let mod = getModule(command: command)
        if (mod != 0) {
            org_crosswire_sword_SWModule_begin(mod)
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWModule_begin"), callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }

    
    @objc(SWModule_previous:)
    func SWModule_previous(command: CDVInvokedUrlCommand) {
        initMgr()
        let mod = getModule(command: command)
        if (mod != 0) {
            org_crosswire_sword_SWModule_previous(mod)
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWModule_previous"), callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }
    
    
    @objc(SWModule_next:)
    func SWModule_next(command: CDVInvokedUrlCommand) {
        initMgr()
        let mod = getModule(command: command)
        if (mod != 0) {
            org_crosswire_sword_SWModule_next(mod)
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWModule_next"), callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }
    
    
    @objc(SWModule_popError:)
    func SWModule_popError(command: CDVInvokedUrlCommand) {
        initMgr()
        let mod = getModule(command: command)
        if (mod != 0) {
            let error = Int(org_crosswire_sword_SWModule_popError(mod))
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: error), callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }
    
    
    @objc(SWModule_getEntryAttribute:)
    func SWModule_getEntryAttribute(command: CDVInvokedUrlCommand) {
        initMgr()
        let mod = getModule(command: command)
        if (mod != 0) {
            let retVal = getStringArray(buffer: org_crosswire_sword_SWModule_getEntryAttribute(mod, command.arguments[1] as? String ?? "", command.arguments[2] as? String ?? "", command.arguments[3] as? String ?? "", (command.arguments[4] as? Bool ?? false) ? 1 : 0))
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }
    
    @objc(SWModule_parseKeyList:)
    func SWModule_parseKeyList(command: CDVInvokedUrlCommand) {
        initMgr()
        let mod = getModule(command: command)
        if (mod != 0) {
            let retVal = getStringArray(buffer: org_crosswire_sword_SWModule_parseKeyList(mod, command.arguments[1] as? String ?? ""))
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }
    
    @objc(SWModule_getConfigEntry:)
    func SWModule_getConfigEntry(command: CDVInvokedUrlCommand) {
        initMgr()
        let mod = getModule(command: command, remoteSourceArgNumber: 2)
        if (mod != 0) {
            let val = org_crosswire_sword_SWModule_getConfigEntry(mod, command.arguments[1] as? String ?? "")
            let retVal = val == nil ? nil : String(cString: val!)
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }
    
    
    @objc(SWModule_getKeyChildren:)
    func SWModule_getKeyChildren(command: CDVInvokedUrlCommand) {
        initMgr()
        let mod = getModule(command: command)
        if (mod != 0) {
            let retVal = getStringArray(buffer: org_crosswire_sword_SWModule_getKeyChildren(mod))
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }
    
    
    @objc(SWModule_getRenderHeader:)
    func SWModule_getRenderHeader(command: CDVInvokedUrlCommand) {
        initMgr()
        let mod = getModule(command: command)
        if (mod != 0) {
            let header = String(cString: org_crosswire_sword_SWModule_getRenderHeader(mod))
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: header), callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }
    
    func messageComposeViewController(_ controller: MFMessageComposeViewController, didFinishWith result: MessageComposeResult) {
        self.webView.inputViewController?.dismiss(animated: true, completion: {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK), callbackId: self.callbackID)
        })
    }

    func sendVerse(module: Int, keyText: String) {
        if MFMessageComposeViewController.canSendText() {
            let controller = MFMessageComposeViewController()
            let verseKey = getStringArray(buffer: org_crosswire_sword_SWModule_getKeyChildren(module))
            let modName = String(cString: org_crosswire_sword_SWModule_getName(module))
            let verseText = String(cString: org_crosswire_sword_SWModule_stripText(module))
            
            
            controller.body = verseText + " --" + verseKey[VERSEKEY_SHORTTEXT] + " (" + modName + ")"
            controller.recipients = [""]
            controller.messageComposeDelegate = self
            self.webView.inputViewController?.present(controller, animated: true, completion: nil)
        }
    }
    @objc(SWModule_sendText:)
    func SWModule_sendText(command: CDVInvokedUrlCommand) {
        initMgr()
// Switch this to use cordova social plugin
        let mod = getModule(command: command)
        if (mod != 0) {
            mySWORDPlugin = self
            callbackID = command.callbackId
            let keyText = String(cString: org_crosswire_sword_SWModule_getKeyText(mod))
            sendVerse(module: mod, keyText: keyText)
            let result = CDVPluginResult(status: CDVCommandStatus_NO_RESULT)
            result?.setKeepCallbackAs(true)
            self.commandDelegate!.send(result, callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }

    @objc(SWMgr_setGlobalOption:)
    func SWMgr_setGlobalOption(command: CDVInvokedUrlCommand) {
        initMgr()
        let option = command.arguments[0] as? String ?? ""
        let value = command.arguments[1] as? String ?? ""
        org_crosswire_sword_SWMgr_setGlobalOption(mgr, option, value)
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWModule_setGlobalOption"), callbackId: command.callbackId)
    }
    
    @objc(SWModule_getRenderText:)
    func SWModule_getRenderText(command: CDVInvokedUrlCommand) {
        initMgr()
        let mod = getModule(command: command)
        if (mod != 0) {
            let retVal = String(cString: org_crosswire_sword_SWModule_renderText(mod))
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }
    
    @objc(SWModule_getStripText:)
    func SWModule_getStripText(command: CDVInvokedUrlCommand) {
        initMgr()
        let mod = getModule(command: command)
        if (mod != 0) {
            let retVal = String(cString: org_crosswire_sword_SWModule_stripText(mod))
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }
    
    @objc(SWModule_getRawEntry:)
    func SWModule_getRawEntry(command: CDVInvokedUrlCommand) {
        initMgr()
        let mod = getModule(command: command)
        if (mod != 0) {
            let retVal = String(cString: org_crosswire_sword_SWModule_getRawEntry(mod))
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }

    
    @objc(SWMgr_startBibleSync:)
    func SWMgr_startBibleSync(command: CDVInvokedUrlCommand) {
        initMgr()
        let appName = command.arguments[0] as? String ?? ""
        let userName = command.arguments[1] as? String ?? ""
        let passphrase = command.arguments[2] as? String ?? ""
            bibleSyncCallbackID = command.callbackId
            DispatchQueue.global().async {
                mySWORDPlugin = self
                org_crosswire_sword_SWMgr_startBibleSync(self.mgr, appName, userName, passphrase, { (cmd : Int8, str1: Optional<UnsafePointer<Int8>>, str2: Optional<UnsafePointer<Int8>>) in
                    let response1 = String(cString: str1!)
                    let response2 = String(cString: str2!)
                    if (mySWORDPlugin != nil && mySWORDPlugin!.bibleSyncCallbackID != "") {
			if (cmd == CChar("N")) {
				var retVal = [String:Any]()
				retVal["cmd"]     = "nav";
				retVal["osisRef"] = response1;
				let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal)
				result?.setKeepCallbackAs(true)
				mySWORDPlugin!.commandDelegate!.send(result, callbackId: mySWORDPlugin!.bibleSyncCallbackID)
			}
			else if (cmd == CChar("C")	) {
				var retVal = [String:Any]()
				retVal["cmd"]     = "chat";
				retVal["user"]    = response1;
				retVal["message"] = response2;
				let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal)
				result?.setKeepCallbackAs(true)
				mySWORDPlugin!.commandDelegate!.send(result, callbackId: mySWORDPlugin!.bibleSyncCallbackID)
			}
                    }
                });
                
                self.bibleSyncCallbackID = ""
                
                let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWMgr_startBibleSync finished")
                result?.setKeepCallbackAs(false)
                self.commandDelegate!.send(result, callbackId: command.callbackId)
            }
            
            let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWMgr_startBibleSync")
            result?.setKeepCallbackAs(true)
            self.commandDelegate!.send(result, callbackId: command.callbackId)
    }
    
    @objc(SWMgr_stopBibleSync:)
    func SWMgr_stopBibleSync(command: CDVInvokedUrlCommand) {
        initMgr()
        org_crosswire_sword_SWMgr_stopBibleSync(mgr)
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWMgr_stopBibleSync"), callbackId: command.callbackId)
    }
    
    @objc(SWMgr_sendBibleSyncMessage:)
    func SWMgr_sendBibleSyncMessage(command: CDVInvokedUrlCommand) {
        initMgr()
        let osisRef = command.arguments[0] as? String ?? ""
        org_crosswire_sword_SWMgr_sendBibleSyncMessage(mgr, osisRef)
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWMgr_sendBibleSyncMessage"), callbackId: command.callbackId)
    }
    
    
    @objc(SWModule_getRenderChapter:)
    func SWModule_getRenderChapter(command: CDVInvokedUrlCommand) {
        initMgr()
        
//        DispatchQueue.global().async {
            self.initMgr()
            let masterMod = self.getModule(command: command, nameArgNumber: 0)
            let mod = self.getModule(command: command, nameArgNumber: 1)
            if (masterMod != 0 && mod != 0) {
                let r = self.renderChapter(masterMod: masterMod, mod: mod)
                self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: r), callbackId: command.callbackId)
            }
//        }
/*
        var pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWModule_getRenderChapter")
        pluginResult?.setKeepCallbackAs(true)
        self.commandDelegate!.send(pluginResult, callbackId: command.callbackId)
*/
    }

    func renderChapter(masterMod: Int, mod: Int) -> [[String: Any]] {
        let saveMasterKey = String(cString: org_crosswire_sword_SWModule_getKeyText(masterMod))
        let saveKey = String(cString: org_crosswire_sword_SWModule_getKeyText(mod))
        var r = [[String: Any]]()
        var currentKey = getStringArray(buffer: org_crosswire_sword_SWModule_getKeyChildren(masterMod))
        let book = currentKey[VERSEKEY_BOOKABBREV]
        let chapter = currentKey[VERSEKEY_CHAPTER]
        org_crosswire_sword_SWModule_setKeyText(masterMod, book + "." + chapter + ".1")
        var verseKey = getStringArray(buffer: org_crosswire_sword_SWModule_getKeyChildren(masterMod))
        while (org_crosswire_sword_SWModule_popError(masterMod) == 0
            && currentKey[VERSEKEY_BOOK] == verseKey[VERSEKEY_BOOK]
            && currentKey[VERSEKEY_CHAPTER] == verseKey[VERSEKEY_CHAPTER]
            ) {
                org_crosswire_sword_SWModule_setKeyText(mod, verseKey[VERSEKEY_OSISREF])
                let error = org_crosswire_sword_SWModule_popError(mod)
                var v = [String:Any]()
                if (error == 0) {
                    v["verse"] = getVerseKey(keyChildren: getStringArray(buffer: org_crosswire_sword_SWModule_getKeyChildren(mod)))
                    v["text"] = String(cString: org_crosswire_sword_SWModule_renderText(mod))
                    var preVerse = ""
                    for i in getStringArray(buffer: org_crosswire_sword_SWModule_getEntryAttribute(mod, "Heading", "Preverse", "", 1)) {
                        preVerse += i
                    }
                    v["preVerse"] = preVerse
                }
                else {
                    
                }
                r.append(v)
                org_crosswire_sword_SWModule_next(masterMod)
                verseKey = getStringArray(buffer: org_crosswire_sword_SWModule_getKeyChildren(masterMod))
        }
        org_crosswire_sword_SWModule_setKeyText(masterMod, saveMasterKey)
        org_crosswire_sword_SWModule_setKeyText(mod, saveKey)
        
        return r
        
    }
    
    func getVerseKey(keyChildren:[String]) -> [String:Any] {
        var retVal = [String:Any]()
        if (keyChildren.count > 9) {
            retVal["testament"]    = Int(keyChildren[VERSEKEY_TESTAMENT]);
            retVal["book"]         = Int(keyChildren[VERSEKEY_BOOK]);
            retVal["chapter"]      = Int(keyChildren[VERSEKEY_CHAPTER]);
            retVal["verse"]        = Int(keyChildren[VERSEKEY_VERSE]);
            retVal["chapterMax"]   = Int(keyChildren[VERSEKEY_CHAPTERMAX]);
            retVal["verseMax"]     = Int(keyChildren[VERSEKEY_VERSEMAX]);
            retVal["bookName"]     = keyChildren[VERSEKEY_BOOKNAME];
            retVal["osisRef"]      = keyChildren[VERSEKEY_OSISREF];
            retVal["shortText"]    = keyChildren[VERSEKEY_SHORTTEXT];
            retVal["bookAbbrev"]   = keyChildren[VERSEKEY_BOOKABBREV];
            retVal["osisBookName"] = keyChildren[VERSEKEY_OSISBOOKNAME];
        }
        return retVal;
    }

    
    @objc(SWModule_search:)
    func SWModule_search(command: CDVInvokedUrlCommand) {
        initMgr()
        let mod = getModule(command: command)
        if (mod != 0) {
            let expression = command.arguments[1] as? String ?? ""
            let searchType = command.arguments[2] as? Int32 ?? 0
            let flags = command.arguments[3] as? Int ?? 0
            let scope = command.arguments.count < 5 ? nil : command.arguments[4] as? String ?? nil
            callbackID = command.callbackId
            DispatchQueue.global().async {
                mySWORDPlugin = self
                let buffer = org_crosswire_sword_SWModule_search(mod, expression, searchType, flags, scope, { (percent: Int32) in
                    let response = [
                        "status": "update",
                        "percent": percent
                        ] as [String : Any]
                    if (mySWORDPlugin != nil && mySWORDPlugin!.callbackID != "") {
                        let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: response)
                        result?.setKeepCallbackAs(true)
                        mySWORDPlugin!.commandDelegate!.send(result, callbackId: mySWORDPlugin!.callbackID)
                    }
                });
                
                self.callbackID = ""
                var response = [
                    "status": "complete",
                    "percent": 100
                ] as [String : Any]

                var b = buffer
                var count = 0
                while let i = b?.pointee {
                    if i.key == nil {
                        break
                    }
                    count = count + 1
                    b = b?.advanced(by: 1)
                }
                let searchResults = UnsafeBufferPointer<org_crosswire_sword_SearchHit>(start: buffer, count: count);
                var results = [[String:Any]]()
                for i in searchResults {
                    let sr = [
                        "key": String(cString: i.key),
                        "score": Int(i.score)
                    ] as [String : Any]
                    results.append(sr)
                }
                response["results"] = results
                
                let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: response)
                result?.setKeepCallbackAs(false)
                self.commandDelegate!.send(result, callbackId: command.callbackId)
            }
            
            let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWModule_search")
            result?.setKeepCallbackAs(true)
            self.commandDelegate!.send(result, callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR), callbackId: command.callbackId)
        }
    }
    
    
    func getModule(command: CDVInvokedUrlCommand, nameArgNumber: Int = 0, remoteSourceArgNumber: Int = -1) -> Int {
        initMgr()
        let modName = command.arguments[nameArgNumber] as? String ?? ""
        let sourceName = remoteSourceArgNumber == -1 ? "" : command.arguments[remoteSourceArgNumber] as? String ?? ""
        var module = 0;
        if (sourceName != "") {
            logDebug(message: "remoteSourceName: \(sourceName)");
            initInstall()
            module = org_crosswire_sword_InstallMgr_getRemoteModuleByName(installMgr, sourceName, modName)
        }
        else {
            module = org_crosswire_sword_SWMgr_getModuleByName(mgr, modName)
        }
        if (module == 0) {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs: "couldn't find module \(modName)"), callbackId: command.callbackId)
        }
        return module
    }
    
    
    @objc(SWModule_getKeyText:)
    func SWModule_getKeyText(command: CDVInvokedUrlCommand) {
        let module = getModule(command: command)
        if (module != 0) {
            let keyText = org_crosswire_sword_SWModule_getKeyText(module)
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: keyText == nil ? "" : String(cString: keyText!)), callbackId: command.callbackId)
        }
    }


    @objc(SWModule_setKeyText:)
    func SWModule_setKeyText(command: CDVInvokedUrlCommand) {
        let module = getModule(command: command)
        let keyText = command.arguments[1] as? String ?? ""
        if (module != 0) {
            org_crosswire_sword_SWModule_setKeyText(module, keyText)
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWModule_setKeyText"), callbackId: command.callbackId)
        }
    }


    @objc(SWModule_setRawEntry:)
    func SWModule_setRawEntry(command: CDVInvokedUrlCommand) {
        let module = getModule(command: command)
        let entryText = command.arguments[1] as? String ?? ""
        if (module != 0) {
            org_crosswire_sword_SWModule_setRawEntry(module, entryText)
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWModule_setEntryText"), callbackId: command.callbackId)
        }
    }
    
    
    @objc(InstallMgr_uninstallModule:)
    func InstallMgr_uninstallModule(command: CDVInvokedUrlCommand) {
        initInstall()
        initMgr()
        let retVal = org_crosswire_sword_InstallMgr_uninstallModule(installMgr, mgr, command.arguments[0] as? String ?? "")
        if (retVal == 0) {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: retVal), callbackId: command.callbackId)
        }
        else {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs: retVal), callbackId: command.callbackId)
        }
    }
    
    var callbackID:String = ""
    var bibleSyncCallbackID:String = ""
    @objc(InstallMgr_remoteInstallModule:)
    func InstallMgr_remoteInstallModule(command: CDVInvokedUrlCommand) {
        initInstall()
        initMgr()
        let repo = command.arguments[0] as? String ?? ""
        let modName = command.arguments[1] as? String ?? ""
        callbackID = command.callbackId
        DispatchQueue.global().async {
            mySWORDPlugin = self
            org_crosswire_sword_InstallMgr_remoteInstallModule(self.installMgr, self.mgr, repo, modName)
            
            self.reinitMgr()
            self.callbackID = ""
            let response = [
                "status": "complete",
                "totalBytes": 0,
                "completedBytes": 0,
                "message": "Complete"
                ] as [String : Any]
            let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: response)
            result?.setKeepCallbackAs(false)
            self.commandDelegate!.send(result, callbackId: command.callbackId)
        }

        let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "InstallMgr_remoteInstallModule")
        result?.setKeepCallbackAs(true)
        self.commandDelegate!.send(result, callbackId: command.callbackId)
    }

    
    @objc(InstallMgr_getRemoteModInfoList:)
    func InstallMgr_getRemoteModInfoList(command: CDVInvokedUrlCommand) {
        initInstall()
        initMgr()
        let buffer = org_crosswire_sword_InstallMgr_getRemoteModInfoList(installMgr, mgr, command.arguments[0] as? String ?? "")
        var count = 0
        var b = buffer
        while let i = b?.pointee {
            if (i.name == nil) {
                break
            }
            count = count + 1
            b = b?.advanced(by: 1)
        }
        let modInfoList = Array(UnsafeBufferPointer<org_crosswire_sword_ModInfo>(start: buffer, count: count));
        var mods = [[AnyHashable : Any]]()
        for i in modInfoList {
            var modInfo = [
                "name": String(cString: i.name),
                "description": String(cString: i.description),
                "category": String(cString: i.category),
                "language": String(cString: i.language),
                "delta": String(cString: i.delta),
                "version": String(cString: i.version),
                "features": getStringArray(buffer: i.features)
                ] as [AnyHashable : Any]

            if (i.cipherKey != nil) {
                modInfo["cipherKey"] = String(cString: i.cipherKey)
            }
            mods.append(modInfo)
        }
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: mods), callbackId: command.callbackId)
    }
    
    
    @objc(InstallMgr_getRemoteModuleByName:)
    func InstallMgr_getRemoteModuleByName(command: CDVInvokedUrlCommand) {
        
        initInstall()
        
        let modSource = command.arguments[0] as? String ?? ""
        let modName   = command.arguments[1] as? String ?? ""
        let module = org_crosswire_sword_InstallMgr_getRemoteModuleByName(installMgr, modSource, modName)
        
        if (module == 0) {
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK), callbackId: command.callbackId)
            return
        }
        
        let name = org_crosswire_sword_SWModule_getName(module)
        let description = org_crosswire_sword_SWModule_getDescription(module)
        let category = org_crosswire_sword_SWModule_getCategory(module)
        
        var response = [
            "name": name == nil ? "" : String(cString: name!),
            "description": description == nil ? "" : String(cString: description!),
            "category": category == nil ? "" : String(cString: category!),
            "remoteSourceName": modSource
        ]
        let language = org_crosswire_sword_SWModule_getConfigEntry(module, "Lang")
        response["language"] =  language == nil ? "" : String(cString: language!)
        let direction = org_crosswire_sword_SWModule_getConfigEntry(module, "Direction")
        response["direction"] =  direction == nil ? "" : String(cString: direction!)
        let font = org_crosswire_sword_SWModule_getConfigEntry(module, "Font")
        response["font"] =  font == nil ? "" : String(cString: font!)
        let shortCopyright = org_crosswire_sword_SWModule_getConfigEntry(module, "ShortCopyright")
        response["shortCopyright"] =  shortCopyright == nil ? "" : String(cString: shortCopyright!)
        let cipherKey = org_crosswire_sword_SWModule_getConfigEntry(module, "CipherKey")
        if (cipherKey != nil) {
            response["cipherKey"] = String(cString: cipherKey!)
        }
        let shortPromo = org_crosswire_sword_SWModule_getConfigEntry(module, "ShortPromo")
        response["shortPromo"] = shortPromo == nil ? "" : String(cString: shortPromo!)
        
        
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: response), callbackId: command.callbackId)
    }

    @objc(InstallMgr_refreshRemoteSource:)
    func InstallMgr_refreshRemoteSource(command: CDVInvokedUrlCommand) {
        initInstall()
        DispatchQueue.global().async {
            mySWORDPlugin = self
            self.callbackID = ""
            org_crosswire_sword_InstallMgr_refreshRemoteSource(self.installMgr, command.arguments[0] as? String ?? "")
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "InstallMgr_refreshRemoteSource"), callbackId: command.callbackId)
        }
    }

    
    func getStringArray(buffer: UnsafeMutablePointer<UnsafePointer<Int8>?>!) -> [String] {
        var sources = [String]()
        var b = buffer
        while let i = b?.pointee {
            sources.append(String(cString: i))
            b = b?.advanced(by: 1)
        }
        return sources
    }
    
    
    @objc(InstallMgr_getRemoteSources:)
    func InstallMgr_getRemoteSources(command: CDVInvokedUrlCommand) {
        initInstall()
        let sources = getStringArray(buffer: org_crosswire_sword_InstallMgr_getRemoteSources(installMgr))
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: sources), callbackId: command.callbackId)
    }

    
    @objc(InstallMgr_syncConfig:)
        func InstallMgr_syncConfig(command: CDVInvokedUrlCommand) {

        initInstall()
        DispatchQueue.global().async {
            self.callbackID = ""
            mySWORDPlugin = self
            org_crosswire_sword_InstallMgr_syncConfig(self.installMgr)
            self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "InstallMgr_syncConfig"), callbackId: command.callbackId)
        }
    }
    
    
    @objc(InstallMgr_setUserDisclaimerConfirmed:)
    func InstallMgr_setUserDisclaimerConfirmed(command: CDVInvokedUrlCommand) {
        initInstall()
        org_crosswire_sword_InstallMgr_setUserDisclaimerConfirmed(installMgr)
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "InstallMgr_setUserDisclaimerConfirmed"), callbackId: command.callbackId)
    }
    

    @objc(SWMgr_setJavascript:)
    func SWMgr_setJavascript(command: CDVInvokedUrlCommand) {
        initMgr()
        org_crosswire_sword_SWMgr_setJavascript(mgr, command.arguments[0] as? Bool ?? true ? 1 : 0)
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: "SWMgr_setJavascript"), callbackId: command.callbackId)
    }
    
    @objc(SWMgr_getModInfoList:)
    func SWMgr_getModInfoList(command: CDVInvokedUrlCommand) {
        initMgr()
        let buffer = org_crosswire_sword_SWMgr_getModInfoList(mgr)
        var b = buffer
        var count = 0
        while let i = b?.pointee {
            if i.name == nil {
                break
            }
            b = b?.advanced(by: 1)
            count = count + 1
        }
        let modInfoList = Array(UnsafeBufferPointer<org_crosswire_sword_ModInfo>(start: buffer, count: count));
        
        var mods = [[AnyHashable : Any]]()
        for i in modInfoList {
            var modInfo = [
                "name": String(cString: i.name),
                "description": String(cString: i.description),
                "category": String(cString: i.category),
                "language": String(cString: i.language),
                "delta": i.delta == nil ? "" : String(cString: i.delta),
                "version": i.version == nil ? "" : String(cString: i.version),
                "features": getStringArray(buffer: i.features)
            ] as [AnyHashable : Any]

            if (i.cipherKey != nil) {
                modInfo["cipherKey"] = String(cString: i.cipherKey)
            }
            mods.append(modInfo)

        }
        self.commandDelegate!.send(CDVPluginResult(status: CDVCommandStatus_OK, messageAs: mods), callbackId: command.callbackId)
    }
}
