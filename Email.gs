//constructs registration email and sends it --------------------------------------------------------------------------------------------------------------------------------------------------------//
/**
* Insert the given email body text into an email template, and send
* it to the indicated recipient. The template is a draft message with
* the subject "TEMPLATE"; if the template message is not found, an
* exception will be thrown. The template must contain text indicating
* where email content should be placed: {BODY}.
*
* @param {String} recipient  Email address to send message to.
* @param {String} subject    Subject line for email.
* @param {String} body       Email content, may be plain text or HTML.
* @param {Object} options    (optional) Options as supported by GmailApp.
*
* @returns        GmailApp   the Gmail service, useful for chaining
*/
function sendGmailTemplate(recipient, subject, mail_options, draftsubject) {
  mail_options = mail_options || {};  // default is no options
  
  if (!existsDraft(draftsubject)) throw new Error("TEMPLATE not found in drafts folder: " + draftsubject);
  var template = readDraft(draftsubject)
  
  // Generate htmlBody from template, with provided text body
  var imgUpdates = updateInlineImages(template);
  var message = imgUpdates.templateBody;
  mail_options.htmlBody = message;
  mail_options.inlineImages = imgUpdates.inlineImages;
  var body = message;
  return GmailApp.sendEmail(recipient, subject, body, mail_options);
}

/**
* check if hte given subject exists in the list of draft mails
* drafts = GmailApp.getDraftMessages();
* */
function existsDraft(subject) {
  drafts = getDraftMessages();
  for each(var draft in drafts) {
    if (draft.getSubject() == subject) {
      return true;
    }
  }
  return false;
}



function readDraft(draft_name) {
  drafts = getDraftMessages();
  for (var i = 0; i < drafts.length; ++i) {
    if (drafts[i].getSubject() == draft_name) {
      return drafts[i];
    }
  }
}
//fixes any attachments or pictures in email template --------------------------------------------------------------------------------------------------------------------------------------------------------//
/**
* @param   {GmailMessage} template  Message to use as template
* @returns {Object}                 An object containing the updated
*                                   templateBody, attachments and inlineImages.
*/
function updateInlineImages(template) {
  //////////////////////////////////////////////////////////////////////////////
  // Get inline images and make sure they stay as inline images
  //////////////////////////////////////////////////////////////////////////////
  var templateBody = template.getBody();
  var rawContent = template.getRawContent();
  var attachments = template.getAttachments();

  var regMessageId = new RegExp(template.getId(), "g");
  if (templateBody.match(regMessageId) != null) {
    var inlineImages = {};
    var nbrOfImg = templateBody.match(regMessageId).length;
    var imgVars = templateBody.match(/<img[^>]+>/g);
    var imgToReplace = [];
    if(imgVars != null){
      for (var i = 0; i < imgVars.length; i++) {
        if (imgVars[i].search(regMessageId) != -1) {
          var id = imgVars[i].match(/realattid=([^&]+)&/);
          if (id != null) {
            var temp = rawContent.split(id[1])[1];
            temp = temp.substr(temp.lastIndexOf('Content-Type'));
            var imgTitle = temp.match(/name="([^"]+)"/);
            if (imgTitle != null) imgToReplace.push([imgTitle[1], imgVars[i], id[1]]);
          }
        }
      }
    }
    for (var i = 0; i < imgToReplace.length; i++) {
      for (var j = 0; j < attachments.length; j++) {
        if(attachments[j].getName() == imgToReplace[i][0]) {
          inlineImages[imgToReplace[i][2]] = attachments[j].copyBlob();
          attachments.splice(j, 1);
          var newImg = imgToReplace[i][1].replace(/src="[^\"]+\"/, "src=\"cid:" + imgToReplace[i][2] + "\"");
          templateBody = templateBody.replace(imgToReplace[i][1], newImg);
        }
      }
    }
  }
  var updatedTemplate = {
    templateBody: templateBody,
    attachments: attachments,
    inlineImages: inlineImages
  }
  return updatedTemplate;
}

var _drafts = []; // Lazy load draft mails
function getDraftMessages() {
    if (_drafts.length == 0) {
        _drafts = GmailApp.getDraftMessages()
    }
    return _drafts;
}
