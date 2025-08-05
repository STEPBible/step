/******************************************************************************
 *
 *  diatheke.cpp -	
 *
 * $Id: diatheke.cpp 3737 2020-05-08 19:38:41Z scribe $
 *
 * Copyright 1999-2014 CrossWire Bible Society (http://www.crosswire.org)
 *	CrossWire Bible Society
 *	P. O. Box 2528
 *	Tempe, AZ  85280-2528
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation version 2.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 */

/******************************************************************************
 * Diatheke 4.7 by Chris Little <chrislit@crosswire.org>
 * http://www.crosswire.org/sword/diatheke
 */

#include "corediatheke.h"
#include "diathekemgr.h"
#include "diafiltmgr.h"
#include <utilstr.h>
#include <swversion.h>

using std::cout;

#define RQ_REF 1
#define RQ_BOOK 2

void printsyntax() { 
	//if we got this far without exiting, something went wrong, so print syntax
	fprintf (stderr, "Diatheke command-line SWORD frontend Version 4.8 (SWORD: %s)\n", SWVersion::currentVersion.getText());
	fprintf (stderr, "Copyright 1999-2018 by the CrossWire Bible Society\n");
	fprintf (stderr, "http://www.crosswire.org/sword/diatheke/\n");
	fprintf (stderr, "\n");
	fprintf (stderr, "usage:  diatheke <-b module_name> [-s search_type] [-r search_range]\n");
	fprintf (stderr, "    [-o option_filters] [-m maximum_verses] [-f output_format]\n");
	fprintf (stderr, "    [-e output_encoding] [-v variant#(-1=all|0|1)]\n");
	fprintf (stderr, "    [-l locale] <-k query_key>\n");
	fprintf (stderr, "\n");
	fprintf (stderr, "If <book> is \"system\" you may use these system keys: \"modulelist\",\n");
	fprintf (stderr, "\"modulelistnames\", \"bibliography\", and \"localelist\".");
	fprintf (stderr, "\n");
	fprintf (stderr, "Valid search_type values are: phrase , regex, multiword, attribute,\n");
	fprintf (stderr, "  lucene, multilemma.\n");
	fprintf (stderr, "Valid (output) option_filters values are: n (Strong's numbers),\n");
	fprintf (stderr, "  f (Footnotes), m (Morphology), h (Section Headings),\n");
	fprintf (stderr, "  c (Cantillation), v (Hebrew Vowels), a (Greek Accents), p (Arabic Vowels)\n");
	fprintf (stderr, "  l (Lemmas), s (Scripture Crossrefs), r (Arabic Shaping),\n");
	fprintf (stderr, "  b (Bi-Directional Reordering), w (Red Words of Christ),\n");
	fprintf (stderr, "  g (Glosses/Ruby), e (Word Enumerations), i (Intros)\n");
	fprintf (stderr, "  x (Encoded Transliterations), t (Algorithmic Transliterations via ICU),\n");
	fprintf (stderr, "  M (morpheme segmentation)\n");

	fprintf (stderr, "Maximum verses may be any integer value\n");
	fprintf (stderr, "Valid output_format values are: CGI, GBF, HTML, HTMLHREF, LaTeX, OSIS, RTF,\n");
 	fprintf (stderr, "  ThML, WEBIF, XHTML, plain, and internal (def)\n");
 	fprintf (stderr, "The option LaTeX will produce a compilable document, but may well require\n");
	fprintf (stderr, "  tweaking to be usable.\n");
	fprintf (stderr, "Valid output_encoding values are: Latin1, UTF8 (def), UTF16, HTML, RTF, and SCSU\n");
	fprintf (stderr, "Valid locale values depend on installed locales. en is default.\n");
	fprintf (stderr, "The query_key must be the last argument because all following\n");
	fprintf (stderr, "  arguments are added to the key.\n");
	fprintf (stderr, "\n");
	fprintf (stderr, "Example usage:\n");
	fprintf (stderr, "  diatheke -b KJV -o fmnx -k Jn 3:16\n");
	fprintf (stderr, "  diatheke -b WHNU -t Latin -o mn -k Mt 24\n");
	fprintf (stderr, "  diatheke -b KJV -s phrase -r Mt -k love\n");

	exit(EXIT_FAILURE);
}

