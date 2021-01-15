#!/bin/sh
user=`whoami`
if [ "$user" = "root" ]; then
	echo "Starting post install script..." > /var/log/step-post-install.log
	echo "Changing permissions to allow read/write to this directory"
	chmod -R 777 /opt/step/homes >> /var/log/step-post-install.log
	chmod +x /opt/step/post-install.sh
	chmod +x /opt/step/step
	echo "Linking files" >> /var/log/step-post-install.log
	echo ""
	echo "Click on the STEP icon on the desktop to start STEP."
	echo "If there is no STEP icon, enter \"/opt/step/step &\" at the command line."
	user=`pstree -lu -s $$ | grep --max-count=1 -o '([^)]*)' | head -n 1 | sed 's/(//' | sed 's/)//'`
fi
if [ ! -z "$user" ] && [ "$user" != "root" ]; then
	userHome=$(awk -v u="$user" -v FS=':' '$1==u {print $6}' /etc/passwd)
	[ -z "$userHome" ] && userHome = "/home/$user"
    if [ ! -h "$userHome/.sword" ] || [ ! -h "$userHome/.jsword"	]; then
        [ -d "$userHome/Desktop" ] && cp /opt/step/step.desktop $userHome/Desktop/step.desktop && chown $user: $userHome/Desktop/step.desktop
    fi
    ln -sf /opt/step/homes/sword $userHome/.sword
    ln -sf /opt/step/homes/jsword $userHome/.jsword
fi