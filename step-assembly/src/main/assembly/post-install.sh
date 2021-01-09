echo "Starting post install script..." > /var/log/step-post-install.log

eval echo "Home directory is ~" >> /var/log/step-post-install.log

echo "Changing permissions to allow read/write to this directory"
chmod -R 777 /opt/step/homes >> /var/log/step-post-install.log

echo "Linking files" >> /var/log/step-post-install.log
ln -sf /opt/step/homes/sword ~/.sword >> /var/log/step-post-install.log
ln -sf /opt/step/homes/jsword ~/.jsword >> /var/log/step-post-install.log
[ -d "~/Desktop" ] && ln -sf /opt/step/step.desktop ~/Desktop/step.desktop >> /var/log/step-post-install.log

origUser=`pstree -lu -s $$ | grep --max-count=1 -o '([^)]*)' | head -n 1 | sed 's/(//' | sed 's/)//'`
if [ ! -z "$origUser" ]
then
    [ -d "/home/$origUser/Desktop" ] && ln -sf /opt/step/step.desktop /home/$origUser/Desktop/step.desktop  >> /var/log/step-post-install.log
    [ -d "/home/$origUser" ] && ln -sf /opt/step/homes/sword /home/$origUser/.sword >> /var/log/step-post-install.log
    [ -d "/home/$origUser" ] && ln -sf /opt/step/homes/jsword /home/$origUser/.jsword >> /var/log/step-post-install.log
fi
echo ""
echo "Click on the STEP icon on the desktop to start STEP."
echo "If the STEP icon is not available, enter \"step\" at the command line."
