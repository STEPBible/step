#!/bin/sh
user=`whoami`
if [ "$user" = "root" ]; then
	echo ""
	echo "STEPBible should not run under root. Exiting ... Please run STEPBible with another user account."
	exit
fi
userHome=$(awk -v u="$user" -v FS=':' '$1==u {print $6}' /etc/passwd)
[ -z "$userHome" ] && userHome = "/home/$user"
if [ ! -h "$userHome/.sword" ] || [ ! -h "$userHome/.jsword"	]; then
   [ -d "$userHome/Desktop" ] && cp /opt/step/step.desktop $userHome/Desktop/step.desktop && chown $user: $userHome/Desktop/step.desktop
fi
ln -sf /opt/step/homes/sword $userHome/.sword
ln -sf /opt/step/homes/jsword $userHome/.jsword
/opt/step/step-install4j  > ~/step.log 2>&1 &