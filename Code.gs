function onSubmit(e) {
  
  Logger.log(JSON.stringify(e));
  
      onRequest(e.namedValues["Section"],e);
     
}

function onEdit(e){
 var editedSheet = e.source.getActiveSheet();
  var section = editedSheet.getName();
    if( editedSheet.getName() == 'Responsible' ) {
        return;
    }
  
  var range = e.range;
  
  
  if(range.getNumColumns() != 1 || range.getNumRows() != 1) {
        showAlert('Warning', 'Only change one row at a time!');
        return;
    }
  
   var rowId = range.getRow(); // row used for inserting into the google sheet

    var row = editedSheet.getRange(rowId, 1, 1, editedSheet.getLastColumn());
    var checked = row.getCell(1, 6);
    var checkedBy = row.getCell(1, 7);
    var googleAccount = row.getCell(1,8);
  var when = row.getCell(1,9);
  
  if(range.getColumn() == 6){
  if (checkedBy.getValue() == "" || checkedBy.getValue() == null){
  checked.setValue('waiting');
     checked.setComment('You have to fill in your name first in checked By');
  }else{
    checked.clearComment();
  when.setValue(new Date());
   when.protect();
    
    if(range.getColumn()==6 && checked.getValue()== 'checked'){
      var student = makeStudent(row);
      var mail_options = {};
      mail_options.attachments = createCertificate(student, section);
    informStudent(row.getCell(1,3).getValue(),mail_options,"checked",e);
    }
    if(range.getColumn()==6 && checked.getValue()== 'rejected'){
      informStudent(row.getCell(1,3).getValue(),{},"rejected",e);
    }
    
  }
  }
}

function onRequest(section,e){
  
  Logger.log("we made it here");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(section);
  
  var responsible = getResponsible(section);
  
  
  sheet.appendRow([e.namedValues["First Name"][0],e.namedValues["Last Name"][0],e.namedValues["Email"][0],e.namedValues["Studies"][0],new Date()]);
  var rowNr = sheet.getLastRow();
  var row = sheet.getRange(rowNr, 1, 1, 10);
  
  var checked = sheet.getRange(rowNr, 6);
 var rule = SpreadsheetApp.newDataValidation().requireValueInList(['checked', 'rejected', 'waiting'], false).build();
 checked.setDataValidation(rule);
  checked.setValue('waiting');
  
  
  informResponsible(responsible,section,e);
  
  
}

function Student(){
  
  this.firstname = "";
  this.lastname = "";
  this.email="";
  this.studies ="";
  this.date="";
  
};

function makeStudent(row){
var student = new Student();
  student.firstname = row.getCell(1,1).getValue();
  student.lastname = row.getCell(1,2).getValue();
  student.email = row.getCell(1,3).getValue();
  student.studies = row.getCell(1,4).getValue();
  student.date = row.getCell(1,5).getValue();
  
  return student;
}

function getResponsible(section){
  var row=findRow(section,"Responsible");
  if(row==-1){
    return "president@esnaustria.org";
  }else{
    return row[2];
  }}


function findRow(value,sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  for (var i = 0; i < values.length; i++) {
    var row = "";
    for (var j = 0; j < values[i].length; j++) {     
      if (values[i][j] == value) {
        row = values[i];
        return row;
      }
    }    
  }  
  return -1;
}

function informResponsible(responsiblePersonEmail,request,e){
  sendGmailTemplate(responsiblePersonEmail, "There is a new StuWo code request",{},"newRequest");
}

function informStudent(responsiblePersonEmail,mail_options,request,e){
  if(request=="checked"){
    sendGmailTemplate(responsiblePersonEmail, "Your request for a StuWo code was accepted",mail_options,"confirmEmailaccepted");
  }
  if(request=="rejected"){
    sendGmailTemplate(responsiblePersonEmail, "Your request for a StuWo code was rejected",mail_options,"confirmEmailrejected");
  }
}


function emailtest(){
  sendGmailTemplate("jens.bulinckx@esnuniwien.com", "Confirmation StuWo code",{},'confirmEmailaccepted');
}