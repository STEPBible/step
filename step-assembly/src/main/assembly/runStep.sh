#!/bin/sh
user=`whoami`
if [ "$user" = "root" ]; then
	echo ""
	echo "STEPBible should not run under root. Exiting ... Please run STEPBible with another user account."
	exit
fi
/opt/step/step-install4j  > ~/step.log 2>&1 &