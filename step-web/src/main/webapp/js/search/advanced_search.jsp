<div class="advancedSearch" style="clear: both">

	<!-- Passage search -->
	<fieldset>
		<legend>Passage search</legend>
		<span class="passageButtons"> <!-- 			<input type="button" class="exactStrongNumber" value="Lookup" title="Look up a reference in the selected Bible"/>	 -->
			<a class="continuousPassage">Displays the passage as one large
				scroll</a> <a class="previousChapter">Displays the previous chapter
				(or expands to the start of the chapter)</a> <a class="nextChapter">Displays
				the next chapter (or expands to the end of the chapter)</a> <a
			class="bookmarkPassageLink">Add a bookmark</a>
		</span>

		<table width="50%">
			<tr>
				<td>Bible version</td>
				<td><input type="text" class="passageVersion" size="15" /></td>
				<td style="padding-left: 10px">Scripture Reference</td>
				<td><input type="text" class="passageReference" size="15" /></td>
			</tr>
		</table>
	</fieldset>

	<fieldset>
		<legend>Textual search</legend>

		<table class="textSearchTable">
			<tr>
				<td colspan="4"><h4
						title="This is used for the main search query. Results returned are centered on this query.">First
						query [TODO - Add slider]</h4></td>
			</tr>
			<tr>
				<td>Include exact phrase</td>
				<td><input type="text" class="textPrimaryExactPhrase" size="15" /></td>
				<td>Include any of these words</td>
				<td><input type="text" class="textPrimaryIncludeWords"
					size="15" /></td>
			</tr>
			<tr>
				<td>Exclude this exact phrase</td>
				<td><input type="text" class="textPrimaryExcludePhrase"
					size="15" /></td>
				<td>Exclude these words</td>
				<td><input type="text" class="textPrimaryExcludeWords"
					size="15" /></td>
			</tr>
			<tr>
				<td>Include spellings similar to</td>
				<td><input type="text" class="textPrimarySimilarSpellings"
					size="15" /></td>
				<td>Words starting with</td>
				<td><input type="text" class="textPrimaryWordsStarting"
					size="15" /></td>
			</tr>
			<tr>
				<td>Include these words</td>
				<td colspan="1"><input type="text"
					class="textPrimaryIncludeRangedWords" size="15" /></td>
				<td colspan="2">if they are within <input type="text"
					class="textPrimaryWithinXWords" size="2" /> words of each other
				</td>
			</tr>
			<tr>
				<td colspan="4"><hr />
			</tr>
			<tr>
				<td colspan="4">
					<h4
						title="Use a secondary query if you want to look for terms that are close to the first query">Second
						query</h4>
				</td>
			</tr>
			<tr>
				<td>Include exact phrase</td>
				<td><input type="text" class="textCloseByExactPhrase" size="15" /></td>
				<td>Include any of these words</td>
				<td><input type="text" class="textCloseByIncludeWords"
					size="15" /></td>
			</tr>
			<tr>
				<td>Exclude these words</td>
				<td><input type="text" class="textCloseByExcludeWords"
					size="15" /></td>
				<td>Exclude this exact phrase</td>
				<td><input type="text" class="textCloseByExcludePhrase"
					size="15" /></td>
			</tr>
			<tr>
				<td>Include spellings similar to</td>
				<td><input type="text" class="textCloseBySimilarSpellings"
					size="15" /></td>
				<td>Words starting with</td>
				<td><input type="text" class="textCloseByWordsStarting"
					size="15" /></td>
			</tr>
			<tr>
				<td>Include these words</td>
				<td colspan="1"><input type="text"
					class="textCloseByIncludeRangedWords" size="15" /></td>
				<td colspan="2">if they are within <input type="text"
					class="textCloseByWithinXWords" size="2" /> words of each other
				</td>
			</tr>
			<tr>
				<td colspan="4"><hr />
			</tr>
			<tr>
				<td colspan="4">
					<h4
						title="Use a secondary query if you want to look for terms that are close to the first query">Search
						options</h4>
				</td>
			</tr>
			<tr>
				<td colspan="4">First and second queries are within 
				<input type="text" class="textVerseProximity" size="2" /> verses of each other</td>
			</tr>
			<tr>
				<td>Restrict search to</td>
				<td><input type="text" class="textRestriction" size="15" /></td>
			</tr>
			<tr>
				<td>Sort results by relevance</td>
				<td><input type="checkbox" class="textSortByRelevance"
					size="15" /></td>
			</tr>
			<tr>
				<td>Query syntax</td>
				<td colspan="3"><textarea class="textQuerySyntax" cols="70"></textarea></td>
			</tr>
			<tr>
				<td colspan="3">&nbsp;</td>
				<td colspan="1" style="float: right"><input type="button"
					class="textClearButton" value="Clear" />
				<input type="button"
					class="textSearchButton" value="Search" /></td>
			</tr>
		</table>
	</fieldset>

	<fieldset>
		<legend>Original word search</legend>
		<span class="passageButtons"> <input type="button"
			class="exactStrongNumber" value="Exact word"
			title="This will search for all passages containing this Strong number" />
			<input type="button" class="relatedStrongNumbers"
			value="Similar words"
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
				<td colspan="3"><input type="button"
					class="timelineReferenceSearch passageButtons" value="Search"
					title="Finds timeline events related to the selected reference" /></td>
			</tr>
			<tr>
				<td>Search by description</td>
				<td><input type="text" class="timelineEventDescription" /></td>
				<td colspan="3"><input
					class="timelineDescriptionSearch passageButtons" type="button"
					value="Search"</td>
			</tr>
			<tr style="display: none">
				<td>Search by date</td>
				<td><input type="text" class="timelineDate" /></td>
				<td>+/-</td>
				<td><input type="text" class="timelineYears" size="4" /> years</td>
				<td><input class="timelineDateSearch passageButtons"
					type="button" value="Search" /></td>
			</tr>
		</table>
	</fieldset>
</div>