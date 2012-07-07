step.navigation = {
	showBottomSection: function(menuItem) {
		if (step.passage.getPassageId(menuItem) == 0) {
			var verse = $('#leftPassageReference').val();
			$('.timelineContext:first').html(verse);
		}
		else {
			var verse = $('#rightPassageReference').val();
			$('.timelineContext:first').html(verse);	
		}
	
		var bottomSection = $("#bottomSection");
		var bottomSectionContent = $("#bottomSectionContent");
		
		bottomSection.show();
		bottomSection.height(250);
		bottomSectionContent.height(225);
		
		refreshLayout();
	},
	
	hideBottomSection: function() {
		var bottomSection = $("#bottomSection");
		var bottomSectionContent = $("#bottomSectionContent");

		bottomSection.hide();
		bottomSection.height(0);
		bottomSectionContent.height(0);
		
		refreshLayout();
	}
};
