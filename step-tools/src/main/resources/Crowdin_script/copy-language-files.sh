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

# s $ 1 , (coping for single s or d)
echo Fudging markers
echo "s $ 1"
find -name *.properties -print | xargs sed -i 's/\s\([sd]\)\s\$\s%\([0-9]\)\s/ %\2$\1 /g'
find -name *.properties -print | xargs sed -i 's/=\([sd]\)\s\$\s%\([0-9]\)\s/=%\2$\1 /g'
find -name *.properties -print | xargs sed -i 's/=\([sd]\)\s\$\s%\([0-9]\)$/=%\2$\1/g'
find -name *.properties -print | xargs sed -i 's/\s\([sd]\)\s\$\s%\([0-9]\)$/ %\2$\1/g'

echo "set 2"
find -name *.properties -print | xargs sed -i 's/=\$\s%\s\([0-9]\)/=%\1$s/g'
find -name *.properties -print | xargs sed -i 's/=%\s\([0-9]\)\$\s/=%\1$s /g'
find -name *.properties -print | xargs sed -i 's/=\$\([0-9]\)\s%\s/=%\1$s /g'

echo "set 2b"
find -name *.properties -print | xargs sed -i 's/\s\$\([0-9]\)\s%\s/ %\1$s /g'
find -name *.properties -print | xargs sed -i 's/\s%\s\([0-9]\)\$/ %\1$s /g'

echo "set 3"
find -name *.properties -print | xargs sed -i 's/\s%\([0-9]\)\$\s/ %\1$s /g'
find -name *.properties -print | xargs sed -i 's/=%\([0-9]\)\$\s/=%\1$s /g'
find -name *.properties -print | xargs sed -i 's/\s%\([0-9]\)\s/ %\1$s /g'
echo "set 3b"
find -name *.properties -print | xargs sed -i 's/=%\([0-9]\)\s/=%\1$s /g'
find -name *.properties -print | xargs sed -i 's/\s%\s%$/ %%/g'

echo "set 4"
find -name *.properties -print | xargs sed -i 's/\s%\s\([sd]\)\([ .]\)/ %\1\2/g'
find -name *.properties -print | xargs sed -i 's/ \([sd]\)s \$ % \([0-9]\)$/ \2$\1/g'

echo "set 5a"
find -name *.properties -print | xargs sed -i 's/ \$\s % \s \([0-9]\)/ \1$s/g'
find -name *.properties -print | xargs sed -i 's/=\$\s % \s \([0-9]\)/=%\1$s/g'
find -name *.properties -print | xargs sed -i 's/ % s\([.)]\)\([0-9]\)/=%\1$s/g'

echo "set 5b"
find -name *.properties -print | xargs sed -i 's/% \([0-9]\) \$ \([SDsd]\) /%\1$\L\2 /g'
find -name *.properties -print | xargs sed -i 's/% \([0-9]\) \$ \([SDsd]\)$/%\1$\L\2/g'
find -name *.properties -print | xargs sed -i 's/% \([0-9]\) \$/%\1$s/g'


echo "set 6"
find -name *.properties -print | xargs sed -i 's/=%\([0-9]\)\s/=%\1$s /g'
find -name *.properties -print | xargs sed -i 's/\s%\([0-9]\)\s/ %\1$s /g'
find -name *.properties -print | xargs sed -i 's/\s\([0-9]\)%\s/ %\1$s /g'
find -name *.properties -print | xargs sed -i 's/=\([0-9]\)%\s/=%\1$s /g'

echo "set 7"
find -name *.properties -print | xargs sed -i 's/ % s\./ %s./g'
find -name *.properties -print | xargs sed -i 's/ s \$%\([0-9]\)+\./ %\1$s/g'

find -name *.properties -print | xargs sed -i 's/%\([0-9]\)\d \$?/%\1$s/g'
find -name *.properties -print | xargs sed -i 's/\$ %\([0-9]\)\([^$]\)/%\1$s\2/g'

echo "set 8"
find -name *.properties -print | xargs sed -i 's/%\([0-9]\)\$ /%\1$s /g'
find -name *.properties -print | xargs sed -i 's/\$ % \([0-9]\)/%\1$s/g'
find -name *.properties -print | xargs sed -i 's/\$%\([0-9]\)/%\1$s/g'

