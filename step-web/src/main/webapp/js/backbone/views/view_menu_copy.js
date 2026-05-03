/*
 * PassageCopyMenuView
 *
 * Per-panel dropdown that mirrors the settings-cog pattern but drives the
 * copy-to-clipboard flow. Coexists with the classic #copyModal during the
 * feature-flag-gated rollout.
 *
 * Modes:
 *   selection — snapshot resolves to a range in the active panel; shows a
 *               single "Copy Gen 1:2 → Gen 1:4" primary button.
 *   grid      — no resolved snapshot, or user asked to pick a different
 *               range; shows a compact verse-number grid with click-start /
 *               click-end range selection.
 */
window.step = window.step || {};

// ------------------------------------------------------------------
// Cross-panel singleton
// ------------------------------------------------------------------
step.copyDropdown = step.copyDropdown || {
    openPanelId: null,
    openView: null,
    selectionSnapshot: null,
    listenerGated: false,
    cooldown: { active: false, until: 0, reason: null, timer: null },
    inFlightCopyId: 0,

    active: function () { return this.openPanelId !== null; },
    shouldSuppressCollapseEvent: function () { return this.listenerGated; },

    claim: function (panelId, view) {
        if (this.openPanelId !== null && this.openPanelId !== panelId && this.openView) {
            try { this.openView.dismiss({ silent: true }); } catch (e) { /* ignore */ }
        }
        this.openPanelId = panelId;
        this.openView = view;
        this.listenerGated = true;
        if (step.lastPassageSelection) {
            this.selectionSnapshot = {
                startVerse: step.lastPassageSelection.startVerse,
                endVerse: step.lastPassageSelection.endVerse,
                version: step.lastPassageSelection.version,
                versions: (step.lastPassageSelection.versions || []).slice(0),
                timestamp: step.lastPassageSelection.timestamp,
                deselectedAt: step.lastPassageSelection.deselectedAt,
                capturedAt: Date.now()
            };
        } else {
            this.selectionSnapshot = null;
        }
    },

    release: function (panelId) {
        if (this.openPanelId !== panelId) return;
        this.openPanelId = null;
        this.openView = null;
        this.selectionSnapshot = null;
        this.listenerGated = false;
    },

    startCooldown: function (ms, reason) {
        var self = this;
        this.cooldown.active = true;
        this.cooldown.until = Date.now() + ms;
        this.cooldown.reason = reason || "rate";
        if (this.cooldown.timer) clearTimeout(this.cooldown.timer);
        this.cooldown.timer = setTimeout(function () {
            self.cooldown.active = false;
            self.cooldown.timer = null;
            if (self.openView && self.openView._onCooldownEnd) self.openView._onCooldownEnd();
        }, ms);
    },

    remainingCooldownMs: function () {
        if (!this.cooldown.active) return 0;
        var r = this.cooldown.until - Date.now();
        return r < 0 ? 0 : r;
    }
};

