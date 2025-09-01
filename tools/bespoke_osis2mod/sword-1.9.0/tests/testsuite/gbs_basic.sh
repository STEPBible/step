#!/bin/sh

rm -rf tmp/gbs_basic/
mkdir -p tmp/gbs_basic/mods.d
mkdir -p tmp/gbs_basic/modules

cat > tmp/gbs_basic/mods.d/gbsreference.conf <<!
[GBSReference]
DataPath=./modules/gbsreference
ModDrv=RawGenBook
Encoding=UTF-8
SourceType=OSIS
Lang=en
Feature=StrongsNumbers
!

../../utilities/imp2gbs gbsReference.imp -o tmp/gbs_basic/modules/gbsreference 2>&1 | grep -v \$Rev

cd tmp/gbs_basic
#../../../gbstest GBSReference

echo
echo "-- Plain output"
../../../../utilities/diatheke/diatheke -b GBSReference -f plain -k "Chapter 7" | grep -v GBSReference
echo
echo "-- RTF output"
../../../../utilities/diatheke/diatheke -b GBSReference -f RTF -k "Chapter 8" | grep -v GBSReference
echo
echo "-- imp dump"
../../../../utilities/mod2imp GBSReference
