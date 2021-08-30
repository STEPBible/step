import glob
import sys
import shutil
import os
from pathlib import Path

if __name__ == '__main__':

    if len(sys.argv) == 2:
        newPath = sys.argv[1]
        print("new path", newPath)
    else:
        newPath = "bundle_out"
    print("Files will be output to", newPath, "folder")

    for filePath1 in glob.glob('crowdin\\**\\', recursive=False):
        folderName = filePath1.split('\\')
        if len(folderName) != 3:
            print("This folder name is not in the expected format", filePath1, len(folderName), "Exit program")
            sys.exit()
        langName = folderName[1].split('-')
        if folderName[1] == "zh-TW":
            langName[0] = "zh_TW"
        elif folderName[1] == "he":
            langName[0] = "iw"
        elif folderName[1] == "id":
                langName[0] = "in"
        for filePath2 in glob.iglob(f"crowdin\\{folderName[1]}\\*.properties"):
            folderName2 = filePath2.split('\\')
            targetFilePrefix = folderName2[2].split("_")[0]
            targetFile = "\\" + targetFilePrefix + "_" + langName[0] + ".properties"
            targetPath = newPath + targetFile
            if os.path.exists(targetPath):
                print("already exist", targetPath, "Exit program")
                sys.exit()
            else:
                if targetFilePrefix == "LangSpecificBundle" or targetFilePrefix == "MorphologyBundle":
                    appendToFile = newPath + "\\InteractiveBundle_" + langName[0] + ".properties"
                    print("Found", filePath2, "will append to", appendToFile)
                    my_file = Path(appendToFile)
                    if my_file.is_file():
                        f1 = open(appendToFile, 'a+')
                        f2 = open(filePath2, 'r')
                        f1.write(f2.read())
                        f1.close()
                        f2.close()
                    else:
                        print("Cannot find correspond InteractiveBundle file")
                        sys.exit()
                else:
                    print("copying", filePath2, "to", targetPath)
                    shutil.copyfile(filePath2, targetPath)
            continue
