%{
#include "swcom.h"
%}

%ignore sword::SWCom::SWCom;

%include "swcom.h"

%extend sword::SWCom {
	/* C++-style cast */
	static sword::SWCom *castTo(sword::SWModule *o) {
		return dynamic_cast<sword::SWCom*>(o);
	}
}