echo "Starting post install script..." > /var/log/step-post-install.log

eval echo "Home directory is ~" >> /var/log/step-post-install.log

echo "Changing permissions to allow read/write to this directory"
chmod -R 777 /opt/step/homes >> /var/log/step-post-install.log

echo "Linking files" >> /var/log/step-post-install.log
ln -sf /opt/step/homes/sword ~/.sword >> /var/log/step-post-install.log
ln -sf /opt/step/homes/jsword ~/.jsword >> /var/log/step-post-install.log
ln -sf /opt/step/step.desktop ~/Desktop/step.desktop >> /var/log/step-post-install.log

