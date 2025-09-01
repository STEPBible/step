unit Sword;

   
interface
   const LIBNAME = 'sword.dll';
   function  SWMgr_getPrefixPath(h: integer): PChar; cdecl; external libname;
   function  SWMgr_new: integer; cdecl; external LIBNAME;
   procedure SWMgr_delete(h: integer); cdecl; external LIBNAME;
   function  SWMgr_getModulesIterator(h: integer) : integer; cdecl; external LIBNAME;
   function  SWMgr_getModuleByName(h: integer; name: PChar) : integer; cdecl; external LIBNAME;

   procedure ModList_iterator_next(h: integer); cdecl; external LIBNAME;
   function  ModList_iterator_val(h: integer) : integer; cdecl; external LIBNAME;

   function  SWModule_getType(h: integer) : PChar; cdecl; external LIBNAME;
   function  SWModule_getName(h: integer) : PChar; cdecl; external LIBNAME;
   function  SWModule_getDescription(h: integer) : PChar; cdecl; external LIBNAME;
   function  SWModule_getStripText(h: integer) : PChar; cdecl; external LIBNAME;
   function  SWModule_getRenderText(h: integer) : PChar; cdecl; external LIBNAME;
   function  SWModule_getKeyText(h: integer) : PChar; cdecl; external LIBNAME;
   procedure SWModule_setKeyText(h: integer; key: PChar); cdecl; external LIBNAME;
   procedure SWModule_begin(h: integer); cdecl; external LIBNAME;
   procedure SWModule_next(h: integer); cdecl; external LIBNAME;
   procedure SWModule_previous(h: integer); cdecl; external LIBNAME;
type

   SWModule = class(TObject)
   private
      handle : integer;
   public
      constructor Create(handle : integer);
      function getType : String;
      function getName : String;
      function getDescription : String;
      function getStripText : String;                
      function getRenderText : WideString;                
      function getKeyText : String;                
      procedure setKeyText(keyText : String);
      procedure modBegin;
      procedure modNext;
      procedure modPrevious;
   end;

   
   ModIterator = class(TObject)
   private
      handle : integer;
   public
      constructor Create(handle : integer);
      procedure next;
      function getValue : SWModule;
   end;
  

   SWMgr = class(TObject)
   private
      handle : integer;
   public
      constructor Create;
      destructor Destroy; override;
      function getPrefixPath : String;
      function getModulesIterator : ModIterator;
      function getModuleByName(name: String) : SWModule;
  end;

implementation

constructor SWMgr.Create;
var
   yohan : integer;
begin
   yohan := SWMgr_new;
   handle := yohan;
end;


destructor SWMgr.Destroy;
begin
   SWMgr_delete(handle);
end;


function SWMgr.getPrefixPath() : String;
var
   stuff : String;
   pstuff : PChar;
begin
   pstuff := SWMgr_getPrefixPath(handle);
   stuff := String(pstuff);
   Result := stuff;
end;


function SWMgr.getModulesIterator : ModIterator;
begin
   Result := ModIterator.Create(SWMgr_getModulesIterator(handle));
end;

function SWMgr.getModuleByName(name: String) : SWModule;
var
   modHandle : Integer;
   
begin
   modHandle := SWMgr_getModuleByName(handle, PChar(name));
   if (modHandle <> 0) then
      Result := SWModule.Create(modHandle)
   else Result := nil;
end;




{ ModIterator methods --------------------------------------------- }


constructor ModIterator.Create(handle : integer);
begin
   Self.handle := handle;
end;


procedure ModIterator.next;
begin
   ModList_iterator_next(handle);
end;


function ModIterator.getValue : SWModule;
var
   modHandle : Integer;
   
begin
   modHandle := ModList_iterator_val(handle);
   if (modHandle <> 0) then
      Result := SWModule.Create(modHandle)
   else Result := nil;
end;





{ SWModule methods --------------------------------------------- }


constructor SWModule.Create(handle : integer);
begin
   Self.handle := handle;
end;


function SWModule.getType : String;
begin
   Result := String(SWModule_getType(handle));
end;


function SWModule.getName : String;
begin
   Result := String(SWModule_getName(handle));
end;


function SWModule.getDescription : String;
begin
   Result := String(SWModule_getDescription(handle));
end;


function SWModule.getStripText : String;
begin
   Result := String(SWModule_getStripText(handle));
end;


function SWModule.getRenderText : WideString;
begin
   Result := WideString(SWModule_getRenderText(handle));
end;


function SWModule.getKeyText : String;
begin
   Result := String(SWModule_getKeyText(handle));
end;


procedure SWModule.setKeyText(keyText: String);
begin
   SWModule_setKeyText(handle, PChar(keyText));
end;


procedure SWModule.modBegin;
begin
   SWModule_begin(handle);
end; 


procedure SWModule.modNext;
begin
   SWModule_next(handle);
end; 


procedure SWModule.modPrevious;
begin
   SWModule_previous(handle);
end;

end.


