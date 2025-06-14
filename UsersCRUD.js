
/**
 * CRUD de Usuários
 */

// Criar usuário (apenas admin)
function createUser(e, userRole) {
  if (userRole !== 'admin') {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Acesso negado: Apenas administradores podem criar usuários'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const data = JSON.parse(e.postData.contents);
    const { role = 'anonimo', status = 'active' } = data;
    
    if (!['admin', 'anonimo'].includes(role)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Role deve ser "admin" ou "anonimo"'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const token = generateId();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName('Users');
    
    usersSheet.appendRow([
      token,
      role,
      new Date(),
      status
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: { token: token, role: role, message: 'Usuário criado com sucesso' }
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao criar usuário: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Atualizar usuário (apenas admin)
function updateUser(e, userRole) {
  if (userRole !== 'admin') {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Acesso negado: Apenas administradores podem atualizar usuários'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const data = JSON.parse(e.postData.contents);
    const { token, role, status } = data;
    
    if (!token) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Token do usuário é obrigatório'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName('Users');
    const dataRange = usersSheet.getDataRange().getValues();
    
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] === token) {
        if (role) usersSheet.getRange(i + 1, 2).setValue(role);
        if (status) usersSheet.getRange(i + 1, 4).setValue(status);
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Usuário atualizado com sucesso'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Usuário não encontrado'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao atualizar usuário: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Deletar usuário (apenas admin)
function deleteUser(e, userRole) {
  if (userRole !== 'admin') {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Acesso negado: Apenas administradores podem deletar usuários'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const data = JSON.parse(e.postData.contents);
    const { token } = data;
    
    if (!token) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Token do usuário é obrigatório'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Não permitir deletar o admin principal
    if (token === ADMIN_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Não é possível deletar o administrador principal'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName('Users');
    const dataRange = usersSheet.getDataRange().getValues();
    
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] === token) {
        usersSheet.deleteRow(i + 1);
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Usuário deletado com sucesso'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Usuário não encontrado'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao deletar usuário: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Listar usuários (apenas admin)
function getUsers(e, userRole) {
  if (userRole !== 'admin') {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Acesso negado: Apenas administradores podem ver usuários'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName('Users');
    const data = usersSheet.getDataRange().getValues();
    
    const users = [];
    for (let i = 1; i < data.length; i++) {
      users.push({
        token: data[i][0],
        role: data[i][1],
        created: data[i][2],
        status: data[i][3]
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: users
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao buscar usuários: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