int main(int argc, char **argv)
{
	int maxverses = -1;
	unsigned char outputformat = FMT_INTERNAL, searchtype = ST_NONE, outputencoding = ENC_UTF8;
	unsigned long optionfilters = OP_NONE;
 	char *text = 0, *locale = 0, *ref = 0, *range = 0;
	char script[] = "Latin"; // for the moment, only this target script is supported
	signed short variants = 0;

	char runquery = 0; // used to check that we have enough arguments to perform a legal query
	// (a querytype & text = 1 and a ref = 2)
	
	for (int i = 1; i < argc; ++i) {
		if (!::stricmp("-b", argv[i])) {
			if (i+1 <= argc) {
				++i;
				text = argv[i];
				runquery |= RQ_BOOK;
			}
		}
		else if (!::stricmp("-s", argv[i])) {
			if (i+1 <= argc) {
				++i;
				if (!::stricmp("phrase", argv[i])) {
					searchtype = ST_PHRASE;
				}
				else if (!::stricmp("regex", argv[i])) {
					searchtype = ST_REGEX;
				}
				else if (!::stricmp("multiword", argv[i])) {
					searchtype = ST_MULTIWORD;
				}
				else if (!::stricmp("lucene", argv[i])) {
					searchtype = ST_CLUCENE;
				}
				else if (!::stricmp("attribute", argv[i])) {
					searchtype = ST_ENTRYATTRIB;
				}
				else if (!::stricmp("multilemma", argv[i])) {
					searchtype = ST_MULTILEMMA;
				}
				else {
					fprintf (stderr, "Unknown search_type: %s\n", argv[i]);
					fprintf (stderr, "Try diatheke --help\n");
					return 0;
				}
			}
		}
 		else if (!::stricmp("-r", argv[i])) {
 			if (i+1 <= argc) {
				++i;
 				range = argv[i];
 			}	
 		}
		else if (!::stricmp("-l", argv[i])) {
			if (i+1 <= argc) {
				++i;
				locale = argv[i];
			}
		}
		else if (!::stricmp("-m", argv[i])) {
			if (i+1 <= argc) {
				++i;
				maxverses = atoi(argv[i]);
			}
		}
		else if (!::stricmp("-o", argv[i])) {
			if (i+1 <= argc) {
				++i;
				if (strchr(argv[i], 'f'))
					optionfilters |= OP_FOOTNOTES;
				if (strchr(argv[i], 'n'))
					optionfilters |= OP_STRONGS;
				if (strchr(argv[i], 'h'))
					optionfilters |= OP_HEADINGS;
				if (strchr(argv[i], 'm'))
					optionfilters |= OP_MORPH;
				if (strchr(argv[i], 'c'))
					optionfilters |= OP_CANTILLATION;
				if (strchr(argv[i], 'v'))
					optionfilters |= OP_HEBREWPOINTS;
				if (strchr(argv[i], 'a'))
					optionfilters |= OP_GREEKACCENTS;
				if (strchr(argv[i], 'l'))
					optionfilters |= OP_LEMMAS;
				if (strchr(argv[i], 's'))
					optionfilters |= OP_SCRIPREF;
				if (strchr(argv[i], 'r'))
					optionfilters |= OP_ARSHAPE;
				if (strchr(argv[i], 'b'))
					optionfilters |= OP_BIDI;
				if (strchr(argv[i], 'w'))
					optionfilters |= OP_REDLETTERWORDS;
				if (strchr(argv[i], 'p'))
					optionfilters |= OP_ARABICPOINTS;
				if (strchr(argv[i], 'g'))
					optionfilters |= OP_GLOSSES;
				if (strchr(argv[i], 'x'))
					optionfilters |= OP_XLIT;
				if (strchr(argv[i], 'e'))
					optionfilters |= OP_ENUM;
				if (strchr(argv[i], 'i'))
					optionfilters |= OP_INTROS;
				if (strchr(argv[i], 't'))
					optionfilters |= OP_TRANSLITERATOR;
				if (strchr(argv[i], 'M'))
					optionfilters |= OP_MORPHSEG;
			}
		}
		else if (!::stricmp("-f", argv[i])) {
			if (i+1 <= argc) {
				++i;
				if (!::stricmp("thml", argv[i])) {
					outputformat = FMT_THML;
				}
				else if (!::stricmp("cgi", argv[i])) {
					outputformat = FMT_CGI;
				}
				else if (!::stricmp("gbf", argv[i])) {
					outputformat = FMT_GBF;
				}
				else if (!::stricmp("htmlhref", argv[i])) {
					outputformat = FMT_HTMLHREF;
				}
				else if (!::stricmp("html", argv[i])) {
					outputformat = FMT_HTML;
				}
				else if (!::stricmp("xhtml", argv[i])) {
					outputformat = FMT_XHTML;
				}
				else if (!::stricmp("rtf", argv[i])) {
					outputformat = FMT_RTF;
				}
				else if (!::stricmp("osis", argv[i])) {
					outputformat = FMT_OSIS;
				}
				else if (!::stricmp("latex", argv[i])) {
					outputformat = FMT_LATEX;
				}
				else if (!::stricmp("plain", argv[i])) {
					outputformat = FMT_PLAIN;
				}
				else if (!::stricmp("webif", argv[i])) {
					outputformat = FMT_WEBIF;
				}
				else if (!::stricmp("internal", argv[i])) {
					outputformat = FMT_INTERNAL;
				}
			}
		}
		else if (!::stricmp("-e", argv[i])) {
			if (i+1 <= argc) {
				++i;
				if (!::stricmp("utf8", argv[i])) {
					outputencoding = ENC_UTF8;
				}
				else if (!::stricmp("rtf", argv[i])) {
					outputencoding = ENC_RTF;
				}
				else if (!::stricmp("html", argv[i])) {
					outputencoding = ENC_HTML;
				}
				else if (!::stricmp("latin1", argv[i])) {
					outputencoding = ENC_LATIN1;
				}
				else if (!::stricmp("utf16", argv[i])) {
					outputencoding = ENC_UTF16;
				}
				else if (!::stricmp("scsu", argv[i])) {
					outputencoding = ENC_SCSU;
				}
			}
		}
		else if (!::stricmp("-k", argv[i])) {
			++i;	
			if (i < argc) {
				SWBuf key = argv[i];
				++i;
				for (; i < argc; ++i) {
					if (!::stricmp("-h", argv[i]) || !::stricmp("--help", argv[i]))
						printsyntax();
					key = key + " " + argv[i];
				}
				ref = new char[key.length() + 1];
				strcpy (ref, key.c_str());
				if (strlen(ref))
					runquery |= RQ_REF;
			}
		}
		else if (!::stricmp("-v", argv[i])) {
			if (i+1 <= argc) {
				++i;
				variants = atoi(argv[i]);
				optionfilters |= OP_VARIANTS;
			}
		}
		/*
		else if (!::stricmp("-t", argv[i])) {
			if (i+1 <= argc) {
				++i;
				script = argv[i];
				optionfilters |= OP_TRANSLITERATOR;
			}
		}
		*/
		else {
			// unexpected argument, so print the syntax
			// -h, --help, /?, etc. will trigger this
			printsyntax();
		}
	}
	
	
	if (runquery == (RQ_BOOK | RQ_REF)) {
 	    doquery(maxverses, outputformat, outputencoding, optionfilters, searchtype, range, text, locale, ref, &cout, script, variants);
	}
	//if we got this far without exiting, something went wrong, so print syntax
	else printsyntax();

	return 0;
}
