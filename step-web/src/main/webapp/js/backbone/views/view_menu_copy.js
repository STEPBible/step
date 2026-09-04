/*
 * PassageCopyMenuView — per-panel dropdown driving the copy-to-clipboard flow.
 *
 * Single mode: a verse-number grid with click-start/click-end range
 * selection. Each open seeds the grid from the last passage highlight when it
 * still matches the displayed text — else pre-selects the whole display — so
 * the footer Copy is one click. A fresh highlight while the menu is open
 * re-seeds the grid live.
 */
window.step = window.step || {};

// ------------------------------------------------------------------
// Cross-panel singleton
// ------------------------------------------------------------------
step.copyDropdown = step.copyDropdown || {
    openPanelId: null,
    openView: null,
    views: {},
    selectionSnapshot: null,
    cooldown: { active: false, until: 0, reason: null, timer: null },
    inFlightCopyId: 0,

    // Where the user last parked the menu, in viewport coordinates; shared
    // across panels, survives close/open. Null = default anchor. Deliberately
    // session-scoped: a saved position rarely fits the next window size.
    dragPosition: null,

    claim: function (panelId, view) {
        if (this.openPanelId !== null && this.openPanelId !== panelId && this.openView) {
            try { this.openView.dismiss({ silent: true }); } catch (e) { /* ignore */ }
        }
        this.openPanelId = panelId;
        this.openView = view;
        if (step.lastPassageSelection) {
            this.selectionSnapshot = {
                passageId: step.lastPassageSelection.passageId,
                startVerse: step.lastPassageSelection.startVerse,
                endVerse: step.lastPassageSelection.endVerse,
                versions: (step.lastPassageSelection.versions || []).slice(0),
                timestamp: step.lastPassageSelection.timestamp
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
    },

    // step.util.js initSelectionTracking calls this on every new passage
    // highlight; while the menu is open a resolvable one re-seeds the grid.
    // Cooldown doesn't gate it: _applyCooldownState runs after every seed, so
    // the buttons stay disabled and the fresh range is armed at cooldown end.
    notifySelectionChanged: function () {
        if (!this.openView) return;
        this.claim(this.openPanelId, this.openView);   // re-snapshot
        this.openView._onLiveSelectionChange();
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

// Gap kept between the menu and the panel/viewport edge, and how far a
// pointer must travel before we treat a press on the handle as a drag rather
// than a stray click.
var COPY_DRAG_GUTTER = 6;
var COPY_DRAG_THRESHOLD = 3;
// How long after a drag ends we ignore the outside-click that terminates it.
var COPY_DRAG_CLICK_GRACE_MS = 400;

// ------------------------------------------------------------------
// PassageCopyMenuView
// ------------------------------------------------------------------
var PassageCopyMenuView = Backbone.View.extend({
    events: {
        "click .copyCloseBtn": "onCloseClick",
        "click .copyGridPrimary": "onPrimaryClick",
        "click .copyGridCell": "onGridCellClick",
        "change .copyVersionCheckbox": "onVersionToggle",
        "change .copyNotesToggle": "onNotesToggle",
        "change .copyXrefsToggle": "onXrefsToggle",
        "click .copyMenu": "_stopInsideClicks",
        "keyup .copyMenu": "_stopMenuNavKeyup",
        // Drag: delegated off .passageOptionsGroup (this.$el) so the bindings
        // survive _initUI re-injecting the menu node.
        "pointerdown .copyDragHandle": "onDragPointerDown",
        "mousedown .copyDragHandle": "onDragMouseDown",
        "touchstart .copyDragHandle": "onDragTouchStart",
        "keydown .copyDragGrip": "onDragKeydown"
    },

    el: function () {
        return step.util.getPassageContainer(this.model.get("passageId")).find(".passageOptionsGroup");
    },

    initialize: function () {
        _.bindAll(this);

        this.panelId = this.model.get("passageId");
        step.copyDropdown.views[this.panelId] = this;
        this.rendered = false;
        this._gridStart = null;          // verse index
        this._gridEnd = null;

        // New panels are cloned from the active column (createNewColumn), so
        // the clone can carry the source panel's injected .copyMenu, .open
        // class and inline pin. Reset to the pristine empty anchor; _initUI
        // re-injects a fresh menu on first open.
        var $dd = this.$el.find(".copyDropdown");
        $dd.removeClass("open");
        $dd.find(".copyMenu").remove();

        // Opening a new panel dismisses a dialog open in any other panel —
        // the layout just reflowed under it.
        if (step.copyDropdown.openView && step.copyDropdown.openView !== this) {
            try { step.copyDropdown.openView.dismiss(); } catch (e) { /* ignore */ }
        }

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
        this.listenTo(this.model, "change:reference", function () { this.dismiss(); });
    },

    // ----- lifecycle -----
    // Open/close state is owned here, not by Bootstrap's data-api: mixing
    // programmatic and declarative dropdown usage double-binds handlers and
    // caused open→immediate-close. The .open class + a document outside-click
    // listener (bound while open) are the whole mechanism.

    toggle: function () {
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
        // PassageMenuView._initUI (view_menu_passage.js:342-343) removes any
        // descendant matching `.dropdown-menu.pull-right.stepModalFgBg` from the
        // shared `.passageOptionsGroup` on its first run, and our `.copyMenu`
        // carries those exact classes (see _initUI below, line 233). Self-heal
        // by re-injecting when the menu node is missing, rather than trusting
        // `this.rendered`.
        if (!this.rendered || $dd.find(".copyMenu").length === 0) {
            this._initUI();
            this.rendered = true;
        }
        this._gridStart = null;
        this._gridEnd = null;

        this._restoreFocusTo = document.activeElement;
        $dd.addClass("open");
        this._update();
        // After _update, so the menu has its real size to measure and clamp
        // against. Same task as addClass("open"), so nothing paints in between
        // and the menu never flashes at the anchor position first.
        this._positionOnOpen();
        this._focusInitial();
        this._bindOutsideClick();
        this._bindViewportWatch();
    },

    close: function () {
        var $dd = this.$el.find(".copyDropdown");
        if (!$dd.hasClass("open")) return;
        $dd.removeClass("open");
        this._unbindOutsideClick();
        this._unbindViewportWatch();
        this._cancelDrag();
        // Drop the inline pin but keep step.copyDropdown.dragPosition — the
        // next open re-applies it.
        this._clearFloating();
        this._clearInlineSuccess();
        if (this._statusTimer) { clearTimeout(this._statusTimer); this._statusTimer = null; }
        // Hand focus back to where it was before open() moved it into the menu.
        var back = this._restoreFocusTo;
        this._restoreFocusTo = null;
        if (back && back.focus && document.contains(back)) {
            try { back.focus(); } catch (e) { /* ignore */ }
        }
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
                // Click outside the dropdown — close, unless cooldown is active
                if (step.copyDropdown.cooldown.active) return;
                // ...or unless this is the click that terminated a drag: it
                // fires on the mousedown/mouseup common ancestor, outside
                // .copyMenu, so _stopInsideClicks never sees it.
                if (self._dragEndedAt && (Date.now() - self._dragEndedAt) < COPY_DRAG_CLICK_GRACE_MS) return;
                // ...or the click that ended a text-selection drag: a live
                // selection means "re-seed the grid", not "dismiss".
                var sel = window.getSelection();
                if (sel && !sel.isCollapsed) return;
                self.close();
            }
        };
        // Defer binding by one tick: the click that triggered open() is still
        // bubbling and would reach this handler and close the dropdown.
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

    _onPassageSync: function () {
        if (step.copyDropdown.openPanelId === this.panelId) this.dismiss();
    },

    _stopInsideClicks: function (ev) { ev.stopPropagation(); },

    // step_ready.js binds single-key shortcuts on document *keyup* (Left/Right
    // = prev/next chapter), while this menu handles keydown — so swallow the
    // matching keyup for events originating inside the menu, or grid-cell
    // navigation also flips the chapter and closes the menu.
    _stopMenuNavKeyup: function (ev) {
        switch (ev.which) {
            case 13: /* Enter */
            case 27: /* Esc */
            case 32: /* Space */
            case 35: /* End */
            case 36: /* Home */
            case 37: /* Left */
            case 38: /* Up */
            case 39: /* Right */
            case 40: /* Down */
                ev.stopPropagation();
                break;
            default:
                break;
        }
    },

    // ------------------------------------------------------------------
    // Movable menu. Moving requires position:fixed — #columnHolder's
    // overflow-y:hidden clips absolutely-positioned descendants, and no
    // ancestor sets transform/filter/etc., so fixed escapes the clip; the
    // z-index bump (copy_dropdown.scss) clears #stepnavbar's 1030.
    // ------------------------------------------------------------------

    _menuEl: function () { return this.$el.find(".copyMenu"); },

    // Mirrors the <=640px bottom-sheet media query in copy_dropdown.scss.
    // Keep the two in step.
    _isBottomSheet: function () {
        return !!(window.matchMedia && window.matchMedia("(max-width: 640px)").matches);
    },

    // Height is re-measured every time against the natural content, so the cap
    // we applied last time has to come off first — otherwise repeated
    // re-clamps measure their own constraint and ratchet the box shorter.
    //
    // Width is measured once, on the transition into floating, and then held.
    // That is both nicer (the menu doesn't resize under your cursor mid-drag)
    // and necessary: .copyMenu--floating sets right:auto and max-width:none,
    // so a floating menu re-measured with width cleared would shrink-to-fit
    // against the whole viewport instead of its 280-420px band.
    _measureMenu: function ($menu) {
        var isFloating = $menu.hasClass("copyMenu--floating");
        $menu.css({ maxHeight: "" });
        if (!isFloating) $menu.css({ width: "" });
        var rect = $menu[0].getBoundingClientRect();
        var vw = window.innerWidth || document.documentElement.clientWidth;
        var vh = window.innerHeight || document.documentElement.clientHeight;
        return {
            // Held width still has to survive the window being made narrower.
            w: Math.min(Math.round(rect.width), vw - (COPY_DRAG_GUTTER * 2)),
            h: Math.min(Math.round(rect.height), vh - (COPY_DRAG_GUTTER * 2)),
            left: rect.left,
            top: rect.top
        };
    },

    _clampFloating: function (pos, menuW, menuH) {
        var vw = window.innerWidth || document.documentElement.clientWidth;
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var maxLeft = Math.max(COPY_DRAG_GUTTER, vw - menuW - COPY_DRAG_GUTTER);
        var maxTop = Math.max(COPY_DRAG_GUTTER, vh - menuH - COPY_DRAG_GUTTER);
        return {
            left: Math.round(Math.min(Math.max(pos.left, COPY_DRAG_GUTTER), maxLeft)),
            top: Math.round(Math.min(Math.max(pos.top, COPY_DRAG_GUTTER), maxTop))
        };
    },

    _pinMenu: function ($menu, pos, size) {
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var at = this._clampFloating(pos, size.w, size.h);
        $menu.addClass("copyMenu--floating").css({
            left: at.left + "px",
            top: at.top + "px",
            width: size.w + "px",
            maxHeight: Math.max(120, vh - at.top - COPY_DRAG_GUTTER) + "px"
        });
        return at;
    },

    // Measure + pin in one go. Returns the clamped position, or null if the
    // menu has no box to measure yet.
    _applyFloating: function (pos) {
        var $menu = this._menuEl();
        if (!$menu.length) return null;
        var size = this._measureMenu($menu);
        if (!size.w || !size.h) return null;
        return this._pinMenu($menu, pos, size);
    },

    _clearFloating: function () {
        this._menuEl()
            .removeClass("copyMenu--floating copyMenu--dragging")
            .css({ left: "", top: "", width: "", maxHeight: "" });
    },

    // Top right of the panel, tucked just under the options bar. this.$el is
    // the .passageOptionsGroup, which spans the panel's full width, so its
    // right edge is the panel's right edge.
    _defaultFloatingPosition: function (menuW) {
        var box = null;
        if (this.$el.length && this.$el[0].getBoundingClientRect) box = this.$el[0].getBoundingClientRect();
        if (!box || !box.width) {
            var container = step.util.getPassageContainer(this.panelId);
            if (container && container.length) box = container[0].getBoundingClientRect();
        }
        if (!box || !box.width) return null;
        return { left: box.right - menuW - COPY_DRAG_GUTTER, top: box.bottom + COPY_DRAG_GUTTER };
    },

    _positionOnOpen: function () {
        var $menu = this._menuEl();
        if (!$menu.length) return;

        var saved = step.copyDropdown.dragPosition;
        if (saved) {
            // Re-clamp on the way in: the window may have been resized, or the
            // menu may have grown, since it was parked.
            var at = this._applyFloating(saved);
            if (at) step.copyDropdown.dragPosition = at;
            return;
        }

        // Never moved. Phones keep the CSS bottom sheet; everything else opens
        // at the top right of its own panel.
        if (this._isBottomSheet()) { this._clearFloating(); return; }
        this._clearFloating();
        var menuW = Math.round($menu[0].getBoundingClientRect().width);
        var def = menuW ? this._defaultFloatingPosition(menuW) : null;
        if (def) this._applyFloating(def);
    },

    _reclampFloating: function () {
        var $menu = this._menuEl();
        if (!$menu.length || !$menu.hasClass("copyMenu--floating")) return;
        var rect = $menu[0].getBoundingClientRect();
        var at = this._applyFloating({ left: rect.left, top: rect.top });
        // Only write back if the user has actually parked it somewhere; the
        // default position stays a default so a second panel gets its own.
        if (at && step.copyDropdown.dragPosition) step.copyDropdown.dragPosition = at;
    },

    _bindViewportWatch: function () {
        var ns = ".copyDrag" + this.panelId;
        $(window).on("resize" + ns + " orientationchange" + ns, this._onViewportChange);
    },

    _unbindViewportWatch: function () {
        var ns = ".copyDrag" + this.panelId;
        $(window).off("resize" + ns + " orientationchange" + ns);
        if (this._viewportTimer) { clearTimeout(this._viewportTimer); this._viewportTimer = null; }
    },

    _onViewportChange: function () {
        var self = this;
        if (this._viewportTimer) clearTimeout(this._viewportTimer);
        this._viewportTimer = setTimeout(function () {
            self._viewportTimer = null;
            if (self._isOpen()) self._positionOnOpen();
        }, 100);
    },

    // ----- drag transport -----
    //
    // Pointer Events when available (one path for mouse, touch and pen), with
    // a mouse+touch fallback for the older iOS/IE browsers this app still
    // carries. The document-level move/end listeners go on natively rather
    // than through jQuery: Chrome registers document-level touchmove as
    // passive by default, which would make preventDefault() a silent no-op.

    onDragPointerDown: function (ev) {
        if (!window.PointerEvent) return;
        this._dragStart(ev, ev.originalEvent);
    },

    onDragMouseDown: function (ev) {
        if (window.PointerEvent) return;    // pointerdown already handled it
        var oe = ev.originalEvent || ev;
        if (oe.button !== undefined && oe.button !== 0) return;
        this._dragStart(ev, oe);
    },

    onDragTouchStart: function (ev) {
        if (window.PointerEvent) return;
        var oe = ev.originalEvent;
        if (!oe || !oe.changedTouches || !oe.changedTouches.length) return;
        this._dragStart(ev, oe.changedTouches[0]);
    },

    _dragStart: function (ev, pointer) {
        if (!pointer || this._drag) return;
        // The close button lives inside the handle — let it stay a button.
        if ($(ev.target).closest(".copyCloseBtn").length) return;
        var $menu = this._menuEl();
        if (!$menu.length) return;

        // Pin wherever the menu currently is before we start moving it, so the
        // grab point doesn't jump to the dropdown anchor on the first frame.
        var rect = $menu[0].getBoundingClientRect();
        var size = this._measureMenu($menu);
        if (!size.w || !size.h) return;
        var origin = this._pinMenu($menu, { left: rect.left, top: rect.top }, size);

        // Stops the drag from sweeping a text selection across the passage.
        ev.preventDefault();

        this._drag = {
            startX: pointer.clientX,
            startY: pointer.clientY,
            originLeft: origin.left,
            originTop: origin.top,
            size: size,
            moved: false,
            last: origin,
            pointerId: (pointer.pointerId !== undefined) ? pointer.pointerId : null,
            touchId: (pointer.identifier !== undefined) ? pointer.identifier : null
        };
        $menu.addClass("copyMenu--dragging");
        this._bindDragTransport();
    },

    // Pick our pointer out of the event, ignoring any other finger.
    _dragPointer: function (e) {
        var d = this._drag;
        if (!d) return null;
        if (e.changedTouches && e.changedTouches.length) {
            for (var i = 0; i < e.changedTouches.length; i++) {
                if (d.touchId === null || e.changedTouches[i].identifier === d.touchId) return e.changedTouches[i];
            }
            return null;
        }
        if (d.pointerId !== null && e.pointerId !== undefined && e.pointerId !== d.pointerId) return null;
        return e;
    },

    _dragMove: function (e) {
        var d = this._drag;
        if (!d) return;
        var p = this._dragPointer(e);
        if (!p) return;
        if (e.cancelable) e.preventDefault();
        var dx = p.clientX - d.startX;
        var dy = p.clientY - d.startY;
        if (!d.moved && (Math.abs(dx) > COPY_DRAG_THRESHOLD || Math.abs(dy) > COPY_DRAG_THRESHOLD)) d.moved = true;
        d.last = this._pinMenu(this._menuEl(), { left: d.originLeft + dx, top: d.originTop + dy }, d.size);
    },

    _dragEnd: function (e) {
        var d = this._drag;
        if (!d) return;
        if (e && this._dragPointer(e) === null) return;
        this._drag = null;
        this._unbindDragTransport();
        this._menuEl().removeClass("copyMenu--dragging");

        if (d.moved) {
            step.copyDropdown.dragPosition = d.last;
            this._dragEndedAt = Date.now();     // see _bindOutsideClick
            this._swallowNextOutsideClick();
            this._lastHandleTapAt = 0;
            return;
        }

        // Press with no movement. Two in quick succession — double-click with a
        // mouse, double-tap with a thumb — send the menu back to its default
        // corner. Detected here rather than via a dblclick binding because
        // preventDefault() on pointerdown suppresses the compatibility mouse
        // events that dblclick is synthesised from.
        var now = Date.now();
        if (this._lastHandleTapAt && (now - this._lastHandleTapAt) < 400) {
            this._lastHandleTapAt = 0;
            this._resetPosition();
        } else {
            this._lastHandleTapAt = now;
        }
    },

    _cancelDrag: function () {
        this._releaseClickSwallow();
        if (!this._drag) return;
        this._drag = null;
        this._unbindDragTransport();
        this._menuEl().removeClass("copyMenu--dragging");
    },

    // A drag (or a reset) ends with the pointer somewhere over the page, and
    // the browser still delivers a click there. Left alone that click acts on
    // whatever is underneath — clicking a tagged word opens the lexicon, for
    // instance. Eat exactly one click, and only if it lands outside the
    // dropdown, so a real click on a grid cell right after a drag still works.
    _swallowNextOutsideClick: function () {
        var self = this;
        if (this._clickSwallower) return;
        var handler = function (ev) {
            self._releaseClickSwallow();
            if (self.$el.find(".copyDropdown").has(ev.target).length) return;
            ev.stopPropagation();
            ev.preventDefault();
        };
        this._clickSwallower = handler;
        document.addEventListener("click", handler, true);   // capture: ahead of everything else
        this._clickSwallowTimer = setTimeout(function () { self._releaseClickSwallow(); }, COPY_DRAG_CLICK_GRACE_MS);
    },

    _releaseClickSwallow: function () {
        if (this._clickSwallowTimer) { clearTimeout(this._clickSwallowTimer); this._clickSwallowTimer = null; }
        if (this._clickSwallower) {
            document.removeEventListener("click", this._clickSwallower, true);
            this._clickSwallower = null;
        }
    },

    _bindDragTransport: function () {
        var self = this;
        var types = window.PointerEvent
            ? { move: ["pointermove"], end: ["pointerup", "pointercancel"] }
            : { move: ["mousemove", "touchmove"], end: ["mouseup", "touchend", "touchcancel"] };
        var move = function (e) { self._dragMove(e); };
        var end = function (e) { self._dragEnd(e); };
        var i;
        for (i = 0; i < types.move.length; i++) document.addEventListener(types.move[i], move, { passive: false });
        for (i = 0; i < types.end.length; i++) document.addEventListener(types.end[i], end, { passive: false });
        this._dragTransport = { move: move, end: end, types: types };
    },

    _unbindDragTransport: function () {
        var t = this._dragTransport;
        if (!t) return;
        var i;
        for (i = 0; i < t.types.move.length; i++) document.removeEventListener(t.types.move[i], t.move, { passive: false });
        for (i = 0; i < t.types.end.length; i++) document.removeEventListener(t.types.end[i], t.end, { passive: false });
        this._dragTransport = null;
    },

    // ----- keyboard + reset -----

    onDragKeydown: function (ev) {
        var nudge = ev.shiftKey ? 40 : 10;
        var dx = 0, dy = 0;
        switch (ev.which || ev.keyCode) {
            case 37: dx = -nudge; break;    // left
            case 39: dx = nudge; break;     // right
            case 38: dy = -nudge; break;    // up
            case 40: dy = nudge; break;     // down
            case 36: ev.preventDefault(); ev.stopPropagation(); this._resetPosition(); return;   // Home
            default: return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        var $menu = this._menuEl();
        if (!$menu.length) return;
        var rect = $menu[0].getBoundingClientRect();
        var at = this._applyFloating({ left: rect.left + dx, top: rect.top + dy });
        if (at) step.copyDropdown.dragPosition = at;
    },

    // Double-click / double-tap the handle, or press Home on the grip, to send
    // the menu back to its default corner.
    _resetPosition: function () {
        step.copyDropdown.dragPosition = null;
        this._clearFloating();
        this._positionOnOpen();
        // The gesture that triggered this is still mid-flight: the menu has
        // just jumped out from under the pointer, so the trailing click lands
        // on whatever is now at those coordinates — outside the menu — where it
        // would both dismiss the menu and act on the page underneath.
        this._dragEndedAt = Date.now();
        this._swallowNextOutsideClick();
    },

    remove: function () {
        if (step.copyDropdown.views[this.panelId] === this) delete step.copyDropdown.views[this.panelId];
        if (step.copyDropdown.openPanelId === this.panelId) step.copyDropdown.release(this.panelId);
        if (step.lastPassageSelection && step.lastPassageSelection.passageId === this.panelId) step.lastPassageSelection = null;
        if (this._statusTimer) { clearTimeout(this._statusTimer); this._statusTimer = null; }
        // Document- and window-level listeners outlive this.$el, so they have
        // to come off explicitly or a closed panel keeps dragging.
        this._cancelDrag();
        this._unbindViewportWatch();
        Backbone.View.prototype.remove.apply(this, arguments);
    },

    // ----- render -----

    _initUI: function () {
        var $dd = this.$el.find(".copyDropdown");
        if ($dd.find(".copyMenu").length === 0) {
            var headerTxt = _.escape(__s.copy || "Copy");
            var closeLabel = _.escape(__s.close || "Close");
            // No i18n key exists; English literal like the other menu strings.
            var moveLabel = "Move this window (drag, or use the arrow keys)";
            var html =
                '<div class="dropdown-menu pull-right stepModalFgBg copyMenu" role="dialog" aria-modal="false" ' +
                    'aria-labelledby="copyMenuTitle-' + this.panelId + '">' +
                    '<header class="copyMenuHeader copyDragHandle">' +
                        '<button type="button" class="copyDragGrip" aria-label="' + moveLabel + '" ' +
                            'title="' + moveLabel + '">' +
                            '<span class="glyphicon glyphicon-move" aria-hidden="true"></span>' +
                        '</button>' +
                        '<h2 id="copyMenuTitle-' + this.panelId + '">' + headerTxt + '</h2>' +
                        '<button type="button" class="copyCloseBtn" aria-label="' + closeLabel + '">×</button>' +
                    '</header>' +
                    '<div class="copyStatusRow" aria-live="polite"></div>' +
                    '<div class="copyGridSection" style="display:none"></div>' +
                    '<div class="copyOptionsStrip" style="display:none"></div>' +
                    // Footer content is rendered by _renderGridSection.
                    '<footer class="copyMenuFooter" style="display:none"></footer>' +
                '</div>';
            $dd.append(html);
        }
    },

    // Callers: open() (grid state just nulled) and, when the highlight
    // resolves, _onLiveSelectionChange (reseed=true) — so the seed below may
    // overwrite the grid range, and the whole-display branch only ever runs
    // with a null one. A re-seed keeps the options strip: re-rendering it
    // would revert checkboxes the user just changed.
    _update: function (reseed) {
        this._renderStatusRow("");
        var resolution = this._computeSelectionResolution();
        // Introspection surface for the e2e suites; app code never reads it.
        this._resolution = resolution;

        if (resolution.resolved) {
            // Seed the grid from the highlight; adjust by clicking new endpoints.
            this._gridStart = resolution.startIndex;
            this._gridEnd = resolution.endIndex;
        } else if (resolution.unresolvable) {
            // A real selection we failed to match must not silently
            // become a whole-chapter copy — say why the grid is empty.
            this._renderStatusRow(
                "We couldn't match your selection to a verse range — please pick below.",
                "unresolved");
        } else if (this.model.get("searchType") === "PASSAGE") {
            // No usable selection: pre-select everything displayed so the
            // footer Copy is genuinely one-click. Search panels are
            // excluded (their "verses" are result hits).
            var allVerses = step.copyText._getVerses(step.util.getPassageContainer(this.panelId));
            if (allVerses.length > 0) {
                this._gridStart = 0;
                this._gridEnd = allVerses.length - 1;
            }
        }

        this._renderGridSection();
        // A seeded range should be visible without hunting. Scroll only the
        // grid's own scroller — scrollIntoView would also scroll ancestors
        // like the overflow-hidden #columnHolder while the menu is still
        // inline, permanently shifting the app layout underneath.
        var startCell = this.$el.find('.copyGridCell[data-role="start"]')[0];
        var scroller = this.$el.find(".copyGridScroller")[0];
        if (startCell && scroller) {
            var c = startCell.getBoundingClientRect(), s = scroller.getBoundingClientRect();
            scroller.scrollTop += (c.top - s.top) - (s.height - c.height) / 2;
        }
        if (!reseed) this._renderOptionsStrip();
        this._applyCooldownState();
        // Re-seeding can change the menu's height; keep a pinned menu inside
        // the viewport when it does.
        this._reclampFloating();
    },

    // Keyboard entry point on open: the armed Copy when a range is seeded,
    // else the first grid cell.
    _focusInitial: function () {
        var $primary = this.$el.find(".copyGridPrimary");
        if ($primary.length && !$primary.prop("disabled")) $primary.focus();
        else this.$el.find(".copyGridCell").first().focus();
    },

    // A fresh highlight while the menu is open re-seeds the grid; an
    // unmatched one never disturbs the current range.
    _onLiveSelectionChange: function () {
        if (this._computeSelectionResolution().resolved) this._update(true);
    },

    _computeSelectionResolution: function () {
        var result = { resolved: false, startIndex: -1, endIndex: -1, unresolvable: false };
        var snap = step.copyDropdown.selectionSnapshot;
        if (!snap) return result;

        var startVerse = snap.startVerse || "";
        var endVerse = snap.endVerse || snap.startVerse || "";
        if (!startVerse && !endVerse) return result;

        var passageContainer = step.util.getPassageContainer(this.panelId);
        var startIdx = step.copyText._findVerseIndexByOsis(passageContainer, startVerse);
        var endIdx = step.copyText._findVerseIndexByOsis(passageContainer, endVerse);
        if (startIdx === -1 && endIdx > -1) startIdx = endIdx;
        if (endIdx === -1 && startIdx > -1) endIdx = startIdx;

        if (startIdx === -1 || endIdx === -1) {
            // Warn only about a fresh failed highlight from this panel; a stale
            // or foreign one silently falls back to the whole-display prefill.
            result.unresolvable = (Date.now() - snap.timestamp < 60000) &&
                (snap.passageId === undefined || snap.passageId === this.panelId);
            return result;
        }

        result.resolved = true;
        result.startIndex = Math.min(startIdx, endIdx);
        result.endIndex = Math.max(startIdx, endIdx);
        return result;
    },

    _renderGridSection: function () {
        var $section = this.$el.find(".copyGridSection");
        var $footer = this.$el.find(".copyMenuFooter");
        var passageContainer = step.util.getPassageContainer(this.panelId);
        var verses = step.copyText._getVerses(passageContainer);
        if (!verses.length) {
            $section.hide().empty();
            $footer.hide();
            this._renderStatusRow("The passage changed. Re-open the copy menu.", "stale-passage");
            return;
        }

        // 10 columns on desktop, 7 on small touch devices.
        var cols = 10;
        if (step.touchDevice) {
            var ua = navigator.userAgent.toLowerCase();
            if ((ua.indexOf("android") > -1) || (step.appleTouchDevice && ua.indexOf("safari/60") > -1)) {
                cols = 7;
            }
        }

        // Gather chapter label from first verse's OSIS anchor
        var chapterLabel = this._deriveChapterLabel(passageContainer);

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
                      'data-verse-index="' + i + '">' +
                      _.escape(label) +
                    '</button></td>';
        }
        html += "</tr></table></div>";

        $section.html(html).show();

        // Bind keydown in the capture phase at the dropdown level so arrow-key
        // navigation handles before any document-level listeners (Bootstrap
        // dropdown / IntroJS / etc.) get a chance to process the event. Esc is
        // routed from anywhere in the menu — the default focus is the armed
        // Copy chip, and Esc must still clear/dismiss from there.
        var self = this;
        var $dd = this.$el.find(".copyDropdown")[0];
        if ($dd && !this._gridKeydownBound) {
            $dd.addEventListener("keydown", function (ev) {
                var onCell = ev.target && ev.target.classList && ev.target.classList.contains("copyGridCell");
                if (!onCell && ev.which !== 27) return;
                self.onGridKeydown(ev);
            }, true);
            this._gridKeydownBound = true;
        }

        // Footer: primary copy chip left, inline success slot right (flex
        // spacing in copy_dropdown.scss).
        var gridCopyLabel = _.escape(__s.copy || "Copy");
        $footer.html('<button type="button" class="copyGridPrimary" disabled>' +
                     gridCopyLabel + '</button>' +
                     '<div class="copyFooterSuccess" role="status" aria-live="polite"></div>').show();

        this._gridVerseNames = verses;
        this._updateGridVisuals();
    },

    _deriveChapterLabel: function (passageContainer) {
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
            this.$el.find(".copyGridPrimary").prop("disabled", true).removeAttr("data-start-index data-end-index aria-label");
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
            // Screen readers get the full verse names; the visible chip stays "Copy".
            var names = this._gridVerseNames || [];
            if (names[lo]) {
                $primary.attr("aria-label", (__s.copy || "Copy") + " " + names[lo] +
                    (hi !== lo && names[hi] ? " to " + names[hi] : ""));
            }
        } else {
            $primary.removeAttr("data-start-index data-end-index aria-label");
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
                    '<legend>Versions</legend>';
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
                        'Include notes' +
                    '</label>' +
                    '<label>' +
                        '<input type="checkbox" class="copyXrefsToggle"' +
                            (wantXrefs ? ' checked' : '') + '>' +
                        'Include cross references' +
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
                           kind === "stale-passage")
                           ? "alert" : "status");
        $row.text(text);
    },

    _applyCooldownState: function () {
        var remaining = step.copyDropdown.remainingCooldownMs();
        var $primary = this.$el.find(".copyGridPrimary");
        var $close = this.$el.find(".copyCloseBtn");
        if (remaining > 0) {
            $primary.prop("disabled", true);
            $close.prop("disabled", true);
            var secs = Math.ceil(remaining / 1000);
            var msg = "Please wait %d seconds before copying again.".replace("%d", secs);
            this._renderStatusRow(msg, "cooldown");
        } else {
            // _updateGridVisuals owns the grid primary: enabled only when a
            // range is armed, so no blanket re-enable here.
            $close.prop("disabled", false);
        }
    },

    _onCooldownEnd: function () {
        if (step.copyDropdown.openPanelId !== this.panelId) return;
        this._renderStatusRow("");
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
                "You must select at least one version to copy.",
                "no-versions");
            return;
        }
        this._invokeGoCopy(startIndex, endIndex, $btn);
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
        // ev is the native DOM event (captured at the dropdown in _renderGridSection).
        var cell = ev.target;
        var idx = parseInt(cell.getAttribute("data-verse-index"), 10);
        if (ev.which === 27 /* Esc */) {
            ev.preventDefault();
            ev.stopPropagation();
            if (this._gridStart !== null) {
                this._gridStart = null;
                this._gridEnd = null;
                this._updateGridVisuals();
                // Clearing disarms (and disables) the Copy chip; a keyboard
                // user parked there needs somewhere to land.
                if (isNaN(idx)) this._focusInitial();
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
                    "You must select at least one version to copy.",
                    "no-versions");
            },
            showCopyError: function (err) {
                if (copyId !== step.copyDropdown.inFlightCopyId) return;
                self._renderStatusRow("Copy failed. Please try again.", "copy-error");
            },
            showClipboardDenied: function () {
                if (copyId !== step.copyDropdown.inFlightCopyId) return;
                self._renderStatusRow(
                    "Clipboard access was denied by the browser. Check permissions or use a secure (https) context.",
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

    _renderSuccessInline: function (msg) {
        // Defensively clear the top status row so a prior non-success message
        // (e.g. clipboard-denied from an earlier attempt) doesn't co-exist with
        // the inline green confirmation.
        this._renderStatusRow("");
        this.$el.find(".copyFooterSuccess").text(msg);
    },

    _clearInlineSuccess: function () {
        this.$el.find(".copyFooterSuccess").empty();
    },

    _onCopySuccess: function () {
        var self = this;
        var msg = __s.text_is_copied || "The text is copied, ready to be pasted";
        this._renderSuccessInline(msg);
        this.$el.find(".copyGridPrimary").prop("disabled", true);
        if (this._statusTimer) clearTimeout(this._statusTimer);
        this._statusTimer = setTimeout(function () {
            self._clearInlineSuccess();
            self._updateGridVisuals(); // re-enables the primary; the range is still armed
            if (document.activeElement === document.body) self._focusInitial();
            self._statusTimer = null;
        }, 1500);
    },

    _onRapidWarning: function (versionsString, sleepMs) {
        // Defense-in-depth: a stale inline green from a prior copy must not
        // visibly coexist with the rapid-warning at the top.
        this._clearInlineSuccess();
        step.copyDropdown.startCooldown(sleepMs || 5000, "rate");
        var secs = Math.ceil((sleepMs || 5000) / 1000);
        var template =
            "You are copying at a rapid pace. Please review the copyright terms for: %s. Wait %d seconds.";
        var msg = template.replace("%s", versionsString).replace("%d", secs);
        this._renderStatusRow(msg, "rapid-warning");
        this.$el.find(".copyGridPrimary").prop("disabled", true);
        this.$el.find(".copyCloseBtn").prop("disabled", true);
    }
});

window.PassageCopyMenuView = PassageCopyMenuView;
