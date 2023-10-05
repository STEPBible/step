var step;
var __s;
BIBLE_GET_FEATURES = "getBibleFeatures";

module("STEP Passage Menu View Test", {
    setup: function () {
        $.getSafe = function() { };
        this.menuElement = $("<div>");

        this.option1 = $("<a name='option1'>");
        this.option2 = $("<a name='option2'><img class='selectingTick' /></a>");
        this.option3 = $("<a name='option3' class='disabled'>");
        this.option4 = $("<a name='option4' class='disabled'><img class='selectingTick' /></a>");

        //create a few more options to ensure iteration doesn't create extra commas
        this.option5 = $("<a name='option5'><img class='selectingTick' /></a>");

        this.menuElement.append(this.option1);
        this.menuElement.append(this.option2);
        this.menuElement.append(this.option3);
        this.menuElement.append(this.option4);
        this.menuElement.append(this.option5);

        //match model to above, otherwise intialising will reset it
        this.model = new PassageModel({ options : ["option2", "option4", "option5"]});
        this.menu = new PassageMenuView({ el : this.menuElement, model : this.model });
    }
});

test("PassageMenuView Testing isTicked", function () {
    equals(false, this.menu.isTicked(this.option1));
    equals(true, this.menu.isTicked(this.option2));
    equals(false, this.menu.isTicked(this.option3));
    equals(true, this.menu.isTicked(this.option4));
});

test("PassageMenuView Testing isSelectable", function () {
    equals(true, this.menu.isSelectable(this.option1));
    equals(true, this.menu.isSelectable(this.option2));
    equals(false, this.menu.isSelectable(this.option3));
    equals(false, this.menu.isSelectable(this.option4));
});

test("PassageMenuView Testing isSelected", function () {
    equals(false, this.menu.isSelected(this.option1));
    equals(true, this.menu.isSelected(this.option2));
    equals(false, this.menu.isSelected(this.option3));
    equals(false, this.menu.isSelected(this.option4));
});

test("PassageMenuView Option string is concatenated version of selected options", function () {
    equals(this.menu.getOptionString(), ["option2", "option5"]);
});


test("PassageMenuView Menu options are restored", function () {
    //set up the options against the model
    this.model.set("options", ["option1", "option3"]);

    //recreate menu
    this.menu = new PassageMenuView({ el : this.menuElement, model : this.model });

    //check options have been selected in DOM
    equals(this.menu.isTicked(this.option1), true);
    equals(this.menu.isTicked(this.option2), false);
    equals(this.menu.isTicked(this.option3), true);
    equals(this.menu.isTicked(this.option4), false);
});

test("Check Refresh Menu options works disables and enables correctly.", function() {
    $.getSafe = function(url, args, callback) { callback({ removed : [{explanation: "Removed", option : "option1" }] }); };
    $.fn.qtip = function() {};

    this.menu.refreshMenuOptions();

    //we should have option 1 as disabled, option 2 selected, option 3 available and option 4 selected
    equals(this.menu.isSelectable(this.option1), false);
    equals(this.menu.isSelected(this.option2), true);

    //selectable but not selected
    equals(this.menu.isSelectable(this.option3), true);
    equals(this.menu.isSelected(this.option3), false);

    equals(this.menu.isSelected(this.option4), true);

    //option1 was disabled, so should have a title attribute with some text
    equals("Removed", this.option1.attr("title"));
});
