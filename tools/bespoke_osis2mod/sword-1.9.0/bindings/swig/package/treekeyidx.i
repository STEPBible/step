%{
#include "treekeyidx.h"
%}

%include "treekeyidx.h"

%extend sword::TreeKeyIdx {
	static sword::TreeKeyIdx *castTo(sword::SWKey *o) {
		return dynamic_cast<sword::TreeKeyIdx*>(o);
	}
}
