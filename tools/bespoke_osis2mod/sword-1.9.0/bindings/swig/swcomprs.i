%{
#include <swcomprs.h>
%}

%ignore sword::SWCompress::Buf;
%ignore sword::SWCompress::zBuf;
%ignore sword::SWCompress::GetChars;
%ignore sword::SWCompress::SendChars;

%include "swcomprs.h"
