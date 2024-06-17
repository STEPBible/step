#---------------------------------------------------------------------------------
#This program takes in file directories for a language lexicon, strong directory,
#and the STEP Bible website in orger to output .json files of all the words to a
#specified folder for future use.

#STEPBIBLE website
stepWebsite = "https://dev.stepbible.org/rest/module/getInfo/ESV//"
#output folder
#requires ending /
outFolder = "jsonfiles/"

#---------------------------------------------------------------------------------
import requests
from tqdm import tqdm
import time
from os.path import exists
import sys
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import json

vocabKeys = ["strongNumber", "stepGloss", "stepTransliteration", "count", 
                "_es_Gloss", "_zh_Gloss", "_zh_tw_Gloss",
                "shortDef", "mediumDef", "lsjDefs",
                "_es_Definition", "_vi_Definition", "_zh_Definition", "_zh_tw_Definition",
                "accentedUnicode", "rawRelatedNumbers", "relatedNos", 
                "_stepDetailLexicalTag", "_step_Link", "_step_Type", "_stepSearchResultRange", 
                "freqList", "defaultDStrong"
                ]
relatedKeys = ["strongNumber", "gloss", "_es_Gloss", "_zh_Gloss", "_zh_tw_Gloss", "stepTransliteration", "matchingForm", "_searchResultRange", "_km_Gloss"]

def checkDupStrings(currentValue, strings):
    if currentValue in strings:
        return strings.index(currentValue)
    return currentValue

def countDupStrings(orig, stringsFreq):
    vocabs = orig["vocabInfos"]
    if len(vocabs) != 1:
        print("vocab length is not one:", len(vocabs))
        sys.exit()
    for key in vocabs[0].keys():
        currentValue = vocabs[0][key]
        if isinstance(currentValue, int) or currentValue == "":
            continue
        if key == "relatedNos":
            for relatedNumEntry in currentValue:
                for key2 in relatedNumEntry:
                    if key2 not in relatedKeys:
                        print("Key not found", key2)
                        sys.exit()
                    if not isinstance(relatedNumEntry[key2], int) and relatedNumEntry[key2] != "":
                        if relatedNumEntry[key2] in stringsFreq.keys():
                            stringsFreq[relatedNumEntry[key2]] = stringsFreq[relatedNumEntry[key2]] + 1
                        else:
                            stringsFreq[relatedNumEntry[key2]] = 1
        else:
            if currentValue in stringsFreq.keys():
                stringsFreq[currentValue] += 1
            else:
                stringsFreq[currentValue] = 1
    return stringsFreq

def buildDupStrings(stringsFreq):
    strings = []
    uniqueFreq = (list(set(stringsFreq.values())))
    sorted_values = sorted(uniqueFreq, reverse=True)
    for i in sorted_values:
        if i > 1:
            for key, value in stringsFreq.items():
                if i == value and key not in strings:
                    numOfCharInIndex = len(str(len(strings)))
                    numOfCharInString = len(key) + 2 # add 2 because there is a begin and end quote
                    if numOfCharInString > numOfCharInIndex:
                        strings.append(key)
    return strings

