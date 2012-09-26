<%@ page contentType="text/html; charset=UTF-8" language="java" %> 


<span id='lexiconDefinition'>
	<ul id="lexiconDefinitionHeader">
		<span id="lexiconPopupClose">x</span>
			<li><a href="#origin">Original Word</a></li>
			<li><a href="#context">Context</a></li>
	</ul>

	<div id="origin" name="LEXICON_DEFINITION">
			
			<div><i>Search for the <a href="#" onclick="step.lexicon.sameWordSearch();">same word</a>, all <a href="#" onclick="step.lexicon.relatedWordSearch();">related words</a>, or <a href="#" onclick="step.lexicon.wordGrammarSearch();">this word with this grammar</a></i></div>
			<p />
			<!--  Vocab -->
			<div id="vocabContainer" class="metadataContainer">
				<h3>Vocab</h3>
				<div level="0">
					<div><h5 info-name="stepTransliteration"></h5> (<span info-name="accentedUnicode" class="ancientLanguage"></span>): <span info-name="shortDef"></span></div>
				</div>
				<div level="1">
					<hr />
					<div><h5>Translated in the Bible as: </h5></div>
					<div><h5>Meaning: </h5> <span info-name="mediumDef"></span> </div>
				</div>	
				<div level="2">
					<hr />
					<div>Related Words: <span info-name="relatedNos" class="ancientLanguage"></span></div>
					<h5>LSJ Definition (for Strong's <span info-name="strongNumber"></span>):</h5><div info-name="lsjDefs" ></div>
				</div>
			</div>
			<p />
			<!--  Gramar -->
			<div id="grammarContainer" class="metadataContainer">
				<h3>Grammar</h3>
				<!-- Quick view -->
				<span level="0">
					<h5 info-name="functionNotes|function"></h5>: <span info-name="person"></span> <span depends-on="person">Person</span> 
					<span info-name="number"></span> <span info-name="gender"></span> 
					
					<span depends-on="wordCase,mood,gender,suffix">
						( 
						<span info-name="wordCase"></span> <span info-name="tense"></span>
						<span info-name="voice"></span> <span info-name="mood"></span> 
						<span info-name="gender"></span>
						<span info-name="suffix"></span>
						) 
					</span>
					<br/>
					<span info-name="description"></span>
					<br />
				</span>
				<span level="1" depends-on="explanation">
					<span info-name="explanation"></span><br />
				</span>
				<span level="2">
					<table>
						<tr depends-on="functionDescription">
							<td><h5>Function:</h5></td>
							<td><span info-name="function"></span></td>
							<td><h5>i.e.</h5></td>
							<td><span info-name="functionExplained"></span></td>
						</tr>
						<tr depends-on="personDescription">
							<td><h5>Person:</h5></td>
							<td><span info-name="person"></span></td>
							<td><h5>i.e.</h5></td>
							<td><span info-name="personExplained"></span></td>
						</tr>
						<tr depends-on="genderDescription">
							<td><h5>Gender:</h5></td>
							<td><span info-name="gender"></span></td>
							<td><h5>i.e.</h5></td>
							<td><span info-name="genderExplained"></span></td>
						</tr>
						<tr depends-on="numberDescription">
							<td><h5>Number:</h5></td>
							<td><span info-name="number"></span></td>
							<td><h5>i.e.</h5></td>
							<td><span info-name="numberExplained"></span></td>
						</tr>
						<tr depends-on="caseDescription">
							<td><h5>Case:</h5></td>
							<td><span info-name="wordCase"></span></td>
							<td><h5>i.e.</h5></td>
							<td><span info-name="caseExplained"></span></td>
						</tr>
						<tr depends-on="tenseDescription">
							<td><h5>Tense:</h5></td>
							<td><span info-name="tense"></span></td>
							<td><h5>i.e.</h5></td>
							<td><span info-name="tenseExplained"></span></td>
						</tr>
						<tr depends-on="moodDescription">
							<td><h5>Mood:</h5></td>
							<td><span info-name="mood"></span></td>
							<td><h5>i.e.</h5></td>
							<td><span info-name="moodExplained"></span></td>
						</tr>
						<tr depends-on="voiceDescription">
							<td><h5>Voice:</h5></td>
							<td><span info-name="voice"></span></td>
							<td><h5>i.e.</h5></td>
							<td><span info-name="voiceExplained"></span></td>
						</tr>
						<tr depends-on="suffixDescription">
							<td><h5>Extra:</h5></td>
							<td><span info-name="suffix"></span></td>
							<td><h5>i.e.</h5></td>
							<td><span info-name="suffixExplained"></span></td>
						</tr>
					</table>
				</span>
			</div>
			
	</div>
	<div id="context">
		<p></p>
	</div>
</span>
