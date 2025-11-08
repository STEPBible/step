%{
#include "swtext.h"
%}

%ignore sword::SWText::SWText;

%include "swtext.h"

%extend sword::SWText {
	static sword::SWText *castTo(sword::SWModule *o) {
		return dynamic_cast<sword::SWText*>(o);
	}
}