// ------------------------------------------------------------------
// PassageCopyMenuView
// ------------------------------------------------------------------
var PassageCopyMenuView = Backbone.View.extend({
    events: {
        "click .copyDropdownToggle": "onToggleClick",
        "click .copyCloseBtn": "onCloseClick",
        "click .copyPrimaryBtn": "onPrimaryClick",
        "click .copyPickDifferent": "onPickDifferent",
        "click .copyBackToSelection": "onBackToSelection",
        "click .copyGridCell": "onGridCellClick",
        "change .copyVersionCheckbox": "onVersionToggle",
        "change .copyNotesToggle": "onNotesToggle",
        "change .copyXrefsToggle": "onXrefsToggle",
        "click .copyMenu": "_stopInsideClicks"
    },

    el: function () {
        return step.util.getPassageContainer(this.model.get("passageId")).find(".passageOptionsGroup");
    },

    initialize: function () {
        _.bindAll(this);

        this.panelId = this.model.get("passageId");
        this.rendered = false;
        this._mode = "selection";       // 'selection' | 'grid'
        this._gridStart = null;          // verse index
        this._gridEnd = null;

        // Navbar #copy-icon delegates to the active panel's dropdown.
        // Only bind the redirect once (panelId 0 is always present).
        if (this.panelId === 0) {
            $("#copy-icon").attr("href", "javascript:void(0)").off("click.copyDropdown")
                .on("click.copyDropdown", function (ev) {
                    ev.preventDefault();
                    step.util.copyModal();
                });
        }

        this.listenTo(this.model, "destroy-column", this.remove);
        this.listenTo(this.model, "sync-update", this._onPassageSync);
        this.listenTo(this.model, "change:reference", this._forceClose);
    },

    // ----- lifecycle -----
    // We own the open/close state directly — not via Bootstrap's data-api.
    // Bootstrap's dropdown plugin double-binds click handlers when
    // programmatic and declarative ("data-toggle=dropdown") usage mix, which
    // caused open→immediate-close on the first user click. Our approach:
    //   open()  adds .open class + fires our own open flow
    //   close() removes .open + fires our own close flow
    //   outside-click listener bound on document while open

    onToggleClick: function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (this._isOpen()) this.close();
        else this.open();
    },

    _isOpen: function () {
        return this.$el.find(".copyDropdown").hasClass("open");
    },

    open: function () {
        var $dd = this.$el.find(".copyDropdown");
        if ($dd.hasClass("open")) return;

        step.copyDropdown.claim(this.panelId, this);
        if (!this.rendered) {
            this._initUI();
            this.rendered = true;
        }
        this._mode = "selection";
        this._gridStart = null;
        this._gridEnd = null;

        $dd.addClass("open");
        $dd.find(".copyDropdownToggle").attr("aria-expanded", "true");
        this._update();
        this._bindOutsideClick();
    },

    close: function () {
        var $dd = this.$el.find(".copyDropdown");
        if (!$dd.hasClass("open")) return;
        $dd.removeClass("open");
        $dd.find(".copyDropdownToggle").attr("aria-expanded", "false");
        this._unbindOutsideClick();
        step.copyDropdown.release(this.panelId);
    },

    dismiss: function (opts) {
        opts = opts || {};
        if (this._isOpen()) this.close();
        else if (!opts.silent) step.copyDropdown.release(this.panelId);
    },

    _bindOutsideClick: function () {
        var self = this;
        this._outsideHandler = function (ev) {
            if (self.$el.find(".copyDropdown").has(ev.target).length === 0) {
                // Click outside the dropdown — close, unless cooldown is active.
                if (step.copyDropdown.cooldown.active) return;
                self.close();
            }
        };
        // Defer binding by one event-loop tick: otherwise the very click that
        // triggered open() continues bubbling, reaches this handler, and
        // closes the dropdown immediately (especially when opened via the
        // navbar #copy-icon → copyModal() → $toggle.click() re-dispatch path).
        var handler = this._outsideHandler;
        setTimeout(function () {
            if (self._outsideHandler === handler) {
                $(document).on("click.copyDropdownOutside", handler);
            }
        }, 0);
    },

    _unbindOutsideClick: function () {
        if (this._outsideHandler) {
            $(document).off("click.copyDropdownOutside", this._outsideHandler);
            this._outsideHandler = null;
        }
    },

    _forceClose: function () { this.dismiss(); },

    _onPassageSync: function () {
        if (step.copyDropdown.openPanelId === this.panelId) this.dismiss();
    },

    _stopInsideClicks: function (ev) { ev.stopPropagation(); },

    remove: function () {
        if (step.copyDropdown.openPanelId === this.panelId) step.copyDropdown.release(this.panelId);
        if (this._statusTimer) { clearTimeout(this._statusTimer); this._statusTimer = null; }
        Backbone.View.prototype.remove.apply(this, arguments);
    },

    // ----- render -----

    _initUI: function () {
        var $dd = this.$el.find(".copyDropdown");
        if ($dd.find(".copyMenu").length === 0) {
            var headerTxt = _.escape(__s.copy_dropdown_header || __s.copy_button_label || "Copy");
            var closeLabel = _.escape(__s.copy_dropdown_close || "Close");
            var gridCopyLabel = _.escape(__s.copy_dropdown_copy || __s.copy_button_label || "Copy");
            var html =
                '<div class="dropdown-menu pull-right stepModalFgBg copyMenu" role="dialog" aria-modal="false" ' +
                    'aria-labelledby="copyMenuTitle-' + this.panelId + '">' +
                    '<header class="copyMenuHeader">' +
                        '<h2 id="copyMenuTitle-' + this.panelId + '">' + headerTxt + '</h2>' +
                        '<button type="button" class="copyCloseBtn" aria-label="' + closeLabel + '">×</button>' +
                    '</header>' +
                    '<div class="copyStatusRow" aria-live="polite"></div>' +
                    '<div class="copySelectionRow" style="display:none"></div>' +
                    '<div class="copyGridSection" style="display:none"></div>' +
                    '<div class="copyOptionsStrip" style="display:none"></div>' +
                    '<footer class="copyMenuFooter" style="display:none">' +
                        '<button type="button" class="copyPrimaryBtn copyGridPrimary" disabled>' +
                            gridCopyLabel +
                        '</button>' +
                    '</footer>' +
                '</div>';
            $dd.append(html);
        }
    },

    _update: function () {
        this._renderStatusRow("");
        var resolution = this._computeSelectionResolution();
        this._resolution = resolution;

        // Mode policy: if snapshot resolved and user hasn't asked to pick, use
        // selection mode. Otherwise grid.
        if (this._mode === "selection" && !resolution.resolved) this._mode = "grid";

        this._renderSelectionRow(resolution);
        this._renderGridSection(resolution);
        this._renderOptionsStrip();
        this._applyCooldownState();
    },

    _computeSelectionResolution: function () {
        var result = { resolved: false, startIndex: -1, endIndex: -1, label: "", versions: [], unresolvable: false };
        var snap = step.copyDropdown.selectionSnapshot;
        if (!snap) return result;

        var now = Date.now();
        var isRecent = (snap.deselectedAt === null && (now - snap.timestamp < 60000)) ||
                       (snap.deselectedAt !== null && (now - snap.deselectedAt < 5000));
        if (!isRecent) return result;

        if ($.isArray(snap.versions) && snap.versions.length > 0) result.versions = snap.versions.slice(0);
        else if (snap.version) result.versions = [snap.version];

        var startVerse = snap.startVerse || "";
        var endVerse = snap.endVerse || snap.startVerse || "";
        if (!startVerse && !endVerse) return result;

        var startDisplay = step.copyText._formatVerseDisplay(startVerse);
        var endDisplay = step.copyText._formatVerseDisplay(endVerse);

        var passageContainer = step.util.getPassageContainer(this.panelId);
        var verses = step.copyText._getVerses(passageContainer);
        var startIdx = step.copyText._findVerseIndex(verses, startDisplay);
        var endIdx = step.copyText._findVerseIndex(verses, endDisplay);
        if (startIdx === -1 && endIdx > -1) startIdx = endIdx;
        if (endIdx === -1 && startIdx > -1) endIdx = startIdx;

        if (startIdx === -1 || endIdx === -1) {
            result.unresolvable = true;
            result.label = startDisplay || endDisplay || "";
            return result;
        }

        result.resolved = true;
        result.startIndex = Math.min(startIdx, endIdx);
        result.endIndex = Math.max(startIdx, endIdx);
        result.label = startDisplay;
        if (endDisplay && endDisplay !== startDisplay) {
            var sep = " " + (__s.selection_range_separator || "to") + " ";
            result.label += sep + endDisplay;
        }
        return result;
    },

    _renderSelectionRow: function (resolution) {
        var $row = this.$el.find(".copySelectionRow");
        var showSelection = resolution.resolved && this._mode === "selection";
        if (!showSelection) {
            $row.hide().empty();
            if (resolution.unresolvable && this._mode === "selection") {
                this._renderStatusRow(__s.copy_selection_not_resolved ||
                    "We couldn't match your selection — please pick below.",
                    "unresolved");
                this._mode = "grid";
            }
            return;
        }
        var safeLabel = _.escape(resolution.label || "");
        var btnLabel = (__s.copy_button_label || "Copy") + (safeLabel ? " " + safeLabel : "");
        var pickText = _.escape(__s.copy_choose_different_range || "Pick a different range");

        var html =
            '<button type="button" class="copyPrimaryBtn copySelectionPrimary" ' +
                'data-button-name="copy_selection" ' +
                'data-start-index="' + resolution.startIndex + '" ' +
                'data-end-index="' + resolution.endIndex + '">' +
                _.escape(btnLabel) +
            '</button>' +
            '<button type="button" class="copyPickDifferent">' + pickText + '</button>';
        $row.html(html).show();
    },

    _renderGridSection: function (resolution) {
        var $section = this.$el.find(".copyGridSection");
        var $footer = this.$el.find(".copyMenuFooter");
        if (this._mode !== "grid") {
            $section.hide().empty();
            $footer.hide();
            return;
        }

        var passageContainer = step.util.getPassageContainer(this.panelId);
        var verses = step.copyText._getVerses(passageContainer);
        if (!verses.length) {
            $section.hide().empty();
            $footer.hide();
            this._renderStatusRow(__s.copy_dropdown_status_stale_passage || "No verses to pick.", "stale-passage");
            return;
        }

        // Determine columns — 10 on desktop, 7 on small touch devices. Same
        // heuristic as the classic modal (copy_text.js:_buildChapterVerseTable).
        var cols = 10;
        if (step.touchDevice) {
            var ua = navigator.userAgent.toLowerCase();
            if ((ua.indexOf("android") > -1) || (step.appleTouchDevice && ua.indexOf("safari/60") > -1)) {
                cols = 7;
            }
        }

        // Gather chapter label from first verse's OSIS anchor
        var chapterLabel = this._deriveChapterLabel(passageContainer, verses);

        var html = "";
        if (chapterLabel) html += '<div class="copyGridChapterLabel">' + _.escape(chapterLabel) + '</div>';
        html += '<div class="copyGridScroller"><table class="copyGrid" role="grid" aria-rowcount="' +
                Math.ceil(verses.length / cols) + '" aria-colcount="' + cols + '">';
        var previousVerseName = "";
        for (var i = 0; i < verses.length; i++) {
            if (i % cols === 0) html += (i === 0 ? "<tr>" : "</tr><tr>");
            var orig = verses[i];
            var label = step.copyText._shortenVerseName(previousVerseName, orig);
            previousVerseName = orig;
            html += '<td><button type="button" class="copyGridCell" role="gridcell" ' +
                      'data-verse-index="' + i + '" ' +
                      'data-osis="' + _.escape(orig) + '">' +
                      _.escape(label) +
                    '</button></td>';
        }
        html += "</tr></table></div>";

        $section.html(html).show();

        // Bind keydown in the capture phase at the dropdown level so arrow-key
        // navigation handles before any document-level listeners (Bootstrap
        // dropdown / IntroJS / etc.) get a chance to process the event.
        var self = this;
        var $dd = this.$el.find(".copyDropdown")[0];
        if ($dd && !this._gridKeydownBound) {
            $dd.addEventListener("keydown", function (ev) {
                var cell = ev.target && ev.target.classList && ev.target.classList.contains("copyGridCell") ? ev.target : null;
                if (!cell) return;
                self.onGridKeydown(ev);
            }, true);
            this._gridKeydownBound = true;
        }

        // Show footer primary button in grid mode. Render order = visual + tab
        // order: primary copy chip on the left, back-to-selection chip on the
        // right. Flex layout in copy_dropdown.scss handles spacing.
        var gridCopyLabel = _.escape(__s.copy_dropdown_copy || __s.copy_button_label || "Copy");
        var backLabel = _.escape(__s.copy_dropdown_back_to_selection || "Back to selection");
        var footerHtml = '<button type="button" class="copyPrimaryBtn copyGridPrimary" disabled>' +
                         gridCopyLabel + '</button>';
        if (resolution.resolved) {
            footerHtml += '<button type="button" class="copyBackToSelection copyPrimaryBtn">' +
                          backLabel + '</button>';
        }
        $footer.html(footerHtml).show();

        this._updateGridVisuals();
    },

    _deriveChapterLabel: function (passageContainer, verses) {
        // Prefer the first verseLink's OSIS "Gen.1.1" → "Gen 1"
        var firstLink = $(passageContainer).find(".verseLink").first();
        var osis = firstLink.attr("name");
        if (!osis) return "";
        osis = osis.split(" ")[0];
        var parts = osis.split(".");
        if (parts.length < 2) return osis;
        return parts[0] + " " + parts[1];
    },

    _updateGridVisuals: function () {
        var $cells = this.$el.find(".copyGridCell");
        $cells.each(function () {
            $(this).removeAttr("data-role").removeAttr("aria-selected");
        });
        if (this._gridStart === null) {
            this.$el.find(".copyGridPrimary").prop("disabled", true).removeAttr("data-start-index data-end-index");
            return;
        }
        var startIdx = this._gridStart;
        var endIdx = (this._gridEnd !== null) ? this._gridEnd : null;
        var lo = (endIdx !== null) ? Math.min(startIdx, endIdx) : startIdx;
        var hi = (endIdx !== null) ? Math.max(startIdx, endIdx) : startIdx;
        for (var i = lo; i <= hi; i++) {
            var role = (i === lo) ? "start" : (i === hi ? "end" : "in-range");
            var $cell = $cells.filter('[data-verse-index="' + i + '"]');
            $cell.attr("data-role", role).attr("aria-selected", "true");
        }
        var rangeReady = (endIdx !== null);
        var $primary = this.$el.find(".copyGridPrimary");
        $primary.prop("disabled", !rangeReady);
        if (rangeReady) {
            $primary.attr("data-start-index", lo).attr("data-end-index", hi);
        } else {
            $primary.removeAttr("data-start-index").removeAttr("data-end-index");
        }
    },

    _renderOptionsStrip: function () {
        var $strip = this.$el.find(".copyOptionsStrip");
        var self = this;

        var masterVersion = this.model.get("masterVersion");
        var extraVers = this.model.get("extraVersions") || "";
        var hasExtraVersions = extraVers !== "";
        var passageContainer = step.util.getPassageContainer(this.panelId);
        var isInterlinear = $(passageContainer).has(".interlinear").length > 0;

        // --- version checkboxes
        var versionsHtml = "";
        if (hasExtraVersions && !isInterlinear) {
            var allVersions = [masterVersion].concat(extraVers.split(","));
            var checked = this._resolveCheckedVersions(allVersions);
            versionsHtml =
                '<fieldset class="copyVersions">' +
                    '<legend>' + _.escape(__s.copy_dropdown_versions_label || "Versions") + '</legend>';
            for (var i = 0; i < allVersions.length; i++) {
                var v = allVersions[i];
                var id = "cpyver-" + this.panelId + "-" + (i + 1);
                var isChecked = checked.indexOf(v) > -1;
                versionsHtml +=
                    '<label>' +
                        '<input type="checkbox" class="copyVersionCheckbox" ' +
                            'id="' + id + '" ' +
                            'data-version-index="' + i + '" ' +
                            'data-version="' + _.escape(v) + '"' +
                            (isChecked ? ' checked' : '') + '>' +
                        _.escape(v) +
                    '</label>';
            }
            versionsHtml += '</fieldset>';
        }

        // --- notes / xrefs toggles (conditional on version metadata)
        var notesAvailable = this._anyVersionHasNotes();
        var togglesHtml = "";
        if (notesAvailable) {
            var wantNotes = !!this.model.get("copyIncludeNotes");
            var wantXrefs = !!this.model.get("copyIncludeXrefs");
            togglesHtml =
                '<div class="copyToggleRow">' +
                    '<label>' +
                        '<input type="checkbox" class="copyNotesToggle"' +
                            (wantNotes ? ' checked' : '') + '>' +
                        _.escape(__s.copy_dropdown_include_notes || "Include notes") +
                    '</label>' +
                    '<label>' +
                        '<input type="checkbox" class="copyXrefsToggle"' +
                            (wantXrefs ? ' checked' : '') + '>' +
                        _.escape(__s.copy_dropdown_include_xrefs || "Include cross references") +
                    '</label>' +
                '</div>';
        }

        var combined = versionsHtml + togglesHtml;
        if (combined) {
            $strip.html(combined).show();
        } else {
            $strip.hide().empty();
        }
    },

    _anyVersionHasNotes: function () {
        var masterVersion = this.model.get("masterVersion");
        var extraVers = this.model.get("extraVersions") || "";
        var all = [masterVersion];
        if (extraVers) all = all.concat(extraVers.split(","));
        for (var i = 0; i < all.length; i++) {
            var vInfo = step.keyedVersions[all[i]];
            if (vInfo && vInfo.category !== "COMMENTARY" && vInfo.hasNotes) return true;
        }
        return false;
    },

    _resolveCheckedVersions: function (allVersions) {
        // Priority: snapshot.versions[] → persisted model pref → all versions.
        var snap = step.copyDropdown.selectionSnapshot;
        var persisted = this.model.get("copySelectedVersions");
        if (snap && $.isArray(snap.versions) && snap.versions.length > 0) {
            var isect = [];
            for (var i = 0; i < snap.versions.length; i++) {
                if (allVersions.indexOf(snap.versions[i]) > -1) isect.push(snap.versions[i]);
            }
            if (isect.length > 0) return isect;
        }
        if ($.isArray(persisted) && persisted.length > 0) {
            var filtered = [];
            for (var j = 0; j < persisted.length; j++) {
                if (allVersions.indexOf(persisted[j]) > -1) filtered.push(persisted[j]);
            }
            if (filtered.length > 0) return filtered;
        }
        return allVersions.slice(0);
    },

    _collectCheckedVersionIndices: function () {
        var out = [];
        this.$el.find(".copyVersionCheckbox").each(function () {
            if ($(this).prop("checked")) out.push(parseInt($(this).attr("data-version-index"), 10));
        });
        return out;
    },

    _collectCheckedVersionNames: function () {
        var out = [];
        this.$el.find(".copyVersionCheckbox").each(function () {
            if ($(this).prop("checked")) out.push($(this).attr("data-version"));
        });
        return out;
    },

    _renderStatusRow: function (text, kind) {
        var $row = this.$el.find(".copyStatusRow");
        $row.removeClass(function (_i, c) {
            return (c.match(/copyStatus--\S+/g) || []).join(" ");
        });
        if (!text) { $row.empty().attr("role", "status"); return; }
        if (kind) $row.addClass("copyStatus--" + kind);
        $row.attr("role", (kind === "copy-error" || kind === "clipboard-denied" ||
                           kind === "ajax-error" || kind === "stale-passage")
                           ? "alert" : "status");
        $row.text(text);
    },

    _applyCooldownState: function () {
        var remaining = step.copyDropdown.remainingCooldownMs();
        var $primary = this.$el.find(".copyPrimaryBtn");
        var $close = this.$el.find(".copyCloseBtn");
        if (remaining > 0) {
            $primary.prop("disabled", true);
            $close.prop("disabled", true);
            var secs = Math.ceil(remaining / 1000);
            var msg = (__s.copy_dropdown_status_cooldown ||
                "Please wait %d seconds before copying again.").replace("%d", secs);
            this._renderStatusRow(msg, "cooldown");
        } else {
            $primary.prop("disabled", false);
            $close.prop("disabled", false);
        }
    },

    _onCooldownEnd: function () {
        if (step.copyDropdown.openPanelId !== this.panelId) return;
        this._renderStatusRow("");
        this.$el.find(".copyPrimaryBtn").prop("disabled", false);
        this.$el.find(".copyCloseBtn").prop("disabled", false);
        this._updateGridVisuals(); // re-enable grid primary only if range ready
    },

    // ----- user interactions -----

    onCloseClick: function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        if (step.copyDropdown.cooldown.active) return;
        this.dismiss();
    },

    onPrimaryClick: function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        if (step.copyDropdown.cooldown.active) return;
        var $btn = $(ev.currentTarget);
        if ($btn.prop("disabled")) return;
        var startIndex = parseInt($btn.attr("data-start-index"), 10);
        var endIndex = parseInt($btn.attr("data-end-index"), 10);
        if (isNaN(startIndex) || isNaN(endIndex)) return;

        // Validation: if version fieldset is visible, require ≥1 checked
        var $versionField = this.$el.find(".copyVersions");
        if ($versionField.length && this._collectCheckedVersionIndices().length === 0) {
            this._renderStatusRow(
                __s.copy_dropdown_status_no_versions || "Select at least one version.",
                "no-versions");
            return;
        }
        this._invokeGoCopy(startIndex, endIndex, $btn);
    },

    onPickDifferent: function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        this._mode = "grid";
        this._update();
        // Focus first cell for keyboard users
        var $first = this.$el.find(".copyGridCell").first();
        if ($first.length) $first.focus();
    },

    onBackToSelection: function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        this._mode = "selection";
        this._gridStart = null;
        this._gridEnd = null;
        this._update();
    },

    onGridCellClick: function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        var idx = parseInt($(ev.currentTarget).attr("data-verse-index"), 10);
        if (isNaN(idx)) return;
        this._handleGridSelect(idx);
    },

    _handleGridSelect: function (idx) {
        if (this._gridStart === null) {
            this._gridStart = idx;
            this._gridEnd = null;
        } else if (this._gridEnd === null) {
            this._gridEnd = idx;
        } else {
            // Third click — reset to new start
            this._gridStart = idx;
            this._gridEnd = null;
        }
        this._updateGridVisuals();
    },

    onGridKeydown: function (ev) {
        // ev is the native DOM event (bound directly in _renderGridSection).
        var cell = ev.currentTarget;
        var idx = parseInt(cell.getAttribute("data-verse-index"), 10);
        if (ev.which === 27 /* Esc */) {
            ev.preventDefault();
            ev.stopPropagation();
            if (this._gridStart !== null) {
                this._gridStart = null;
                this._gridEnd = null;
                this._updateGridVisuals();
            } else {
                this.dismiss();
            }
            return;
        }
        if (isNaN(idx)) return;
        var $cells = this.$el.find(".copyGridCell");
        var total = $cells.length;
        var cols = this._gridColumnCount();
        var target = null;
        switch (ev.which) {
            case 13: /* Enter */
            case 32: /* Space */
                ev.preventDefault();
                ev.stopPropagation();
                this._handleGridSelect(idx);
                return;
            case 37: /* Left */  target = idx - 1; break;
            case 39: /* Right */ target = idx + 1; break;
            case 38: /* Up */    target = idx - cols; break;
            case 40: /* Down */  target = idx + cols; break;
            case 36: /* Home */  target = idx - (idx % cols); break;
            case 35: /* End */   target = Math.min(idx - (idx % cols) + cols - 1, total - 1); break;
            default: return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        if (target < 0 || target >= total) return;
        var $target = $cells.filter('[data-verse-index="' + target + '"]');
        // Keep all cells at tabindex="0" so tabindex churn doesn't steal focus
        // (Chromium loses focus if the element that just got focus has its
        // tabindex rotated around it synchronously in the same event loop).
        $target[0].focus();
    },

    _gridColumnCount: function () {
        var $table = this.$el.find(".copyGrid");
        if (!$table.length) return 10;
        return parseInt($table.attr("aria-colcount"), 10) || 10;
    },

    onVersionToggle: function (ev) {
        ev.stopPropagation();
        var names = this._collectCheckedVersionNames();
        // Persist; validation happens at copy time
        this.model.save({ copySelectedVersions: names }, { silent: true });
        // Clear a transient no-versions status if the user just re-checked one
        var $row = this.$el.find(".copyStatusRow");
        if ($row.hasClass("copyStatus--no-versions") && names.length > 0) this._renderStatusRow("");
    },

    onNotesToggle: function (ev) {
        ev.stopPropagation();
        this.model.save({ copyIncludeNotes: $(ev.currentTarget).prop("checked") }, { silent: true });
    },

    onXrefsToggle: function (ev) {
        ev.stopPropagation();
        this.model.save({ copyIncludeXrefs: $(ev.currentTarget).prop("checked") }, { silent: true });
    },

    // ----- goCopy invocation -----

    _invokeGoCopy: function (startIndex, endIndex, $btn) {
        var self = this;
        var copyId = ++step.copyDropdown.inFlightCopyId;
        $btn.prop("disabled", true);

        // Construct opts so goCopy doesn't need to read #selectnotes / #cpyverN
        var opts = {};
        if (this._anyVersionHasNotes()) {
            opts.wantNotes = !!this.model.get("copyIncludeNotes");
            opts.wantXrefs = !!this.model.get("copyIncludeXrefs");
        } else {
            opts.wantNotes = false;
            opts.wantXrefs = false;
        }
        // Version indices — only if version fieldset is rendered
        if (this.$el.find(".copyVersionCheckbox").length > 0) {
            opts.checkedVersionIndices = this._collectCheckedVersionIndices();
        }

        var prevSink = step.copyText._uiSink;
        step.copyText._uiSink = {
            showSuccess: function () {
                if (copyId !== step.copyDropdown.inFlightCopyId) return;
                self._onCopySuccess();
            },
            showRapidWarning: function (versionsString, sleepMs) {
                if (copyId !== step.copyDropdown.inFlightCopyId) return;
                self._onRapidWarning(versionsString, sleepMs);
            },
            showNoVersionsSelected: function () {
                if (copyId !== step.copyDropdown.inFlightCopyId) return;
                self._renderStatusRow(
                    __s.copy_dropdown_status_no_versions ||
                        "You must select at least one version to copy.",
                    "no-versions");
            },
            showCopyError: function (err) {
                if (copyId !== step.copyDropdown.inFlightCopyId) return;
                self._renderStatusRow(__s.copy_dropdown_status_copy_error || "Copy failed.", "copy-error");
            },
            showClipboardDenied: function () {
                if (copyId !== step.copyDropdown.inFlightCopyId) return;
                self._renderStatusRow(
                    __s.copy_dropdown_status_clipboard_denied ||
                        "Clipboard access was denied by the browser.",
                    "clipboard-denied");
            }
        };

        try {
            step.copyText.goCopy(startIndex, endIndex, opts);
        } catch (e) {
            if (step.copyText._uiSink && step.copyText._uiSink.showCopyError) {
                step.copyText._uiSink.showCopyError(e);
            }
        } finally {
            setTimeout(function () { step.copyText._uiSink = prevSink; }, 0);
        }
    },

    _onCopySuccess: function () {
        var self = this;
        var msg = __s.copy_dropdown_status_success || __s.text_is_copied || "The text is copied.";
        this._renderStatusRow(msg, "success");
        this.$el.find(".copyPrimaryBtn").prop("disabled", true);
        if (this._statusTimer) clearTimeout(this._statusTimer);
        this._statusTimer = setTimeout(function () {
            self._renderStatusRow("");
            // Re-enable primary button if in selection mode; grid mode uses its range state
            if (self._mode === "selection") self.$el.find(".copyPrimaryBtn").prop("disabled", false);
            else self._updateGridVisuals();
            self._statusTimer = null;
        }, 1500);
    },

    _onRapidWarning: function (versionsString, sleepMs) {
        step.copyDropdown.startCooldown(sleepMs || 5000, "rate");
        var secs = Math.ceil((sleepMs || 5000) / 1000);
        var template = __s.copy_dropdown_status_rapid_warning ||
            "You are copying at a rapid pace. Please review the copyright terms for: %s. Wait %d seconds.";
        var msg = template.replace("%s", versionsString).replace("%d", secs);
        this._renderStatusRow(msg, "rapid-warning");
        this.$el.find(".copyPrimaryBtn").prop("disabled", true);
        this.$el.find(".copyCloseBtn").prop("disabled", true);
    }
});

window.PassageCopyMenuView = PassageCopyMenuView;
