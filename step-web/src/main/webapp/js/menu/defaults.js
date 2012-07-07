step.menu.defaults("OPTIONS", "SHOW_ALL_VERSIONS");
step.menu.defaults("VIEW", function() { return [["QUICK_VIEW", "DEEPER_VIEW", "DETAILED_VIEW"][step.state.detail.get()]]; });
step.menu.defaults("DISPLAY", ["HEADINGS", "VERSE_NUMBERS", "NOTES"]);
