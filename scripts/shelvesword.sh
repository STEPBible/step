#!/bin/sh 

#swaps the user home on Windows
mv $APPDATA/Sword $APPDATA/Sword.push
mv $APPDATA/JSword $APPDATA/JSword.push
mv $HOME/.STEP $HOME/.STEP.push

