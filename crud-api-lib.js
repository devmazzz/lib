
/**
 * Biblioteca para Sistema CRUD Google Apps Script
 * Versão: 1.0
 * Autor: Sistema Automatizado
 * 
 * Uso:
 * const api = new CrudAPI('https://script.google.com/macros/s/SEU_DEPLOYMENT_ID/exec', 'seu_token');
 * 
 * // Listar posts
 * const posts = await api.posts.list();
 * 
 * // Criar post
 * const novoPost = await api.posts.create({
 *   titulo: 'Meu Post',
 *   conteudo: 'Conteúdo do post'
 * });
 */

class CrudAPI {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
    
    // Inicializar módulos
    this.posts = new PostsModule(this);
    this.users = new UsersModule(this);
    this.emails = new EmailsModule(this);
    this.files = new FilesModule(this);
  }

  /**
   * Fazer requisição GET
   */
  async get(action, params = {}) {
    const url = new URL(this.baseUrl);
    url.searchParams.append('action', action);
    url.searchParams.append('token', this.token);
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    try {
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erro na requisição');
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro na requisição GET:', error);
      throw error;
    }
  }

  /**
   * Fazer requisição POST
   */
  async post(action, data = {}) {
    const payload = {
      action,
      token: this.token,
      ...data
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro na requisição');
      }
      
      return result.data || result;
    } catch (error) {
      console.error('Erro na requisição POST:', error);
      throw error;
    }
  }

  /**
   * Validar se a API está funcionando
   */
  async test() {
    try {
      await this.posts.list();
      return { success: true, message: 'API funcionando corretamente' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

/**
 * Módulo de Posts
 */
class PostsModule {
  constructor(api) {
    this.api = api;
  }

  /**
   * Listar todos os posts
   */
  async list() {
    return await this.api.get('getPosts');
  }

  /**
   * Buscar post específico por ID
   */
  async get(id) {
    return await this.api.get('getPost', { id });
  }

  /**
   * Criar novo post (apenas admin)
   */
  async create(data) {
    const requiredFields = ['titulo'];
    this._validateRequired(data, requiredFields);
    
    return await this.api.post('createPost', data);
  }

  /**
   * Atualizar post existente (apenas admin)
   */
  async update(id, data) {
    if (!id) throw new Error('ID do post é obrigatório');
    
    return await this.api.post('updatePost', { id, ...data });
  }

  /**
   * Deletar post (apenas admin)
   */
  async delete(id) {
    if (!id) throw new Error('ID do post é obrigatório');
    
    return await this.api.post('deletePost', { id });
  }

  /**
   * Buscar posts por categoria
   */
  async getByCategory(categoria) {
    const posts = await this.list();
    return posts.filter(post => post.categoria === categoria);
  }

  /**
   * Buscar posts publicados apenas
   */
  async getPublished() {
    const posts = await this.list();
    return posts.filter(post => post.publicado === true);
  }

  /**
   * Publicar/despublicar post
   */
  async togglePublish(id, publicado = true) {
    return await this.update(id, { publicado });
  }

  _validateRequired(data, required) {
    const missing = required.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Campos obrigatórios: ${missing.join(', ')}`);
    }
  }
}

/**
 * Módulo de Usuários
 */
class UsersModule {
  constructor(api) {
    this.api = api;
  }

  /**
   * Listar usuários (apenas admin)
   */
  async list() {
    return await this.api.get('getUsers');
  }

  /**
   * Criar novo usuário (apenas admin)
   */
  async create(data = {}) {
    const userData = {
      role: 'anonimo',
      status: 'active',
      ...data
    };
    
    return await this.api.post('createUser', userData);
  }

  /**
   * Atualizar usuário (apenas admin)
   */
  async update(token, data) {
    if (!token) throw new Error('Token do usuário é obrigatório');
    
    return await this.api.post('updateUser', { token, ...data });
  }

  /**
   * Deletar usuário (apenas admin)
   */
  async delete(token) {
    if (!token) throw new Error('Token do usuário é obrigatório');
    
    return await this.api.post('deleteUser', { token });
  }

  /**
   * Ativar/desativar usuário
   */
  async toggleStatus(token, status = 'active') {
    return await this.update(token, { status });
  }

  /**
   * Alterar role do usuário
   */
  async changeRole(token, role) {
    if (!['admin', 'anonimo'].includes(role)) {
      throw new Error('Role deve ser "admin" ou "anonimo"');
    }
    
    return await this.update(token, { role });
  }
}

/**
 * Módulo de Emails
 */
class EmailsModule {
  constructor(api) {
    this.api = api;
  }

  /**
   * Listar emails enviados (apenas admin)
   */
  async list() {
    return await this.api.get('getEmails');
  }

  /**
   * Enviar email (apenas admin)
   */
  async send(emailDestino, titulo, conteudo) {
    if (!emailDestino || !titulo || !conteudo) {
      throw new Error('Email destino, título e conteúdo são obrigatórios');
    }
    
    return await this.api.post('sendEmail', {
      emailDestino,
      titulo,
      conteudo
    });
  }

  /**
   * Enviar email usando objeto
   */
  async sendObject(emailData) {
    const { emailDestino, titulo, conteudo } = emailData;
    return await this.send(emailDestino, titulo, conteudo);
  }

  /**
   * Enviar email para múltiplos destinatários
   */
  async sendBulk(emails, titulo, conteudo) {
    const results = [];
    
    for (const email of emails) {
      try {
        const result = await this.send(email, titulo, conteudo);
        results.push({ email, success: true, result });
      } catch (error) {
        results.push({ email, success: false, error: error.message });
      }
    }
    
    return results;
  }
}

/**
 * Módulo de Arquivos
 */
class FilesModule {
  constructor(api) {
    this.api = api;
  }

  /**
   * Upload de imagem (apenas admin)
   */
  async uploadImage(file, fileName = null) {
    return new Promise((resolve, reject) => {
      if (typeof file === 'string') {
        // Se é uma URL
        this.api.post('postImg', { imageUrl: file })
          .then(resolve)
          .catch(reject);
        return;
      }

      // Se é um arquivo
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = e.target.result.split(',')[1];
          const result = await this.api.post('postImg', {
            imageData: base64Data,
            fileName: fileName || file.name
          });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload de vídeo/áudio (apenas admin)
   */
  async uploadVideo(file, fileName = null, fileType = 'mp4') {
    return new Promise((resolve, reject) => {
      if (typeof file === 'string') {
        // Se é uma URL
        this.api.post('postVideo', { videoUrl: file, fileType })
          .then(resolve)
          .catch(reject);
        return;
      }

      // Se é um arquivo
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = e.target.result.split(',')[1];
          const result = await this.api.post('postVideo', {
            videoData: base64Data,
            fileName: fileName || file.name,
            fileType
          });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Visualizar arquivo
   */
  async view(fileId, url = null) {
    return await this.api.get('getViewFile', { fileId, url });
  }

  /**
   * Upload múltiplas imagens
   */
  async uploadMultipleImages(files) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadImage(file);
        results.push({ file: file.name, success: true, result });
      } catch (error) {
        results.push({ file: file.name, success: false, error: error.message });
      }
    }
    
    return results;
  }
}

/**
 * Função helper para criar instância da API
 */
function createCrudAPI(baseUrl, token) {
  return new CrudAPI(baseUrl, token);
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CrudAPI, createCrudAPI };
}

// Disponibilizar globalmente no browser
if (typeof window !== 'undefined') {
  window.CrudAPI = CrudAPI;
  window.createCrudAPI = createCrudAPI;
}
