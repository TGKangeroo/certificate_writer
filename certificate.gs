function getTemplate(id) {
  var doc = DocumentApp.openById(id);
  return doc;
}


function copyTemplate(section){
  var folder = DriveApp.getFolderById(getSectionFolder(section));
  var file = DriveApp.getFileById(TEMPLATE_ID)  
  var tempFile= file.makeCopy("temp file",folder);
  var tempfileId = tempFile.getId();
  
  return tempfileId;
}


function getSectionFolder(section){
  if(section=="ESN Buddynetwork TU Wien"){
    return DRIVE_TU_FOLDER;
  }
  if(section=="ESN Technikum Wien"){
    return DRIVE_TECHNIKUM_FOLDER;
  }
  if(section=="ESN Innsbruck"){
    return DRIVE_INNSBRUCK_FOLDER;
  }
  if(section=="ESN BOKU Wien"){
    return DRIVE_BOKU_FOLDER;
  }
  if(section=="ESN BFI Vienna"){
    return DRIVE_BFI_FOLDER;
  }
  if(section=="ESN Uni Wien"){
    return DRIVE_UW_FOLDER;
  }
  if(section=="ESN FH WKW Wien"){
    return DRIVE_WKW_FOLDER;
  }
  if(section=="ESN Salzburg"){
    return DRIVE_SALZBURG_FOLDER;
  }
  if(section=="ESN Klagenfurt"){
    return DRIVE_KLAGENFURT_FOLDER;
  }
  if(section=="ESN Uni Graz"){
    return DRIVE_UNIGRAZ_FOLDER;
  }
  if(section=="ESN TU Graz"){
    return DRIVE_TUGRAZ_FOLDER;
  }
  if(section=="ESN Krems"){
    return DRIVE_KREMS_FOLDER;
  }
  if(section=="ESN Linz"){
    return DRIVE_LINZ;
  }
  if(section=="ESN Kufstein"){
    return DRIVE_KUFSTEIN_DRIVE;
  }
  if(section=="ESN Steyr"){
    return DRIVE_STEYR_FOLDER;
  }
  if(section=="ESN Leoben"){
    return DRIVE_LEOBEN_FOLDER;
  }
}

function writeCertificate(tempfileId,student,section){
  var template = getTemplate(tempfileId);
  var body = template.getBody();
  
  body.replaceText("\\[first name\\]",student.firstname);
  body.replaceText("\\[last name\\]",student.lastname);
  body.replaceText("\\[section name\\]",section);
  
  template.setName("Certificate_" + student.firstname + "_" + student.lastname );
  template.saveAndClose();
  
  template = getTemplate(tempfileId);
  var pdf = template.getAs('application/pdf');
  template.setName(template.getName() + ".pdf");
  var folder = DriveApp.getFolderById(getSectionFolder(section)); 
  var pdffile = folder.createFile(pdf);
  template.saveAndClose();
  DriveApp.removeFile(template);
  
  return pdffile;
}

function createCertificate(student, section){
  var tempId = copyTemplate(section);
  var pdffile = writeCertificate(tempId,student, section);  
  
  return pdffile.getAs(MimeType.PDF);
}