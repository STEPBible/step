#---------------------------------------------------------------------------------
#This program takes in file directories for a language lexicon, strong directory,
#and the STEP Bible website in orger to output .json files of all the words to a
#specified folder for future use.

#STEPBIBLE website
stepWebsite = "https://dev.stepbible.org/rest/module/getInfo/ESV///"

#output folder
#requires ending /
outFolder = "jsonfiles/"

#---------------------------------------------------------------------------------
import requests
from os.path import exists
import sys
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import json

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("This program needs one argument (name of robinson morphology file)")
        sys.exit()
    else:
        morphFile = sys.argv[1] # name of lexicon file

session = requests.Session()
retry = Retry(connect=3, backoff_factor=0.5)
adapter = HTTPAdapter(max_retries=retry)
session.mount('http://', adapter)

count = 0
words = []
strWords = []
#read in all strong numbers
with open(morphFile,'r', encoding="utf8") as file:
    while True:
        line = file.readline()
        if not line:
            break
        csv = line.split(",")
        if not exists(outFolder + csv[0] + ".json"):
            rdata = session.get(stepWebsite + csv[0], timeout=30)
            if (len(rdata.text) > 17):
#                print(outFolder + csv[0] + ".json",rdata.text)
                with open(outFolder + csv[0] + ".json", 'w', encoding="utf8") as outfile:
                    outfile.write(rdata.text)
            
