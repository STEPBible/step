/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project All rights
 * reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer. Redistributions in binary
 * form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided
 * with the distribution. Neither the name of the Tyndale House, Cambridge
 * (www.TyndaleHouse.com) nor the names of its contributors may be used to
 * endorse or promote products derived from this software without specific prior
 * written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
var step = window.step || {};
step.menu = {
    tickOneItemInMenuGroup : function(menuTriggerOrMenuName, menuItem, passageId) {
        if (!menuTriggerOrMenuName.menu) {
            var menuItemSelector = this.getMenuItem(menuItem, passageId);
            var menu = this.getParentMenu(menuItemSelector);

            menuTriggerOrMenuName = {
                menu : {
                    element : menu.element
                },
                menuItem : {
                    element: menuItemSelector
                }
            };
        }

        // untick all menu items, then tick one
        this.untickAll(menuTriggerOrMenuName.menu.element);
        return this.tickMenuItem(menuTriggerOrMenuName.menuItem.element);
    },

    tickMenuItem : function(selectedItem) {
        // check selectable
        if (!this.isSelectable(selectedItem)) {
            return false;
        }

        $(selectedItem).not(":has(img)").append("<img class='selectingTick' src='images/selected.png' />");
        return true;
    },

    untickMenuItem : function(selectedItem) {
        $("img.selectingTick", selectedItem).remove();
    },

    untickAll : function(selectorOrMenuName, passageId) {
        var menu = selectorOrMenuName;
        if (typeof (selectorOrMenuName) == 'string') {
            if (passageId) {
                menu = $("a[menu-name = '" + selectorOrMenuName + "']", step.util.getPassageContainer(passageId));
            } else {
                menu = $("a[menu-name = '" + selectorOrMenuName + "']");
            }
        }

        $(menu).find("img.selectingTick").remove();
    },

    toggleMenuItem : function(selectedItem) {
        // check selectable:
        if (!this.isSelectable(selectedItem)) {
            return false;
        }

        var matchedSelectedIcon = $(selectedItem).children(".selectingTick");

        if (matchedSelectedIcon.length) {
            matchedSelectedIcon.remove();
            return false;
        } else {
            this.tickMenuItem(selectedItem);
            return true;
        }
    },

    getSelectedOptions : function(menu) {
        var menuElement = menu;
        if (menu.element) {
            // then use element, otherwise assume we've got the element
            menuElement = menu.element;
        }

        // we select all ticks, but only enabled
        var selectedOptions = [];
        $("a:has(img.selectingTick)", menuElement).not(".disabled").each(function(index, value) {
            selectedOptions.push(value.name);
        });
        return selectedOptions;
    },

    getSelectedOptionsForMenu : function(passageId, menuName) {
        return this.getSelectedOptions($("li[menu-name=" + menuName + "]", step.util.getPassageContainer(passageId)));
    },

    isOptionSelected : function(optionName, passageId) {
        return this.getMenuItem(optionName, passageId).has("img.selectingTick").size() != 0;
    },

    defaults : function(menuName, itemList) {
        var self = this;
        $(document).ready(function() {
            var menu = $("li[menu-name=" + menuName + "]");

            var myItems = $.isFunction(itemList) ? itemList() : itemList;
            var items = $.isArray(myItems) ? myItems : [ myItems ];
            for ( var item in items) {
                self.tickMenuItem($("a[name='" + items[item] + "']", menu));
            }
        });
    },

    isSelectable : function(selector) {
        return !$(selector).hasClass("disabled");
    },

    handleClickEvent : function(menuItem) {
        var passageId = step.passage.getPassageId(menuItem);
        if (!passageId) {
            passageId = "";
        }

        var menu = this.getParentMenu(menuItem);

        $.shout("MENU-" + menu.name, {
            menu : menu,
            menuItem : {
                element : menuItem,
                name : menuItem.name
            },
            passageId : passageId
        });
    },

    /**
     * Gets a menu trigger that can be sent to the tick functions
     * @param menuItemName the item we are dealing with
     * @param parentItemName the parent item name
     * @returns {{menu: *, menuItem: {element: *, name: *}, passageId: *}}
     */
    getMenuTrigger : function(menuItemName, parentItemName) {
        var parentElement = $("li[menu-name='" + parentItemName + "']");
        var menuItem = parentElement.find("a[name='" + menuItemName + "']");

        var menu = this.getParentMenu(parentElement);

        return {
            menu : menu,
            menuItem : {
                element : menuItem,
                name : menuItemName
            },
            passageId : ""
        }
    },

    getParentMenu : function(menuItem) {
        var menu = $(menuItem).closest("li[menu-name]");
        return {
            element : menu,
            name : menu.attr("menu-name")
        };
    },

    getMenuItem : function(optionName, passageId) {
        if (passageId != undefined) {
            return $(".passageContainer[passage-id = " + passageId + "] li[menu-name] a[name = '" + optionName + "']");
        } else {
            return $("li[menu-name] a[name = '" + optionName + "']");
        }
    }
};
