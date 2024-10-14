package com.tyndalehouse.step.core.xsl.impl;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;

/**
 * A utility to provide colors to an xsl spreadsheet. This is a non-static utility since later on we may wish
 * to provide configuration to vary the colours, etc.
 * 
 * We use American spelling for Color because we then avoid various spellings across the code base.
 * 
 * The rules for colour coding are:
 * <p>
 * Green for anything that finishes -1S -2S -3S SM SN or SF (indicates Singular)
 * <p>
 * Red for anything that finishes -1P -2P -3P PM PN or PF (indicates Plural)
 * <p>
 * <p>
 * Depending on other characteristics we vary the shade of the colour
 * <p>
 * <p>
 * Darkest for verbs and Nominative (ie the person who is doing it),
 * <p>
 * ie anything ending -1S -2S -3S NSM NSN NSF NPM NPN or NPF
 * <p>
 * Lighter for Vocative and Objective (ie a person being addressed, or the person/thing which is being acted
 * on)
 * <p>
 * ie anything ending VSM VSN VSF VPM VPN VPF OSM OSN OSF OPM OPN or OPF
 * <p>
 * Pale for Genative or Dative (ie the person/thing owning another thing or doing to/by/from a thing)
 * <p>
 * ie anything ending GSM GSN GSF GPM GPN or GPF or DSM DSN DSF DPM DPN or DPF
 * 
 * 
 */
public class ColorCoderProviderImpl {
    private static final Logger LOGGER = LoggerFactory.getLogger(ColorCoderProviderImpl.class);
    private static final String ROBINSON_PREFIX_LC = "robinson:";
    private static final String ROBINSON_PREFIX_UC = "ROBINSON:";
	private static final String SB_PREFIX_LC = "sb:";
	private static final int ROBINSON_PREFIX_LENGTH = ROBINSON_PREFIX_LC.length();
	private static final int SB_PREFIX_LENGTH = SB_PREFIX_LC.length();
    private static final int MINIMUM_MORPH_LENGTH = 2;

    // css classes
    private final EntityIndexReader morphology;

    /**
     * @param manager the manager from which to obtain an index reader for morphology information
     */
    @Inject
    public ColorCoderProviderImpl(final EntityManager manager) {
        this.morphology = manager.getReader("morphology");
    }

