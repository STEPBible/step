rm -rf com
jar -x com/tyndalehouse/step/core/data/create/lexicon/lexicon_greek.txt < /var/lib/tomcat9/webapps/step-web/WEB-INF/lib/step-core-data-24.1.2.jar
jar -x com/tyndalehouse/step/core/data/create/lexicon/lexicon_hebrew.txt < /var/lib/tomcat9/webapps/step-web/WEB-INF/lib/step-core-data-24.1.2.jar
jar -x com/tyndalehouse/step/core/data/create/augmentedStrongs/augmented_strongs.txt < /var/lib/tomcat9/webapps/step-web/WEB-INF/lib/step-core-data-24.1.2.jar
jar -x com/tyndalehouse/step/core/data/create/morphology/robinson_morphology.csv < /var/lib/tomcat9/webapps/step-web/WEB-INF/lib/step-core-data-24.1.2.jar
python3 getMorph.py com/tyndalehouse/step/core/data/create/morphology/robinson_morphology.csv
python3 getVocab.py com/tyndalehouse/step/core/data/create/lexicon/lexicon_greek.txt com/tyndalehouse/step/core/data/create/augmentedStrongs/augmented_strongs.txt
python3 getVocab.py com/tyndalehouse/step/core/data/create/lexicon/lexicon_hebrew.txt com/tyndalehouse/step/core/data/create/augmentedStrongs/augmented_strongs.txt
