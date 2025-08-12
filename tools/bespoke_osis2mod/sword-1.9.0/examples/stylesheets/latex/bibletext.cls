\LoadClass[13pt,a4paper,twoside,headinclude=true,footinclude=true,BCOR=0mm,DIV=calc]{scrbook}
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{sword}[2015/03/29 CrossWire LaTeX class for Biblical texts]
\RequirePackage[perpage, para]{footmisc}
\RequirePackage{fancyhdr}
\pagestyle{fancy}
\RequirePackage[verbose,
  colorlinks=true,
  naturalnames=true,
  linkcolor=blue,]{hyperref}

\RequirePackage{polyglossia}
\RequirePackage{lettrine}



\newcommand{\swordchapter}[3]{\hypertarget{#1}{\lettrine{\textbf{#3}}{ }} }
\newcommand{\swordverse}[3]{\hypertarget{#1}{\small{\textsuperscript{#3}} }}
\newcommand{\swordxref}[2]{\hyperlink{#1}{#2}}
\newcommand{\swordfootnote}[6]{\footnote{#6}}
\newcommand{\swordpoetryline}[1]{#1}
\newcommand{\sworddivinename}[1]{\textsc{#1}}
\newcommand{\swordmodule}{}
\newcommand{\swordtestament}{\part*}
\newcommand{\swordbook}{}
%\sworddiclink{%s}{%s}{
%\sworddictref{%s}{%s}{
%\sworddict{%s}{

%\newcommand{\sworddivinename}{%s}{



%\swordfont{

%\swordfootnote{%s}{%s}{%s}{
%\swordfootnote{%s}{%s}{%s}{%s}{
%\swordmorph{
%\swordmorph[Greek]{%s}
%\swordmorph[lemma]{%s}
%\swordmorph{%s}
%\swordquote{
%\swordref{%s}{%s}{
%\swordsection{
%\swordsection{}{
%\swordsection{book}{
%\swordsection{sechead}{
%\swordstrong[Greek]{
%\swordstrong[Greektense]{
%\swordstrong[Hebrew]{
%\swordstrong[Hebrewtense]{
%\swordstrong[%s]{%s}{
%\swordstrong{%s}{%s}
\newcommand{\swordtitle}[3]{\ \newline\textbf{#3}\\\\}
%\swordtranschange{supplied}{
%\swordtranschange{tense}{
%\swordwoj{
%\swordxref{
%\swordxref{%s}{%s}{
