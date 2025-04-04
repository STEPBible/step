#!/bin/bash
set -e

if [[ $# -ne 1 ]] ; then
	echo "create_cache_files.sh <current-version>"
	exit
fi
CURRENT_VERSION=$1
if [[ $CURRENT_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+[a-z]?$ ]] ; then
	echo "Current version provided is $CURRENT_VERSION"
else
	echo "Input error: current version must have a pattern like 24.12.1"
	exit
fi
WWW_URL=dev.stepbible.org
CHECK_UP=`curl --silent https://$WWW_URL | grep $CURRENT_VERSION | wc -l`
if [[ $CHECK_UP -eq "0" ]]
then
	echo "Status check failed - www is not up or is not running the specified new version."
	exit 1;
fi
rm -rf com
jar -x com/tyndalehouse/step/core/data/create/lexicon/lexicon_greek.txt < /var/lib/tomcat9/webapps/step-web/WEB-INF/lib/step-core-data-$CURRENT_VERSION.jar
jar -x com/tyndalehouse/step/core/data/create/lexicon/lexicon_hebrew.txt < /var/lib/tomcat9/webapps/step-web/WEB-INF/lib/step-core-data-$CURRENT_VERSION.jar
jar -x com/tyndalehouse/step/core/data/create/augmentedStrongs/augmented_strongs.txt < /var/lib/tomcat9/webapps/step-web/WEB-INF/lib/step-core-data-$CURRENT_VERSION.jar
jar -x com/tyndalehouse/step/core/data/create/morphology/robinson_morphology.csv < /var/lib/tomcat9/webapps/step-web/WEB-INF/lib/step-core-data-$CURRENT_VERSION.jar
python3 getMorph.py com/tyndalehouse/step/core/data/create/morphology/robinson_morphology.csv
python3 getVocab.py com/tyndalehouse/step/core/data/create/lexicon/lexicon_greek.txt com/tyndalehouse/step/core/data/create/augmentedStrongs/augmented_strongs.txt
python3 getVocab.py com/tyndalehouse/step/core/data/create/lexicon/lexicon_hebrew.txt com/tyndalehouse/step/core/data/create/augmentedStrongs/augmented_strongs.txt