    /**
     * @param morph the robinson morphology
     * @return the classname
     */
    public String getColorClass(final String morph) {
        if (morph == null || morph.length() < MINIMUM_MORPH_LENGTH || morph.startsWith("TOS:") ||
				morph.startsWith("oshm:") ||  morph.startsWith("H"))
            return "";
        String classes = null;
		String curMorph;
        if (morph.startsWith(ROBINSON_PREFIX_LC) || morph.startsWith(ROBINSON_PREFIX_UC))
			curMorph = morph.substring(ROBINSON_PREFIX_LENGTH);
		else if (morph.startsWith(SB_PREFIX_LC))
			curMorph = morph.substring(SB_PREFIX_LENGTH);
		else
			curMorph = morph;
            // we're in business and we know we have at least 2 characters
		LOGGER.debug("Identifying grammar for [{}]", morph);

		final int firstSpace = curMorph.indexOf(' ');
		if (firstSpace != -1) {
			curMorph = curMorph.substring(0, firstSpace);
		}
		final EntityDoc[] results = this.morphology.searchExactTermBySingleField("code", 1, curMorph);
		if (results.length > 0) {
			classes = results[0].get("cssClasses");
			// Added on Feb 27, 2018 to annotate verbs
			String funct;
			try {
				funct = results[0].get("function").toLowerCase();
			}
			catch (NullPointerException e) {
				funct = "";
			}
			if (funct.equals("verb")) {
				String tense, voice, mood;
				try {
					tense = results[0].get("tense").toLowerCase();
					voice = results[0].get("voice").toLowerCase();
					mood = results[0].get("mood").toLowerCase();
				}
				catch (NullPointerException e) {
					tense = voice = mood = "";
				}
				if (!tense.isEmpty() && !mood.isEmpty()) {
					// Annotate 2nd Aorist as Aorist, 2nd Future as Future, 2nd Perfect as Perfect, 2nd Pluperfect ...
					if (tense.startsWith("2nd ")) {
						tense = tense.substring(4);
					} else if (tense.equals("indefinite tense")) {
						tense = "indefinite";
					}
					if ( (voice.equals("passive")) || (voice.equals("either middle or passive")) ) {
						voice = "p";
					}
					else if (voice.equals("middle") ) {
						voice = "m";
					}
					else if ((voice.indexOf("active") > -1) || (voice.indexOf("deponent") > -1) || (voice.indexOf("indefinite") > -1) ) {
						voice = "a";
					}
					else {
						LOGGER.warn("cannot identify voice [{}]", voice);
						voice = "a";
					}
					classes = classes + " v" + getShortCodeTense(tense) + voice + getShortCodeMood(mood);
				}
			}
			try {
				String caseOfWord = results[0].get("case").toLowerCase();
				if (!isBlank(caseOfWord)) {
					classes = classes + " n-" + caseOfWord.substring(0, 3);
				}
			}
			catch (NullPointerException e) {
				//e.printStackTrace();
			}
		}
		/* Added this section for the Chinese Bible which has the morphology on verbs */
//		else if (curMorph.length() > 4) {
//			if (curMorph.substring(0,1).equalsIgnoreCase("v")) {
//				String tense = curMorph.substring(2,3).toLowerCase();
//				String voice = curMorph.substring(3,4).toLowerCase();
//				String mood = curMorph.substring(4,5).toLowerCase();
//				if (tense.equals("2")) {
//					tense = curMorph.substring(3,4).toLowerCase();
//					voice = curMorph.substring(4,5).toLowerCase();
//					mood = curMorph.substring(5,6).toLowerCase();
//				}
//				if (voice.equals("e")) {
//					voice = "p";
//				}
//				else if ( (!(voice.equals("p"))) && (!(voice.equals("m"))) ) {
//					String voice_displayed_as_active = "adnoqx"; // active, middle deponent, middle or passive deponent, passive deponent, impersonal active, indefinite
//					if (voice_displayed_as_active.indexOf(voice) == -1)  {
//						LOGGER.warn("cannot identify morphology for [{}]", curMorph);
//					}
//					voice = "a";
//				}
//				classes = "v" + tense + voice + mood;
//
//				if (classes == null) {
//					LOGGER.warn("cannot identify morphology for [{}]", curMorph);
//				}
//			}
//			else {
//				if (!curMorph.substring(0,1).equals("H"))
//					LOGGER.warn("other than verb [{}]", curMorph);
//			}
//		}

		if (isBlank(classes) && firstSpace != -1) {
			// redo the same process, but with less of the string,
			return getColorClass(morph.substring(firstSpace + 1));
		}
        return classes != null ? classes : "";
    }

	public String getShortCodeTense(final String tense) {
		if (tense.equals("aorist")) return "a";
		else if (tense.equals("present")) return "p";
		else if (tense.equals("perfect")) return "r";
		else if (tense.equals("pluperfect")) return "l";
		else if (tense.equals("future")) return "f";
		else if (tense.equals("imperfect")) return "i";
		else if (tense.equals("indefinite")) return "x";
		else {
			LOGGER.warn("cannot identify tense for [{}]", tense);
			return "";
		}
	}

	public String getShortCodeMood(final String mood) {
		if (mood.equals("indicative")) return "i";
		else if (mood.equals("imperative")) return "m";
		else if (mood.equals("participle")) return "p";
		else if (mood.equals("infinitive")) return "n";
		else if (mood.equals("subjunctive")) return "s";
		else if (mood.equals("optative")) return "o";
		else {
			LOGGER.warn("cannot identify mood for [{}]", mood);
			return "";
		}
	}

}
