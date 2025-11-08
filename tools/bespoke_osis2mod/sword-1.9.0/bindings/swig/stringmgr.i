
%{
#include "stringmgr.h"
class PyStringMgr : public sword::StringMgr
{
    public:
       char *upperUTF8(char *text, unsigned int max = 0) const
        {
            sword::SWBuf buf=(const char*)text;
            getUpper(&buf);
            strncpy(text, buf.c_str(), (max) ? max : strlen(text));
            return text;
        }

        virtual void getUpper(sword::SWBuf* test) const = 0;
};
%}

%include "stringmgr.h"
class PyStringMgr : public sword::StringMgr
{
    public:
       char *upperUTF8(char *text, unsigned int max = 0) const;
       virtual void getUpper(sword::SWBuf* test) const = 0;
};

