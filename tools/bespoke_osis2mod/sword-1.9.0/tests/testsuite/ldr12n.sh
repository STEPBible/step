#!/bin/sh
# Lexicon / Dictionary regularization tests to make sure we pad and lookup correctly

rm -rf tmp/ldr12n/
mkdir -p tmp/ldr12n/mods.d
mkdir -p tmp/ldr12n/modules

cat > tmp/ldr12n/mods.d/ldr12n.conf <<!
[ldr12n]
DataPath=./modules/ldr12n
ModDrv=RawLD
Encoding=UTF-8
SourceType=Plain
Lang=en
StrongsPadding=false
!

cat > tmp/ldr12n/mods.d/ldr12np.conf <<!
[ldr12np]
DataPath=./modules/ldr12np
ModDrv=RawLD
Encoding=UTF-8
SourceType=Plain
Lang=en
StrongsPadding=true
!

../../utilities/imp2ld ldr12n.imp -P -o tmp/ldr12n/modules/ldr12n 2>&1 | grep -v \$Rev
../../utilities/imp2ld ldr12n.imp -o tmp/ldr12n/modules/ldr12np 2>&1 | grep -v \$Rev

cd tmp/ldr12n && ../../../ldtest ldr12n && ../../../ldtest ldr12np