echo "set 9"
find -name *.properties -print | xargs sed -i 's/%1\$S/%1$s/g'
find -name *.properties -print | xargs sed -i 's/%1 \$/%1$s/g'
find -name *.properties -print | xargs sed -i 's/s 2\$s/%2$s/g'

echo "set 10"
find -name *.properties -print | xargs sed -i 's/% \([sdSD]\) /%\L\1 /g'
find -name *.properties -print | xargs sed -i 's/ \([0-9]\) \$ \([sSdD]\) / %\1$\L\2 /g'

echo "set 11"
find -name *.properties -print | xargs sed -i 's/% \([0-9]\) \([sdSD]\)%\([^a-zA-Z]\)/%1$\L\2\3/g'
find -name *.properties -print | xargs sed -i 's/% \([0-9]\) \([sdSD]\)%$/%1$\L\2/g'
find -name *.properties -print | xargs sed -i 's/% \([sdSD]\)\([^a-zA-Z]\)/%\1\L\2/g'

echo "set 12"
find -name *.properties -print | xargs sed -i 's/ \([0-9]\) \$ \([sSdD]\)\([^a-zA-Z]\)/ %\1$\L\2\3/g'
find -name *.properties -print | xargs sed -i 's/ \([0-9]\) \$\([^a-zA-Z]\)/ %\1$s\2/g'
find -name *.properties -print | xargs sed -i 's/ \([0-9]\) \$ \([sSdD]\),/ %\1$\L\2,/g'

echo "set 13"
find -name *.properties -print | xargs sed -i 's/% \([0-9]\) \([sSdD]\)\([^a-zA-Z]\)/%\1$\L\2\3/g'
find -name *.properties -print | xargs sed -i 's/% \$ \([0-9]\)\([^a-zA-Z]\)/%\1$s\2/g'
find -name *.properties -print | xargs sed -i 's/% \$ \([0-9]\) \([sSdD]\)\([^a-zA-Z]\)/%\1$\L\2\3/g'

echo "set 14"
find -name *.properties -print | xargs sed -i 's/ \([0-9]\) \$ \([sSdD]\)\([^a-zA-Z]\)/ %\1$\L\2\3/g'
find -name *.properties -print | xargs sed -i 's/\$% \([0-9]\) \([sSdD]\)\([^a-zA-Z]\)/%\1$\L\2\3/g'

echo "set 15"
find -name *.properties -print | xargs sed -i 's/ \([0-9]\) \$ \([sSdD]\)$/ %\1$\L\2/g'
find -name *.properties -print | xargs sed -i 's/ \([0-9]\) \$$/ %\1$s/'

echo "set 16a"
find -name *.properties -print | xargs sed -i 's/% \([0-9]\) \([sSdD]\)$/%\1$\L\2/g'
find -name *.properties -print | xargs sed -i 's/% \$ \([0-9]\)$/%\1$s/g'

echo "set 17"
find -name *.properties -print | xargs sed -i 's/% \$ \([0-9]\) \([sSdD]\)$/%\1$\L\2/g'
find -name *.properties -print | xargs sed -i 's/ \([0-9]\) \$ \([sSdD]\)$/ %\1$\L\2/g'
find -name *.properties -print | xargs sed -i 's/\$% \([0-9]\) \([sSdD]\)$/%\1$\L\2/g'

echo "last attempt"
find -name *.properties -print | xargs sed -i 's/%S\([^a-zA-Z]\)/%s\1/g'
find -name *.properties -print | xargs sed -i 's/\([^%]\)% /\1%s /g'


# %S:
# % (single percent sign)

##
# sed -n 's/$%\([0-9]\)/p'  HtmlBundle_ms.properties | grep %3$s

echo Moving files
find -name *.properties | xargs -i{} mv {} `pwd`
mv *.properties /c/dev/projects/step/step-core/src/main/resources/



# % \$ 1
# 2 \$ d
# 1 \$ s.
# %S:
# 2 \$ 
# 2 \$ s,
# % \$ 1 s 
# % \$ 4 s
# % \$ 1 
# 2 \$ d
# % 1 d
# \$% 1 d
# % (single percent sign)
