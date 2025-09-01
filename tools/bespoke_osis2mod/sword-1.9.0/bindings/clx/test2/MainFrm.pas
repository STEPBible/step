unit MainFrm;

interface

uses
  SysUtils, StrUtils, Types, Classes, Variants, QGraphics, QControls, QForms, QDialogs,
  QStdCtrls, QComCtrls, QExtCtrls, Sword, QButtons, QImgList, QMenus,
  QTypes;

type
  TForm1 = class(TForm)
    Panel1: TPanel;
    TreeView1: TTreeView;
    ImageList1: TImageList;
    Splitter1: TSplitter;
    Panel3: TPanel;
    Splitter2: TSplitter;
    Panel4: TPanel;
    TextBrowser2: TTextBrowser;
    Panel5: TPanel;
    ListView: TListView;
    Splitter3: TSplitter;
    Panel6: TPanel;
    Edit2: TEdit;
    StatusBar1: TStatusBar;
    ColorDialog1: TColorDialog;
    FontDialog1: TFontDialog;
    Panel8: TPanel;
    Splitter4: TSplitter;
    Panel7: TPanel;
    TextBrowser3: TTextBrowser;
    Panel2: TPanel;
    TextBrowser1: TTextBrowser;
    ToolBar2: TToolBar;
    Edit1: TEdit;
    ComboBox1: TComboBox;
    SpinEdit1: TSpinEdit;
    SpinEdit2: TSpinEdit;
    ToolButton4: TToolButton;
    Label2: TLabel;
    btnBTFollow: TToolButton;
    btnCMFollow: TToolButton;
    ImageList2: TImageList;
    MainMenu1: TMainMenu;
    File1: TMenuItem;
    Exit1: TMenuItem;
    Options1: TMenuItem;
    Strongs1: TMenuItem;
    MorphTags1: TMenuItem;
    Footnotes1: TMenuItem;
    ChangeTextFont1: TMenuItem;
    CurrentVerseColor1: TMenuItem;
    procedure Edit1Change(Sender: TObject);
    procedure TreeView1Change(Sender: TObject; Node: TTreeNode);
    procedure Button1Click(Sender: TObject);
    procedure FormCreate(Sender: TObject);
    procedure FormShow(Sender: TObject);
    procedure ToolButton1Click(Sender: TObject);
    procedure Edit2Change(Sender: TObject);
    procedure ListViewItemClick(Sender: TObject; Button: TMouseButton;
      Item: TListItem; const Pt: TPoint; ColIndex: Integer);
    procedure SpinEdit2Changed(Sender: TObject; NewValue: Integer);
    procedure SpinEdit1Changed(Sender: TObject; NewValue: Integer);
    procedure ComboBox1Change(Sender: TObject);
    procedure CurrentVerseColor1Click(Sender: TObject);
  private
    fontName: string;
    fontSize: integer;
    doOnChange: boolean;
    procedure setBookCombo(ref: String);
    procedure lookup();
    procedure lookupLD();
    function getChapter(key: String): integer; 
    function getVerse(key: String): integer;
    procedure FillDictKeys(key: String);
  public
    { Public declarations }
    curModBT: String;
    curModCM: String;
    curModLD: String;
  end;

var
   Form1: TForm1;
   mgr : SWMgr;
   
implementation

{$R *.xfm}

procedure TForm1.Edit1Change(Sender: TObject);
begin
	if (doOnChange) then
   		lookup();
end;

procedure TForm1.setBookCombo(ref: string);
var
    pos: integer;
    bookname: string;

begin
     pos := LastDelimiter(' ',ref);
     bookname := LeftStr(ref,pos);
     ComboBox1.Text := bookname;
end;

function TForm1.getChapter(key: String): integer;
var
   len:     integer;
   pos:     integer;
   j:	    integer;
   tmpbuf:  String;
begin
       //len := Length(key);
       pos := LastDelimiter(':',key);
       tmpbuf := '000';
       j := 3;
       for len := pos-1 downto 0 do
       begin
           if(key[len] <> ' ') then
           begin
           	tmpbuf[j] := key[len];
                j := j -1;
           end
           else break;
       end;
       Result := StrToInt(tmpbuf);
