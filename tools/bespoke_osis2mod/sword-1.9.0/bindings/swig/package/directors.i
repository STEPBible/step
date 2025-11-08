/* 
This is a list of all the classes which have directors enabled.

Directors allow virtual methods of classes to be overridden in a subclass in
the target language. This may have performance implications, and is not
available for all target languages, though it should be for the main ones
*/
%feature("director") sword::SWLog::logMessage;
%feature("director") PyStringMgr;
%feature("nodirector") PyStringMgr::upperUTF8;
%feature("nodirector") PyStringMgr::upperLatin1;

%feature("director") RenderCallback;
%feature("director") MarkupCallback;

%feature("director") SWSearcher;

%feature("director") sword::StatusReporter;
%feature("director") sword::FTPTransport;
%feature("nodirector") sword::FTPTransport::getDirList;

%feature("director:except") {
    if ($error != NULL) {
        throw Swig::DirectorMethodException();
    }
}

%exception {
    try { $action }
    catch (Swig::DirectorException &e) { SWIG_fail; }
}

