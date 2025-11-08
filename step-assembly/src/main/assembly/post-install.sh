#!/bin/sh
user=`whoami`
if [ "$user" = "root" ]; then
	echo "Starting post install script..." > /var/log/step-post-install.log
	echo "Changing permissions to allow read/write to this directory"
	chmod -R 777 /opt/step/homes >> /var/log/step-post-install.log
	chmod +x /opt/step/post-install.sh
	rm -f /opt/step/step-install4j
	mv /opt/step/step /opt/step/step-install4j
	cp /opt/step/runStep.sh step
	chmod +x /opt/step/step
	chmod +x /opt/step/step-install4j

        # Override the default .sword location with the Java property "sword.home"
        # This mitigates issues when other Sword programs are installed on the computer
        grep -q 'sword\.home' /opt/step/step-install4j
        if [ $? -ne 0 ]; then
            sed -i 's|"$app_java_home/bin/java"|"$app_java_home/bin/java" "-Dsword.home=$HOME/.sword-step"|' /opt/step/step-install4j
        fi

	echo "Linking files" >> /var/log/step-post-install.log
	echo ""
	echo "Click on the STEP icon on the desktop to start STEP."
	echo "If there is no STEP icon, enter \"step\" or \"/opt/step/step\" at the command line."
	user=`pstree -lu -s $$ | grep --max-count=1 -o '([^)]*)' | head -n 1 | sed 's/(//' | sed 's/)//'`
fi
if [ ! -z "$user" ] && [ "$user" != "root" ]; then
	userHome=$(awk -v u="$user" -v FS=':' '$1==u {print $6}' /etc/passwd)
	[ -z "$userHome" ] && userHome = "/home/$user"
    if [ ! -h "$userHome/.sword-step" ] || [ ! -h "$userHome/.jsword"	]; then
        [ -d "$userHome/Desktop" ] && cp /opt/step/step.desktop $userHome/Desktop/step.desktop && chown $user: $userHome/Desktop/step.desktop
    fi
    ln -sf /opt/step/homes/sword $userHome/.sword-step
    ln -sf /opt/step/homes/jsword $userHome/.jsword
fi
