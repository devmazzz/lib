
/**
 * Sistema de Upload de Arquivos
 */

// Upload de imagem
function postImg(e, userRole) {
  if (userRole !== 'admin') {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Acesso negado: Apenas administradores podem fazer upload'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const data = JSON.parse(e.postData.contents);
    const { imageData, fileName, imageUrl } = data;
    
    let fileId;
    let fileUrl;
    
    if (imageUrl) {
      // Se é uma URL, salvar apenas a URL
      fileUrl = imageUrl;
      fileId = 'url_' + generateId();
    } else if (imageData && fileName) {
      // Se é upload de arquivo, salvar no Google Drive
      const blob = Utilities.newBlob(
        Utilities.base64Decode(imageData),
        'image/jpeg',
        fileName
      );
      
      const file = DriveApp.createFile(blob);
      fileId = file.getId();
      fileUrl = 'https://drive.google.com/file/d/' + fileId + '/view';
      
      // Tornar o arquivo público para visualização
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Dados da imagem ou URL são obrigatórios'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: {
        fileId: fileId,
        fileUrl: fileUrl,
        message: 'Imagem salva com sucesso'
      }
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao fazer upload da imagem: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Upload de vídeo/áudio
function postVideo(e, userRole) {
  if (userRole !== 'admin') {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Acesso negado: Apenas administradores podem fazer upload'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const data = JSON.parse(e.postData.contents);
    const { videoData, fileName, videoUrl, fileType } = data;
    
    let fileId;
    let fileUrl;
    
    if (videoUrl) {
      // Se é uma URL, salvar apenas a URL
      fileUrl = videoUrl;
      fileId = 'url_' + generateId();
    } else if (videoData && fileName) {
      // Se é upload de arquivo, salvar no Google Drive
      const mimeType = fileType === 'mp3' ? 'audio/mpeg' : 'video/mp4';
      
      const blob = Utilities.newBlob(
        Utilities.base64Decode(videoData),
        mimeType,
        fileName
      );
      
      const file = DriveApp.createFile(blob);
      fileId = file.getId();
      fileUrl = 'https://drive.google.com/file/d/' + fileId + '/view';
      
      // Tornar o arquivo público para visualização
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Dados do vídeo/áudio ou URL são obrigatórios'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: {
        fileId: fileId,
        fileUrl: fileUrl,
        message: 'Vídeo/áudio salvo com sucesso'
      }
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao fazer upload do vídeo/áudio: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Visualizar arquivo
function getViewFile(e, userRole) {
  try {
    const fileId = e.parameter.fileId;
    
    if (!fileId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'ID do arquivo é obrigatório'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Se é uma URL
    if (fileId.startsWith('url_')) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: {
          type: 'url',
          url: e.parameter.url
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Se é um arquivo do Google Drive
    try {
      const file = DriveApp.getFileById(fileId);
      const blob = file.getBlob();
      const base64Data = Utilities.base64Encode(blob.getBytes());
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: {
          type: 'file',
          fileName: file.getName(),
          mimeType: file.getBlob().getContentType(),
          base64Data: base64Data,
          downloadUrl: 'https://drive.google.com/file/d/' + fileId + '/view'
        }
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (driveError) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Arquivo não encontrado no Google Drive'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao visualizar arquivo: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
