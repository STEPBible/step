unit MainFrm;

interface

uses
  SysUtils, Types, Classes, Variants, QGraphics, QControls, QForms, QDialogs,
  QStdCtrls, QComCtrls, QExtCtrls, Sword;

type
  TForm1 = class(TForm)
    Panel1: TPanel;
    Panel2: TPanel;
    Panel3: TPanel;
    TreeView1: TTreeView;
    Button1: TButton;
    Edit1: TEdit;
    Label1: TLabel;
    TextBrowser1: TTextBrowser;
    procedure Edit1Change(Sender: TObject);
    procedure TreeView1Change(Sender: TObject; Node: TTreeNode);
    procedure Button1Click(Sender: TObject);
    procedure FormCreate(Sender: TObject);
    procedure FormShow(Sender: TObject);
  private
    procedure lookup();
  public
    { Public declarations }
  end;

var
   Form1: TForm1;
   mgr : SWMgr;
   
implementation

{$R *.xfm}

procedure TForm1.Edit1Change(Sender: TObject);
begin
   lookup();
end;

procedure TForm1.lookup();
var
   module : SWModule;
   node : TTreeNode;
   
begin
   node := TreeView1.Selected;
   if (node <> nil) then
   begin
      module := mgr.getModuleByName(node.Text);
      if (module <> nil) then
      begin
         module.setKeyText(Edit1.Text);

         TextBrowser1.Text := 
            '<HTML><BODY>' +
               '<small><b>' + module.getKeyText() + '<b></small> ' +
               module.getRenderText() +
            '</BODY></HTML>';
            
         Label1.Caption := ': ' + module.getKeyText();
      end;
   end;
end;

procedure TForm1.TreeView1Change(Sender: TObject; Node: TTreeNode);
begin
        lookup();
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
   root, node : TTreeNode;
   module : SWModule;
   modIt : ModIterator;
   found : Boolean;
   
begin
//   root := TreeView1.TopItem;
//   root := TreeView1.Items.AddChild(TreeView1.TopItem, 'Modules');

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

end.
