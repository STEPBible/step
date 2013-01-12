(function($) {
//    $ = jQuery.noConflict(true);
//    if (typeof window.jQuery === "undefined") {
//        window.jQuery = $
//    }
//    if (typeof window.$ === "undefined") {
//        window.$ = $
//    }
    var ATL_JQ = function() {
        return $.apply($, arguments)
    };
    var baseUrl = "https://stepweb.atlassian.net";
    var css = ".atlwdg-blanket {background:#000;height:100%;left:0;opacity:.5;position:fixed;top:0;width:100%;z-index:1000000;}\n.atlwdg-popup {background:#fff;border:1px solid #666;position:fixed;top:50%;left:50%;z-index:10000011;}\n.atlwdg-popup.atlwdg-box-shadow {-moz-box-shadow:10px 10px 20px rgba(0,0,0,0.5);-webkit-box-shadow:10px 10px 20px rgba(0,0,0,0.5);box-shadow:10px 10px 20px rgba(0,0,0,0.5);background-color:#fff;}\n.atlwdg-hidden {display:none;}\n.atlwdg-trigger {position: fixed; background: #013466; padding: 5px;border: 2px solid white;border-top: none; font-weight: bold; color: white; display:block;white-space:nowrap;text-decoration:none; font-family:arial, FreeSans, Helvetica, sans-serif;font-size:12px;box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);-webkit-box-shadow:5px 5px 10px rgba(0, 0, 0, 0.5); -moz-box-shadow:5px 5px 10px rgba(0, 0, 0, 0.5);border-radius: 0 0 5px 5px; -moz-border-radius: 0 0 5px 5px;}\na.atlwdg-trigger {text-decoration:none;}\n.atlwdg-trigger.atlwdg-TOP {left: 45%;top:0; }\n.atlwdg-trigger.atlwdg-RIGHT {left:100%; top:40%; -webkit-transform-origin:top left; -webkit-transform: rotate(90deg); -moz-transform: rotate(90deg); -moz-transform-origin:top left;-ms-transform: rotate(90deg); -ms-transform-origin:top left; }\n.atlwdg-trigger.atlwdg-SUBTLE { right:0; bottom:0; border: 1px solid #ccc; border-bottom: none; border-right: none; background-color: #f5f5f5; color: #444; font-size: 11px; padding: 6px; box-shadow: -1px -1px 2px rgba(0, 0, 0, 0.5); border-radius: 2px 0 0 0; }\n.atlwdg-loading {position:absolute;top:220px;left:295px;}";
    var cssIE = ".atlwdg-trigger {position:absolute;}\n.atlwdg-blanket {position:absolute;filter:alpha(opacity=50);width:110%;}\n.atlwdg-popup {position:absolute;}\n.atlwdg-trigger.atlwdg-RIGHT { left:auto;right:0; filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=1); }";
    ATL_JQ.isQuirksMode = function() {
        return document.compatMode != "CSS1Compat"
    };
    ATL_JQ.IssueDialog = function(options) {
        var $body = $("body"), that = this, showDialog = function() {
            that.show();
            return false
        };
        this.options = options;
        this.frameUrl = baseUrl + "/rest/collectors/1.0/template/form/" + this.options.collectorId + "?os_authType=none";
        $("head").append("<style type='text/css'>" + css + "</style>");
        if (this.options.triggerPosition === "CUSTOM") {
            var oldTriggerFunction;
            if (this.options.triggerFunction) {
                try {
                    oldTriggerFunction = eval("(" + this.options.triggerFunction + ")")
                } catch (ex) {
                }
            }
            $(function() {
                try {
                    var newTriggerFunction;
                    if (window.ATL_JQ_PAGE_PROPS
                            && ((window.ATL_JQ_PAGE_PROPS.triggerFunction) || (window.ATL_JQ_PAGE_PROPS["88fe2a64"] && window.ATL_JQ_PAGE_PROPS["88fe2a64"].triggerFunction))) {
                        newTriggerFunction = window.ATL_JQ_PAGE_PROPS.triggerFunction || window.ATL_JQ_PAGE_PROPS["88fe2a64"].triggerFunction
                    } else {
                        newTriggerFunction = oldTriggerFunction
                    }
                    if ($.isFunction(newTriggerFunction)) {
                        newTriggerFunction(showDialog)
                    }
                } catch (ex) {
                }
            })
        } else {
            if ($.isFunction(this.options.triggerPosition)) {
                try {
                    this.options.triggerPosition(showDialog)
                } catch (ex) {
                }
            } else {
                if (this.options.triggerPosition && this.options.triggerText) {
                    var triggerClass = "atlwdg-trigger atlwdg-" + this.options.triggerPosition;
                    var $trigger = $("<a href='#' id='atlwdg-trigger'/>").addClass(triggerClass).text(this.options.triggerText);
                    $body.append($trigger);
                    $trigger.click(showDialog)
                }
            }
        }
        var $iframeContainer = $("<div id='atlwdg-container'/>").addClass("atlwdg-popup atlwdg-box-shadow atlwdg-hidden");
        var $blanket = $("<div id='atlwdg-blanket' class='atlwdg-blanket'/>").hide();
        $body.append($blanket).append($iframeContainer);
        if ($.browser.msie && (ATL_JQ.isQuirksMode() || $.browser.version < 9)) {
            $("head").append("<style type='text/css'>" + cssIE + "</style>");
            var triggerAdjuster = function(e) {
            };
            if (this.options.triggerPosition === "TOP") {
                triggerAdjuster = function(e) {
                    $("#atlwdg-trigger").css("top", $(window).scrollTop() + "px")
                }
            } else {
                if (this.options.triggerPosition === "RIGHT") {
                    triggerAdjuster = function(e) {
                        var $trigger = $("#atlwdg-trigger");
                        $trigger.css("top", ($(window).height() / 2 - $trigger.outerWidth() / 2 + $(window).scrollTop()) + "px");
                        if (!ATL_JQ.isQuirksMode() && $.browser.version === "8.0") {
                            $trigger.css("right", -($trigger.outerHeight() - $trigger.outerWidth()) + "px")
                        }
                    }
                } else {
                    if (this.options.triggerPosition === "SUBTLE") {
                        var outerHeight = $trigger.outerHeight();
                        triggerAdjuster = function(e) {
                            var $window = $(window);
                            $trigger.css("top", ($window.scrollTop() + $window.height() - outerHeight) + "px")
                        }
                    }
                }
            }
            $(window).bind("scroll resize", triggerAdjuster);
            triggerAdjuster()
        }
    };
    ATL_JQ.IssueDialog.prototype = {
        hideDialog : undefined,
        updateContainerPosition : function() {
            var width = 810, height = 450;
            $("#atlwdg-container").css({
                height : height + "px",
                width : width + "px",
                "margin-top" : -Math.round(height / 2) + "px",
                "margin-left" : -Math.round(width / 2) + "px"
            });
            $("#atlwdg-frame").height("100%").width("100%")
        },
        show : function() {
            var that = this, $iframeContainerElem = $("#atlwdg-container"), $body = $("body"), $iframeElem = $('<iframe id="atlwdg-frame" frameborder="0" src="'
                    + this.frameUrl + '"></iframe>'), $loadingImage = $('<img class="atlwdg-loading" style="display:none;" src="https://stepweb.atlassian.net/images/throbber/loading_barber_pole_horz.gif">');
            hideDialog = function(e) {
                if (e.keyCode === 27) {
                    that.hide()
                }
            };
            $iframeContainerElem.append($loadingImage);
            var throbberTimeout = setTimeout(function() {
                $loadingImage.show()
            }, 300);
            $body.css("overflow", "hidden").keydown(hideDialog);
            window.scroll(0, 0);
            var feedbackString = "";
            if (this.options.collectFeedback) {
                var feedback = this.options.collectFeedback();
                for ( var prop in feedback) {
                    if (feedback.hasOwnProperty(prop) && feedback[prop] !== undefined && feedback[prop] !== "" && typeof feedback[prop] === "string") {
                        feedbackString += "*" + prop + "*: " + feedback[prop] + "\n"
                    }
                }
            }
            var fieldValues = {};
            if (this.options.fieldValues && !$.isEmptyObject(this.options.fieldValues)) {
                $.extend(fieldValues, this.options.fieldValues)
            }
            $iframeElem.load(function() {
                var message = {
                    feedbackString : feedbackString,
                    fieldValues : fieldValues
                };
                $iframeElem[0].contentWindow.postMessage(JSON.stringify(message), "https://stepweb.atlassian.net");
                $(window).bind("message", function(e) {
                    if (e.originalEvent.data && e.originalEvent.data === "cancelFeedbackDialog") {
                        that.hide()
                    }
                })
            });
            $iframeElem.load(function(e) {
                clearTimeout(throbberTimeout);
                $loadingImage.hide();
                $iframeElem.show()
            });
            var currentMilis = new Date().getTime();
            var dummyElement = document.createElement("a");
            dummyElement.href = "https://stepweb.atlassian.net";
            $iframeContainerElem.append($iframeElem);
            this.updateContainerPosition();
            $iframeContainerElem.show();
            $("#atlwdg-blanket").show()
        },
        hide : function() {
            $("body").css("overflow", "auto").unbind("keydown", hideDialog);
            $("#atlwdg-container").hide().empty();
            $("#atlwdg-blanket").hide()
        }
    };
    var filterStrings = function(obj, recursingIn) {
        for ( var key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue
            }
            var value = obj[key];
            if (recursingIn === undefined && $.isArray(value)) {
                filterStrings(value, key);
                continue
            }
            if (typeof value !== "string") {
                var paramName = recursingIn === undefined ? key : recursingIn + ":" + key;
                console.log("bootstrap.js:filterStrings ignoring key for value '" + paramName + "'; typeof must be string");
                delete obj[key]
            }
        }
        return obj
    };
    if ("88fe2a64" !== "") {
        ATL_JQ(function() {
            var showTrigger = function(triggerConfig) {
                if (!triggerConfig.enabled) {
                    return
                }
                var collectFeedback = false;
                var defaultFieldValues = {};
                if (triggerConfig.recordWebInfo) {
                    var environmentProps = {
                        Location : window.location.href,
                        "User-Agent" : navigator.userAgent,
                        Referrer : document.referrer,
                        "Screen Resolution" : screen.width + " x " + screen.height
                    };
                    if (window.ATL_JQ_PAGE_PROPS) {
                        var feedbackProps = window.ATL_JQ_PAGE_PROPS.environment;
                        defaultFieldValues = window.ATL_JQ_PAGE_PROPS.fieldValues;
                        if (window.ATL_JQ_PAGE_PROPS.hasOwnProperty("88fe2a64")) {
                            feedbackProps = window.ATL_JQ_PAGE_PROPS["88fe2a64"];
                            defaultFieldValues = feedbackProps.fieldValues
                        }
                        if ($.isFunction(feedbackProps)) {
                            $.extend(environmentProps, feedbackProps())
                        } else {
                            $.extend(environmentProps, feedbackProps)
                        }
                        if ($.isFunction(defaultFieldValues)) {
                            $.extend(defaultFieldValues, filterStrings(defaultFieldValues()))
                        } else {
                            if ($.isPlainObject(defaultFieldValues)) {
                                $.extend(defaultFieldValues, filterStrings(defaultFieldValues))
                            }
                        }
                    }
                    collectFeedback = function() {
                        return environmentProps
                    }
                }
                new ATL_JQ.IssueDialog({
                    collectorId : "88fe2a64",
                    fieldValues : defaultFieldValues,
                    collectFeedback : collectFeedback,
                    triggerText : triggerConfig.triggerText,
                    triggerPosition : triggerConfig.triggerPosition,
                    triggerFunction : triggerConfig.triggerFunction
                })
            };
            $.ajax({
                url : baseUrl + "/rest/collectors/1.0/configuration/trigger/88fe2a64?os_authType=none",
                dataType : "jsonp",
                crossDomain : true,
                success : showTrigger
            })
        })
    } else {
        window.ATL_JQ = ATL_JQ
    }
})(jQuery);
var JSON;
if (!JSON) {
    JSON = {}
}
(function() {
    function f(n) {
        return n < 10 ? "0" + n : n
    }
    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function(key) {
            return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T"
                    + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
            return this.valueOf()
        }
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = {
        "\b" : "\\b",
        "\t" : "\\t",
        "\n" : "\\n",
        "\f" : "\\f",
        "\r" : "\\r",
        '"' : '\\"',
        "\\" : "\\\\"
    }, rep;
    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
            var c = meta[a];
            return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + string + '"'
    }
    function str(key, holder) {
        var i, k, v, length, mind = gap, partial, value = holder[key];
        if (value && typeof value === "object" && typeof value.toJSON === "function") {
            value = value.toJSON(key)
        }
        if (typeof rep === "function") {
            value = rep.call(holder, key, value)
        }
        switch (typeof value) {
        case "string":
            return quote(value);
        case "number":
            return isFinite(value) ? String(value) : "null";
        case "boolean":
        case "null":
            return String(value);
        case "object":
            if (!value) {
                return "null"
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === "[object Array]") {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null"
                }
                v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
                gap = mind;
                return v
            }
            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v)
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v)
                        }
                    }
                }
            }
            v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
            gap = mind;
            return v
        }
    }
    if (typeof JSON.stringify !== "function") {
        JSON.stringify = function(value, replacer, space) {
            var i;
            gap = "";
            indent = "";
            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " "
                }
            } else {
                if (typeof space === "string") {
                    indent = space
                }
            }
            rep = replacer;
            if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify")
            }
            return str("", {
                "" : value
            })
        }
    }
    if (typeof JSON.parse !== "function") {
        JSON.parse = function(text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v
                            } else {
                                delete value[k]
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value)
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function(a) {
                    return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                })
            }
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(
                    /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                j = eval("(" + text + ")");
                return typeof reviver === "function" ? walk({
                    "" : j
                }, "") : j
            }
            throw new SyntaxError("JSON.parse")
        }
    }
}());