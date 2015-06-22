#!/bin/sh 

#swaps the user home on Windows
mv $APPDATA/Sword.push $APPDATA/Sword 
mv $APPDATA/JSword.push $APPDATA/JSword 
mv $HOME/.STEP.push $HOME/.STEP 

