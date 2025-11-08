program test1;

uses
  QForms,
  MainFrm in 'MainFrm.pas' {Form1},
  Sword in '../Sword.pas';

{$R *.res}

begin
  Application.Initialize;
  Application.CreateForm(TForm1, Form1);
  Application.Run;
end.
