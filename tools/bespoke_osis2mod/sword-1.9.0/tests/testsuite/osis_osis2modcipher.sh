#!/bin/sh

rm -rf tmp/osis_osis2modcipher/
mkdir -p tmp/osis_osis2modcipher/mods.d
mkdir -p tmp/osis_osis2modcipher/modules

cat > tmp/osis_osis2modcipher/mods.d/osisreference.conf <<!
[OSISReference]
DataPath=./modules/
ModDrv=zText
CipherKey=abc123
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

../../utilities/osis2mod tmp/osis_osis2modcipher/modules/ osisReference.xml -z -c abc123 2>&1 | grep -v \$Rev|grep -v "with phrase"

cp osis_basic.good osis_osis2modcipher.good
cd tmp/osis_osis2modcipher
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
