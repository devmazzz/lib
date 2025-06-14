
/**
 * CRUD de Posts
 */

// Listar posts (todos podem ler)
function getPosts(e, userRole) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const postsSheet = ss.getSheetByName('Posts');
    const data = postsSheet.getDataRange().getValues();
    
    const posts = [];
    for (let i = 1; i < data.length; i++) {
      // Se usuário anônimo, só mostrar posts publicados
      if (userRole === 'anonimo' && data[i][10] !== true) continue;
      
      posts.push({
        id: data[i][0],
        titulo: data[i][1],
        descricao: data[i][2],
        url: data[i][3],
        resumo: data[i][4],
        conteudo: data[i][5],
        anexo: data[i][6],
        tipo: data[i][7],
        categoria: data[i][8],
        excerpt: data[i][9],
        publicado: data[i][10],
        data: data[i][11],
        estado: data[i][12]
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: posts
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao buscar posts: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Buscar post específico
function getPost(e, userRole) {
  try {
    const id = e.parameter.id;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const postsSheet = ss.getSheetByName('Posts');
    const data = postsSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        // Se usuário anônimo, só mostrar se publicado
        if (userRole === 'anonimo' && data[i][10] !== true) {
          return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: 'Post não encontrado ou não publicado'
          })).setMimeType(ContentService.MimeType.JSON);
        }
        
        const post = {
          id: data[i][0],
          titulo: data[i][1],
          descricao: data[i][2],
          url: data[i][3],
          resumo: data[i][4],
          conteudo: data[i][5],
          anexo: data[i][6],
          tipo: data[i][7],
          categoria: data[i][8],
          excerpt: data[i][9],
          publicado: data[i][10],
          data: data[i][11],
          estado: data[i][12]
        };
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          data: post
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Post não encontrado'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao buscar post: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Criar post (apenas admin)
function createPost(e, userRole) {
  if (userRole !== 'admin') {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Acesso negado: Apenas administradores podem criar posts'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const data = JSON.parse(e.postData.contents);
    const {
      titulo,
      descricao,
      url,
      resumo,
      conteudo,
      anexo,
      tipo,
      categoria,
      excerpt,
      publicado = false,
      estado = 'rascunho'
    } = data;
    
    const id = generateId();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const postsSheet = ss.getSheetByName('Posts');
    
    postsSheet.appendRow([
      id,
      titulo,
      descricao,
      url,
      resumo,
      conteudo,
      anexo,
      tipo,
      categoria,
      excerpt,
      publicado,
      new Date(),
      estado
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: { id: id, message: 'Post criado com sucesso' }
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao criar post: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Atualizar post (apenas admin)
function updatePost(e, userRole) {
  if (userRole !== 'admin') {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Acesso negado: Apenas administradores podem atualizar posts'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const data = JSON.parse(e.postData.contents);
    const { id } = data;
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const postsSheet = ss.getSheetByName('Posts');
    const dataRange = postsSheet.getDataRange().getValues();
    
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] === id) {
        if (data.titulo) postsSheet.getRange(i + 1, 2).setValue(data.titulo);
        if (data.descricao) postsSheet.getRange(i + 1, 3).setValue(data.descricao);
        if (data.url) postsSheet.getRange(i + 1, 4).setValue(data.url);
        if (data.resumo) postsSheet.getRange(i + 1, 5).setValue(data.resumo);
        if (data.conteudo) postsSheet.getRange(i + 1, 6).setValue(data.conteudo);
        if (data.anexo) postsSheet.getRange(i + 1, 7).setValue(data.anexo);
        if (data.tipo) postsSheet.getRange(i + 1, 8).setValue(data.tipo);
        if (data.categoria) postsSheet.getRange(i + 1, 9).setValue(data.categoria);
        if (data.excerpt) postsSheet.getRange(i + 1, 10).setValue(data.excerpt);
        if (data.hasOwnProperty('publicado')) postsSheet.getRange(i + 1, 11).setValue(data.publicado);
        if (data.estado) postsSheet.getRange(i + 1, 13).setValue(data.estado);
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Post atualizado com sucesso'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Post não encontrado'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao atualizar post: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Deletar post (apenas admin)
function deletePost(e, userRole) {
  if (userRole !== 'admin') {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Acesso negado: Apenas administradores podem deletar posts'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const data = JSON.parse(e.postData.contents);
    const { id } = data;
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const postsSheet = ss.getSheetByName('Posts');
    const dataRange = postsSheet.getDataRange().getValues();
    
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] === id) {
        postsSheet.deleteRow(i + 1);
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Post deletado com sucesso'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Post não encontrado'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao deletar post: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
