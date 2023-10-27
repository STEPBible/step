1. The 1a_checkAugStrong.pl updates the augmented_strong.txt file from David Instone-Brewer
   to a format which can be read by the STEP Java code.

2. The 1b_checkAugStrong.pl is only needed when Patrick added the LXXRefs in September 2023.

3. merge_augstrong.pl is only needed when Patrick added the LXXRefs in September 2023.

4. The 2_convertDStrongNum.pl updates the lexicon file from David to a format which can be
   read by the STEP Java code.

5. 3_getWordFreq.pl will get the frequency count of all the Greek and Hebrew words.

6. 4_addFreqList.pl will add the new frequency count back to the lexicon files.

7. 5_buildDetailLexicalTag.pl adds the detail lexical tag to the lexicon files.

8. The 6_createSearchRange.pl adds the search range to the lexicon files.

When I get the lexicon and augmented_strong files from David, I would run the above steps 1-4.

Step 2 and 3 was first used in September 2023 because we added the LXXRefs.  The future version
of the augmented_strongs.txt from David might already have the LXXRefs information.  Therefore,
steps 2 and 3 might not be necessary or might need to be updated. 

I will then use the updated augmented_strong file and the lexicon files on the dev servers.  I will 
then run the 5th step (3_getWordFreq.pl).  The URL used in the 3_getWordFreq script should be the URL running STEPBible with the
updated files.