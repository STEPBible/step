#!/bin/sh 
set -e

if [[ -z "$1" ]] ; then
  echo "Need to specify one argument"
  exit
fi

cd /c/Users/Chris/Downloads
unzip "$1" -d step_language_files
cd step_language_files

# fix chinese files
cd zh-TW
mv ErrorBundle_zh.properties ErrorBundle_zh-TW.properties
mv InteractiveBundle_zh.properties InteractiveBundle_zh-TW.properties
mv HtmlBundle_zh.properties HtmlBundle_zh-TW.properties
mv SetupBundle_zh.properties SetupBundle_zh-TW.properties
cd ..

find -name *.properties | xargs -i{} mv {} `pwd`
mv *.properties /c/dev/projects/step/step-core/src/main/resources/
