
/**
 * Sistema de Emails
 */

// Enviar email (apenas admin)
function sendEmail(e, userRole) {
  if (userRole !== 'admin') {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Acesso negado: Apenas administradores podem enviar emails'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const data = JSON.parse(e.postData.contents);
    const { emailDestino, titulo, conteudo } = data;
    
    if (!emailDestino || !titulo || !conteudo) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Email destino, título e conteúdo são obrigatórios'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Enviar email
    GmailApp.sendEmail(emailDestino, titulo, conteudo);
    
    // Salvar na planilha
    const id = generateId();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const emailsSheet = ss.getSheetByName('Emails');
    
    emailsSheet.appendRow([
      id,
      emailDestino,
      titulo,
      conteudo,
      new Date()
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: { id: id, message: 'Email enviado com sucesso' }
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao enviar email: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Listar emails enviados (apenas admin)
function getEmails(e, userRole) {
  if (userRole !== 'admin') {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Acesso negado: Apenas administradores podem ver emails'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const emailsSheet = ss.getSheetByName('Emails');
    const data = emailsSheet.getDataRange().getValues();
    
    const emails = [];
    for (let i = 1; i < data.length; i++) {
      emails.push({
        id: data[i][0],
        emailDestino: data[i][1],
        titulo: data[i][2],
        conteudo: data[i][3],
        dataEnvio: data[i][4]
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: emails
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao buscar emails: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
