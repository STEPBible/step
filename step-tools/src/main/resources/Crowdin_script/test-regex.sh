#!/bin/sh 
set -e

echo "set 10"
find -name "*.properties" -print | xargs sed -i 's/% \([0-9]\) \$ \([sd]\) /%\1$\2 /g'
find -name "*.properties" -print | xargs sed -i 's/% \([0-9]\) \$ \([sd]\)$/%\1$\2/g'