def shortenKey(orig, relatedNums, strings, defaultAugStrong, lxxDefaultAugStrong):
    vocabs = orig["vocabInfos"]
    if len(vocabs) != 1:
        print("vocab length is not one:", len(vocabs))
        sys.exit()
    vocabResult = [""] * len(vocabKeys)
    for key in vocabs[0].keys():
        key1Index = vocabKeys.index(key)
        if key1Index == -1:
            print("Key not found", key)
            sys.exit()
        currentValue = vocabs[0][key]
        if key == "strongNumber":
            if not currentValue[-1].isnumeric():
                vocabResult[vocabKeys.index("defaultDStrong")] = ""
                currentStrongWithoutAugment = currentValue[:-1]
                if currentStrongWithoutAugment in defaultAugStrong and defaultAugStrong[currentStrongWithoutAugment] == currentValue:
                    vocabResult[vocabKeys.index("defaultDStrong")] += "*"
                if currentStrongWithoutAugment in lxxDefaultAugStrong and lxxDefaultAugStrong[currentStrongWithoutAugment] == currentValue:
                    vocabResult[vocabKeys.index("defaultDStrong")] += "L"
        if key == "relatedNos":
            currentValue = []
            for relatedNumEntry in vocabs[0][key]:
                found = False
                index = 0
                for existingRelatedNum in relatedNums:
                    ###  This is not working
                    checkStrongNum = existingRelatedNum[0]
                    if isinstance(checkStrongNum, int): # in duplicate string array
                        checkStrongNum = strings[checkStrongNum]
                    if checkStrongNum == relatedNumEntry["strongNumber"]:
                        currentValue.append(index)
                        found = True
                    index += 1
                if not found:
                    currentRelatedNum = [""] * len(relatedKeys)
                    for key2 in relatedNumEntry:
                        key2Index = relatedKeys.index(key2)
                        if key2Index == -1:
                            print("Key not found", key2)
                            sys.exit()
                        currentRelatedNum[key2Index] = checkDupStrings(relatedNumEntry[key2], strings)
                    relatedNums.append(currentRelatedNum)
                    currentValue.append(len(relatedNums)-1)
        if key == "_stepDetailLexicalTag":
            detailLexArray = []
            for detailLexicalTags in json.loads(vocabs[0][key]):
                detailLexArray.append([detailLexicalTags[0], detailLexicalTags[1], detailLexicalTags[2], detailLexicalTags[3], detailLexicalTags[4], detailLexicalTags[5], detailLexicalTags[6]])
            currentValue = detailLexArray
        vocabResult[key1Index] = checkDupStrings(currentValue, strings)

    return {    "vocabInfo": vocabResult,
                "relatedNums": relatedNums }

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("This program needs two arguments (name of lexicon file and name of augmented strong file)")
        sys.exit()
    else:
        lexiconFile = sys.argv[1] # name of lexicon file
        augStrongFile = sys.argv[2] # name of augmented Strong file

session = requests.Session()
retry = Retry(connect=3, backoff_factor=0.5)
adapter = HTTPAdapter(max_retries=retry)
session.mount('http://', adapter)

starttime = time.perf_counter()
count = 0
strongNumbers = []
augStrongNumbers = []
#read in all strong numbers
with open(lexiconFile,'r', encoding="utf8") as file:
    while True:
        line = file.readline()
        if not line:
            break
        if line[0:8] == "@StrNo=\t":
            currentStrong = line[8:].strip('\n')
            if currentStrong[-1].isnumeric():
                strongNumbers.append(currentStrong)
                count += 1
            else:
                augStrongNumbers.append(currentStrong)

#group strong words [[a,b,c],[a,b],[g,h,i],[g,h,i,j]]
mainStrWords = []
temp = []
strongNumbers.sort()
augStrongNumbers.sort()
# The following code will create an array like this:
# ['H8649A', 'H8649B'], ['H8656G', 'H8656H'], ['H8659G', 'H8659H', 'H8659I'], ['H8668G', 'H8668H'], ...
for n in range(len(augStrongNumbers)-1):
    buffer = augStrongNumbers[n]
    if augStrongNumbers[n+1][:-1] == buffer[:-1]:
        temp.append(buffer)
    else:
        temp.append(buffer)
        mainStrWords.append(temp)
        temp = []
temp.append(augStrongNumbers[-1])
mainStrWords.append(temp)

print("Total words: " , count + len(mainStrWords))
print("Single def words: ", count)
print("Mult def words: ", len(mainStrWords))

