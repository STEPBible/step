#!/bin/sh

SWORD_FROM=
SWORD_TO=

cat ./diffversions.txt | while read line
do
  data=`grep DataPath $SWORD_FROM/mods.d/$line | sed 's/DataPath=\.\///g' | sed 's/\r//g' `
  echo "cp $SWORD_FROM/mods.d/$line $SWORD_TO/mods.d/$line"
  echo "cp -R $SWORD_FROM/$data $SWORD_TO/$data"
done

