1. The 1_checkAugStrong.pl updates the augmented_strong.txt file from David Instone-Brewer
   to a format which can be read by the STEP Java code.

2. The 2_convertDStrongNum.pl updates the lexicon file from David to a format which can be
   read by the STEP Java code.

3. The 3_buildDetailLexicalTag.pl adds the detail lexical tag to the lexicon files.

4. The 4_createSearchRange.pl adds the search range to the lexicon files.

When I get the lexicon and augmented_strong files from David, I would run the 1st, 2nd and 3rd scripts. 
I will then use the updated augmented_strong file and the lexicon files on the dev servers.  I will 
then run the 4th script.  The URL used in the 4th script should be the URL running STEPBible with the
updated files.