end;


function TForm1.getVerse(key: String): integer;
var
   len:     integer;
   pos:     integer;
   j:	    integer;
   i:       integer;
   tmpbuf:  String;
begin
       len := Length(key);
       pos := LastDelimiter(':',key);
       tmpbuf := '    ';
       j := 1;
       for i := pos+1 to len do
       begin
           if(key[i] <> '') then
           begin
           	tmpbuf[j] := key[i];
                j := j + 1;
           end
           else break;
       end;
       tmpbuf := TrimRight(tmpbuf);
       Result := StrToInt(tmpbuf);
end;


procedure TForm1.lookup();
var
   module 	: SWModule;
   chapter	: integer;
   buf		: string;
   currentVerse : string;
   text		: string;
   key 		: string;
   verse	: integer;
   j		: integer;
begin
      module := mgr.getModuleByName(curModBT);
      if (module <> nil) then
      begin
         module.setKeyText(Edit1.Text);
         currentVerse :=  module.getKeyText;
         chapter := getChapter(currentVerse);
         verse := getVerse(currentVerse);

         doOnChange := false;
         setBookCombo(currentVerse);
         SpinEdit1.Value := chapter;
         SpinEdit2.Value := verse;
         doOnChange := true;
         
         buf := '                                           ';
         key := module.getKeyText;
         j := 1;
         if(AnsiContainsText(key,':')) then
         begin
       		while key[j] <> ':' do
       		begin
       			buf[j] := key[j];
        		j := j + 1;
       		end;
         end;
         buf := TrimRight(buf);
         buf := buf + ':1';
         module.setKeyText(buf);
         text := '<html><body>';
         while(chapter =  getChapter(module.getKeyText)) do
         begin
                if(currentVerse = module.getKeyText) then
                	text := text + '<small><b><font  color="blue">' +
                        	module.getKeyText() +
                                '</font><b></small> ' +
                	       '<A NAME="cv"><font face="' + fontName +
                               '" size="' + IntToStr(fontSize) +
                        	'"color="forest green">'   +
                               module.getRenderText() +  '</font></a><br>'
                else
                    	text := text + '<small><b><font color="blue">' +
                        	module.getKeyText() +
                                '</font><b></small> ' + '<font face="' +
                                fontName +   '" size="' + IntToStr(fontSize) + '">' +
                		module.getRenderText() +  '</font><br>';
               	//buf := IntToStr(chapter);
                //Label1.Caption := IntToStr(chapter) + ':' + IntToStr(verse);
         	module.modNext;
         end;
          text := text + '</body></html>';
          TextBrowser1.Text := text;
          TextBrowser1.ScrollToAnchor('cv');
          StatusBar1.SimpleText := currentVerse;
      end;
   //end;


   if(btnCMFollow.Down)  then
   begin
      module := mgr.getModuleByName(curModCM);
      if (module <> nil) then
      begin
               module.setKeyText(Edit1.Text);
                TextBrowser3.Text :=
                '<HTML><BODY>' +
                        '<font  color="blue"><small><b>[' +
                        module.getName + '] ' +
                        module.getKeyText() +
                        '<b></small></font> ' +
                module.getRenderText() +
                '</BODY></HTML>';

                //Label1.Caption := ': ' + module.getKeyText();
      end;
   end;
end;

procedure TForm1.lookupLD();
var
   module : SWModule;
begin
     module := mgr.getModuleByName(curModLD);
      if (module <> nil) then
      begin
           module.setKeyText(Edit2.Text);
                TextBrowser2.Text :=
                '<HTML><BODY>' +
                        '<font  color="blue"><small><b>[' +
                        module.getName + '] ' + module.getKeyText() +
                        '<b></small></font> ' +
                module.getRenderText() +
                '</BODY></HTML>';
      end;
      FillDictKeys(module.getKeyText);


end;

procedure TForm1.TreeView1Change(Sender: TObject; Node: TTreeNode);
var
   module : SWModule;

