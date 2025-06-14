
/**
 * Sistema CRUD completo para Google Apps Script
 * Autor: Sistema Automatizado
 * Versão: 1.0
 */

// Configurações globais
const SPREADSHEET_ID = 'SEU_SPREADSHEET_ID_AQUI'; // Substitua pelo ID da sua planilha
const ADMIN_TOKEN = 'admin_token_123456'; // Token do administrador

// Função principal para configurar o sistema
function setupSystem() {
  createSheetsIfNotExists();
  Logger.log('Sistema configurado com sucesso!');
}

// Criar planilhas se não existirem
function createSheetsIfNotExists() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Criar aba Users se não existir
  if (!ss.getSheetByName('Users')) {
    const usersSheet = ss.insertSheet('Users');
    usersSheet.getRange(1, 1, 1, 4).setValues([['Token', 'Role', 'Created', 'Status']]);
    
    // Adicionar usuário admin padrão
    usersSheet.getRange(2, 1, 1, 4).setValues([[ADMIN_TOKEN, 'admin', new Date(), 'active']]);
  }
  
  // Criar aba Posts se não existir
  if (!ss.getSheetByName('Posts')) {
    const postsSheet = ss.insertSheet('Posts');
    postsSheet.getRange(1, 1, 1, 12).setValues([
      ['ID', 'Titulo', 'Descricao', 'URL', 'Resumo', 'Conteudo', 'Anexo', 'Tipo', 'Categoria', 'Excerpt', 'Publicado', 'Data', 'Estado']
    ]);
  }
  
  // Criar aba Emails se não existir
  if (!ss.getSheetByName('Emails')) {
    const emailsSheet = ss.insertSheet('Emails');
    emailsSheet.getRange(1, 1, 1, 5).setValues([['ID', 'Email_Destino', 'Titulo', 'Conteudo', 'Data_Envio']]);
  }
}

// Função para validar token e permissões
function validateToken(token, requiredRole = null) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usersSheet = ss.getSheetByName('Users');
  const data = usersSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === token && data[i][3] === 'active') {
      const userRole = data[i][1];
      
      if (requiredRole) {
        if (requiredRole === 'admin' && userRole !== 'admin') {
          return { valid: false, message: 'Acesso negado: Apenas administradores' };
        }
      }
      
      return { valid: true, role: userRole };
    }
  }
  
  return { valid: false, message: 'Token inválido ou usuário inativo' };
}

// Gerar ID único
function generateId() {
  return Utilities.getUuid();
}

// Endpoint principal para requisições
function doGet(e) {
  const action = e.parameter.action;
  const token = e.parameter.token;
  
  if (!token) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Token obrigatório'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const validation = validateToken(token);
  if (!validation.valid) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: validation.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  switch (action) {
    case 'getPosts':
      return getPosts(e, validation.role);
    case 'getPost':
      return getPost(e, validation.role);
    case 'getEmails':
      return getEmails(e, validation.role);
    case 'getViewFile':
      return getViewFile(e, validation.role);
    default:
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Ação não encontrada'
      })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  let action, token;
  
  // Tentar obter dados do body primeiro, depois dos parâmetros
  try {
    if (e.postData && e.postData.contents) {
      const bodyData = JSON.parse(e.postData.contents);
      action = bodyData.action || e.parameter.action;
      token = bodyData.token || e.parameter.token;
    } else {
      action = e.parameter.action;
      token = e.parameter.token;
    }
  } catch (error) {
    action = e.parameter.action;
    token = e.parameter.token;
  }
  
  if (!token) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Token obrigatório'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const validation = validateToken(token);
  if (!validation.valid) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: validation.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  switch (action) {
    case 'createPost':
      return createPost(e, validation.role);
    case 'updatePost':
      return updatePost(e, validation.role);
    case 'deletePost':
      return deletePost(e, validation.role);
    case 'createUser':
      return createUser(e, validation.role);
    case 'updateUser':
      return updateUser(e, validation.role);
    case 'deleteUser':
      return deleteUser(e, validation.role);
    case 'sendEmail':
      return sendEmail(e, validation.role);
    case 'postImg':
      return postImg(e, validation.role);
    case 'postVideo':
      return postVideo(e, validation.role);
    default:
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Ação não encontrada'
      })).setMimeType(ContentService.MimeType.JSON);
  }
}
