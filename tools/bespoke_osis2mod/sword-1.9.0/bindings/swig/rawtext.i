%{
#include "rawtext.h"
%}

%include "rawtext.h"


%extend sword::RawText {
	static sword::RawText *castTo(sword::SWModule *o) {
		return dynamic_cast<sword::RawText*>(o);
	}	
}
