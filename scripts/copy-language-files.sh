#!/bin/sh 
set -e

if [[ -z "$1" ]] ; then
  echo "Need to specify one argument"
  exit
fi

cd /c/Users/Chris/Downloads
rm -rf step_language_files
unzip "$1" -d step_language_files
cd step_language_files

# fix chinese files
cd zh-TW
mv ErrorBundle_zh.properties ErrorBundle_zh-TW.properties
mv InteractiveBundle_zh.properties InteractiveBundle_zh-TW.properties
mv HtmlBundle_zh.properties HtmlBundle_zh-TW.properties
mv SetupBundle_zh.properties SetupBundle_zh-TW.properties
cd ..

#fix Hebrew files
cd he
mv ErrorBundle_he.properties ErrorBundle_iw.properties
mv InteractiveBundle_he.properties InteractiveBundle_iw.properties
mv HtmlBundle_he.properties HtmlBundle_iw.properties
mv SetupBundle_he.properties SetupBundle_iw.properties
cd ..

#fix Hebrew files
cd id
mv ErrorBundle_id.properties ErrorBundle_in.properties
mv InteractiveBundle_id.properties InteractiveBundle_in.properties
mv HtmlBundle_id.properties HtmlBundle_in.properties
mv SetupBundle_id.properties SetupBundle_in.properties
cd ..

find -name *.properties | xargs -i{} mv {} `pwd`
mv *.properties /c/dev/projects/step/step-core/src/main/resources/