augstr = []
defaultAugStrong = {}
lxxDefaultAugStrong = {}
#get references
#form linked list with words
lastAugStr = ""
with open(augStrongFile, 'r', encoding="utf8") as file:
    while True:
        line = file.readline()
        if not line:
            break
        if "@A" in line:
            currentAugStr = line[-7:].strip('\n')
            augstr.append(currentAugStr)
        if "@R" in line and line[13:].strip('\n') == "*":
            defaultAugStrong[currentAugStr[:-1]] = currentAugStr
        if "@L" in line and line[10:].strip('\n') == "*":
          	lxxDefaultAugStrong[currentAugStr[:-1]] = currentAugStr
augstr.sort()

print("\nPacking Single Definiton Words:")
#package single definition words
for n in tqdm(range(len(strongNumbers))):
    #get data
    if not exists(outFolder + strongNumbers[n] + ".json"):
        rdata = session.get(stepWebsite + strongNumbers[n], timeout=30)
        tmp = rdata.json()
        #print("word",strongNumbers[n], rdata.text)
        #vocabInfo, relatedNums, strings = 
        if len(tmp['vocabInfos']) != 1:
            print("wrong len of vocabInfos, should be 1, but got:", len(tmp['vocabInfos']), strongNumbers[n])
            sys.exit()
        strings = buildDupStrings(countDupStrings(tmp, {}))
        vocabInfos = []
        relatedNums = []
        r = shortenKey(tmp, relatedNums, strings, defaultAugStrong, lxxDefaultAugStrong)
        vocabInfos.append(r["vocabInfo"])
        jsonOutput = {"v": vocabInfos}
        if (len(strings)) > 0:
            jsonOutput["d"] = strings
        if len(r["relatedNums"]) > 0:
            jsonOutput["r"] = r["relatedNums"]
        outResult = json.dumps(jsonOutput, ensure_ascii=False, sort_keys=True, separators=(',', ':')) #, indent=4)
        #write to json file
        with open(outFolder + strongNumbers[n] + ".json", 'w', encoding = "utf8") as file:
            file.write(outResult)

#package multidefinition words
#1. group augmented strong with references
#2. group vocabInfos
#3. group aumented tag + vocabInfos
#4. write to .json
print( "\nPackaging Multi-Definition Words")
for n in tqdm(range(len(mainStrWords))):
    #adds a dictionary of {strong: number, refrences: text} to the end of the main array
    if not exists(outFolder + mainStrWords[n][0][:-1] + ".json"):
        mainarr = []
        if len(mainStrWords[n]) > 1:
            for l in range(len(mainStrWords[n])):
                curAugStr = mainStrWords[n][l]
                if curAugStr not in augstr:
                    print("something wrong, in lexicon, not in augstrong", l, mainStrWords[n])

        vocabInfos = []
        relatedNums = []
        stringsFreq = {}
        jsonFromServer = []
        for word in mainStrWords[n]:
            rdata = session.get(stepWebsite + word, timeout=30)
            tmp = rdata.json()
            jsonFromServer.append(tmp)
            stringsFreq = countDupStrings(tmp, stringsFreq)
        strings = buildDupStrings(stringsFreq)
        for tmp in jsonFromServer:
            r = shortenKey(tmp, relatedNums, strings, defaultAugStrong, lxxDefaultAugStrong)
            relatedNums = r["relatedNums"]
            vocabInfos.append(r['vocabInfo'])
        jsonOutput = {"v": vocabInfos}
        if len(strings) > 0:
            jsonOutput["d"] = strings
        if len(relatedNums) > 0:
            jsonOutput["r"] = relatedNums

        # write to json file
        with open(outFolder + mainStrWords[n][0][:-1] + ".json", 'w', encoding="utf8") as file:
            file.write( json.dumps(jsonOutput, ensure_ascii=False, sort_keys=True, separators=(',', ':'))) #, indent=4) )

finishtime = time.perf_counter()
print(f"\nFinished in {round((finishtime - starttime)/60, 2)} minute(s)")