begin
        module := mgr.getModuleByName(Node.Text);
        if (module <> nil) then
        begin
                if(module.getType = 'Biblical Texts') then
                begin
                        curModBT := Node.Text;  
        		lookup();
                end;

                if(module.getType = 'Commentaries') then
                begin
                        curModCM := Node.Text;
        		lookup();
                end;    

                if(module.getType = 'Lexicons / Dictionaries') then
                begin
                        curModLD := Node.Text;
                        lookupLD;
                end;
        end;
end;

procedure TForm1.Button1Click(Sender: TObject);
begin
   Application.Terminate;
end;

procedure TForm1.FormCreate(Sender: TObject);
begin
   mgr := SWMgr.Create;
end;

procedure TForm1.FormShow(Sender: TObject);
var
   node : TTreeNode;
   module : SWModule;
   modIt : ModIterator;
   found : Boolean;

begin
   doOnChange := true;
   fontName := '';
   fontSize := 3;   // html font size

   modIt := mgr.getModulesIterator;
   module := modIt.getValue;
   while (module <> nil) do
   begin
        node := TreeView1.Items.GetFirstNode;
        found := false;
        while ((node <> nil) AND (NOT found)) do
        begin
           if (node.Text = module.getType) then
                found := true
           else node := node.getNextSibling;
        end;
        if (node = nil) then
           node := TreeView1.Items.AddChild(TreeView1.TopItem, module.GetType());

        TreeView1.Items.AddChild(node, module.GetName());
        
        modIt.Next;
        module := modIt.getValue;
   end;
end;

procedure TForm1.ToolButton1Click(Sender: TObject);
begin
	FontDialog1.Execute;
        fontName := FontDialog1.Font.Name;
        fontSize := FontDialog1.Font.Size;
        if (fontSize > 18) then fontSize := 7
        else if (fontSize < 8) then fontSize := 1
        else if (fontSize = 8) then fontSize := 1
        else if (fontSize = 9) then fontSize := 1
        else if (fontSize = 10) then fontSize := 2
        else if (fontSize = 11) then fontSize := 3
        else if (fontSize = 12) then fontSize := 3
        else if (fontSize = 13) then fontSize := 4
        else if (fontSize = 14) then fontSize := 5
        else if (fontSize = 15) then fontSize := 5
        else if (fontSize = 16) then fontSize := 6
        else if (fontSize = 17) then fontSize := 6
        else if (fontSize = 18) then fontSize := 7;

        lookup;
end;

procedure TForm1.Edit2Change(Sender: TObject);
begin
	lookupLD();
end;


procedure TForm1.FillDictKeys(key: string);
var
        module : SWModule;
        count  : integer;
        i      : integer;
        ListItem: TListItem;
begin
        module := mgr.getModuleByName(curModLD);
        count := (ListView.Height div (ListView.Font.Height + 8));
        ListView.Items.Clear;
        for i := 0 to (count div 2) do
        	module.modNext;	//-- get equal number of keys before and after our starting key(saveKey)
        for i := 0 to count - 1 do
        	module.modPrevious;
        for i := 0 to count do
        begin
                ListItem := ListView.Items.Add;
                ListItem.Caption := module.getKeyText;
                module.modNext;
        end;
        module.setKeyText(key);
end;

procedure TForm1.ListViewItemClick(Sender: TObject; Button: TMouseButton;
  Item: TListItem; const Pt: TPoint; ColIndex: Integer);
begin
	Edit2.Text := Item.Caption;
end;

procedure TForm1.SpinEdit2Changed(Sender: TObject; NewValue: Integer);
begin
     	Edit1.Text := ComboBox1.Text + ' ' + SpinEdit1.Text + ':' + SpinEdit2.Text;
end;

procedure TForm1.SpinEdit1Changed(Sender: TObject; NewValue: Integer);
begin
     	Edit1.Text := ComboBox1.Text + ' ' + SpinEdit1.Text + ':1';
end;

procedure TForm1.ComboBox1Change(Sender: TObject);
begin
       	Edit1.Text := ComboBox1.Text + ' ' + '1:1';
end;

procedure TForm1.CurrentVerseColor1Click(Sender: TObject);
begin
	ColorDialog1.Execute
        //ColorDialog1.Color
end;

end.
