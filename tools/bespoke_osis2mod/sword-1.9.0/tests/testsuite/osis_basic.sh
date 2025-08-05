#!/bin/sh

rm -rf tmp/osis_basic/
mkdir -p tmp/osis_basic/mods.d
mkdir -p tmp/osis_basic/modules

cat > tmp/osis_basic/mods.d/osisreference.conf <<!
[OSISReference]
DataPath=./modules/
ModDrv=zText
Encoding=UTF-8
BlockType=BOOK
CompressType=ZIP
SourceType=OSIS
Lang=en
GlobalOptionFilter=OSISLemma
GlobalOptionFilter=OSISStrongs
GlobalOptionFilter=OSISMorph
GlobalOptionFilter=OSISFootnotes
GlobalOptionFilter=OSISHeadings
GlobalOptionFilter=OSISRedLetterWords
Feature=StrongsNumbers
!

../../utilities/osis2mod tmp/osis_basic/modules/ osisReference.xml -z 2>&1 | grep -v \$Rev

cd tmp/osis_basic
../../../osistest OSISReference

echo
echo "-- Plain output"
../../../../utilities/diatheke/diatheke -b OSISReference -f plain -k "Acts 2:19-20" | grep -v OSISReference
echo
echo "-- RTF output"
../../../../utilities/diatheke/diatheke -b OSISReference -f RTF -k "Acts 2:19-20" | grep -v OSISReference
echo "-- Verse osisID list Link test"
../../../../utilities/diatheke/diatheke -b OSISReference -f RTF -k "Acts 2:21-22" | grep -v OSISReference
echo "-- Div osisReference range Link test"
../../../../utilities/diatheke/diatheke -b OSISReference -f RTF -k "Gen 1:6-7" | grep -v OSISReference
