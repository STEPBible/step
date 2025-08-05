%{
#include "versetreekey.h"
%}

%include "versetreekey.h"

%extend sword::VerseTreeKey {
	/* C++-style cast */
	static sword::VerseTreeKey *castTo(sword::SWKey *o) {
		return dynamic_cast<sword::VerseTreeKey*>(o);
	}
};
