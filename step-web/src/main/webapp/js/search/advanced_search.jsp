<div class="advancedSearch" style="clear: both">

	<!-- Passage search -->
	<fieldset>
		<legend>Passage search</legend>
		<span class="passageButtons">
<!-- 			<input type="button" class="exactStrongNumber" value="Lookup" title="Look up a reference in the selected Bible"/>	 -->
			<a class="continuousPassage">Displays the passage as one large scroll</a>
			<a class="previousChapter">Displays the previous chapter (or expands to the start of the chapter)</a>
			<a class="nextChapter">Displays the next chapter (or expands to the end of the chapter)</a>
			<a class="bookmarkPassageLink">Add a bookmark</a>
		</span>

		<table width="50%">
			<tr>
				<td>
					Bible version
				</td>
				<td><input type="text" class="passageVersion" size="15" />
				</td>
				<td style="padding-left: 10px">
					Scripture Reference
				</td>
				<td><input type="text" class="passageReference" size="15" />
				</td>
			</tr>	
		</table>
	</fieldset>

	<fieldset>
		<legend>Original word search</legend>
		<span class="passageButtons">
					<input type="button" class="exactStrongNumber" value="Exact word"
						title="This will search for all passages containing this Strong number" />
					<input type="button" class="relatedStrongNumbers" value="Similar words"
						title="This will search the specified strong number and any similar Greek forms" />
		</span>
		<table>
			<tr>
				<td>Strong</td>
				<td><input type="text" class="strongSearch" /></td>
			</tr>
		</table>
	</fieldset>

	<fieldset>
		<legend>Lexicon definition search</legend>
		<table>
			<tr>
				<td>Strong</td>
				<td><input type="text" class="strongSearch" /></td>
			</tr>
		</table>			
	</fieldset>

	<fieldset>
		<legend>Timeline search</legend>
		<table style="width: 100%">
			<tr>
				<td>Search by scripture reference</td>
				<td><input type="text" class="timelineReference" /></td>
				<td colspan="3"><input type="button" class="timelineReferenceSearch passageButtons" value="Search"
						title="Finds timeline events related to the selected reference" /></td>
			</tr>
			<tr>
				<td>Search by description</td>
				<td><input type="text" class="timelineEventDescription" /></td>
				<td colspan="3"><input class="timelineDescriptionSearch passageButtons" type="button" value="Search"</td>
			</tr>
			<tr>
				<td>Search by date</td>
				<td><input type="text" class="timelineDate" /></td>
				<td> +/- </td> 
				<td><input type="text" class="timelineYears" size="4" /> years</td>
				<td><input class="timelineDateSearch passageButtons" type="button" value="Search" /></td>
			</tr>
		</table>
	</fieldset>
</div>