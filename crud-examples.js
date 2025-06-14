
/**
 * Exemplos de uso da biblioteca CrudAPI
 * 
 * Este arquivo contém exemplos práticos de como usar a biblioteca
 * para interagir com o Sistema CRUD Google Apps Script
 */

// =====================================
// 1. CONFIGURAÇÃO INICIAL
// =====================================

// Configurar a API
const API_URL = 'https://script.google.com/macros/s/SEU_DEPLOYMENT_ID/exec';
const ADMIN_TOKEN = 'admin_token_123456';

// Criar instância da API
const api = new CrudAPI(API_URL, ADMIN_TOKEN);

// Ou usando a função helper
// const api = createCrudAPI(API_URL, ADMIN_TOKEN);

// =====================================
// 2. EXEMPLOS DE POSTS
// =====================================

async function exemplosPosts() {
  try {
    console.log('=== EXEMPLOS DE POSTS ===');

    // Listar todos os posts
    const posts = await api.posts.list();
    console.log('Posts encontrados:', posts.length);

    // Criar novo post
    const novoPost = await api.posts.create({
      titulo: 'Meu Primeiro Post',
      descricao: 'Descrição do post',
      conteudo: 'Conteúdo completo do post...',
      categoria: 'tecnologia',
      tipo: 'artigo',
      publicado: true
    });
    console.log('Post criado:', novoPost);

    // Buscar post específico
    const post = await api.posts.get(novoPost.id);
    console.log('Post encontrado:', post);

    // Atualizar post
    await api.posts.update(novoPost.id, {
      titulo: 'Título Atualizado',
      conteudo: 'Conteúdo atualizado...'
    });
    console.log('Post atualizado');

    // Buscar posts publicados apenas
    const postsPublicados = await api.posts.getPublished();
    console.log('Posts publicados:', postsPublicados.length);

    // Buscar posts por categoria
    const postsTecnologia = await api.posts.getByCategory('tecnologia');
    console.log('Posts de tecnologia:', postsTecnologia.length);

    // Publicar/despublicar post
    await api.posts.togglePublish(novoPost.id, false);
    console.log('Post despublicado');

  } catch (error) {
    console.error('Erro nos exemplos de posts:', error);
  }
}

// =====================================
// 3. EXEMPLOS DE USUÁRIOS
// =====================================

async function exemplosUsuarios() {
  try {
    console.log('=== EXEMPLOS DE USUÁRIOS ===');

    // Listar usuários
    const usuarios = await api.users.list();
    console.log('Usuários encontrados:', usuarios.length);

    // Criar novo usuário
    const novoUsuario = await api.users.create({
      role: 'anonimo'
    });
    console.log('Usuário criado:', novoUsuario);

    // Atualizar usuário
    await api.users.update(novoUsuario.token, {
      status: 'inactive'
    });
    console.log('Usuário atualizado');

    // Alterar role do usuário
    await api.users.changeRole(novoUsuario.token, 'admin');
    console.log('Role alterada para admin');

    // Ativar/desativar usuário
    await api.users.toggleStatus(novoUsuario.token, 'active');
    console.log('Usuário ativado');

  } catch (error) {
    console.error('Erro nos exemplos de usuários:', error);
  }
}

// =====================================
// 4. EXEMPLOS DE EMAILS
// =====================================

async function exemplosEmails() {
  try {
    console.log('=== EXEMPLOS DE EMAILS ===');

    // Enviar email simples
    await api.emails.send(
      'usuario@email.com',
      'Assunto do Email',
      'Conteúdo do email...'
    );
    console.log('Email enviado');

    // Enviar email usando objeto
    await api.emails.sendObject({
      emailDestino: 'outro@email.com',
      titulo: 'Outro Assunto',
      conteudo: 'Outro conteúdo...'
    });
    console.log('Email enviado via objeto');

    // Enviar para múltiplos destinatários
    const resultados = await api.emails.sendBulk(
      ['email1@test.com', 'email2@test.com'],
      'Email em Massa',
      'Conteúdo para todos...'
    );
    console.log('Resultados do envio em massa:', resultados);

    // Listar emails enviados
    const emails = await api.emails.list();
    console.log('Emails enviados:', emails.length);

  } catch (error) {
    console.error('Erro nos exemplos de emails:', error);
  }
}

// =====================================
// 5. EXEMPLOS DE UPLOAD DE ARQUIVOS
// =====================================

async function exemplosArquivos() {
  try {
    console.log('=== EXEMPLOS DE ARQUIVOS ===');

    // Upload de imagem por URL
    const imagemUrl = await api.files.uploadImage('https://exemplo.com/imagem.jpg');
    console.log('Imagem via URL:', imagemUrl);

    // Upload de vídeo por URL
    const videoUrl = await api.files.uploadVideo('https://exemplo.com/video.mp4');
    console.log('Vídeo via URL:', videoUrl);

  } catch (error) {
    console.error('Erro nos exemplos de arquivos:', error);
  }
}

// =====================================
// 6. EXEMPLO DE USO COM INPUT DE ARQUIVO
// =====================================

function configurarUploadArquivos() {
  // HTML: <input type="file" id="uploadImagem" accept="image/*">
  const inputImagem = document.getElementById('uploadImagem');
  
  if (inputImagem) {
    inputImagem.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          console.log('Fazendo upload da imagem...');
          const resultado = await api.files.uploadImage(file);
          console.log('Upload concluído:', resultado);
        } catch (error) {
          console.error('Erro no upload:', error);
        }
      }
    });
  }
}

// =====================================
// 7. EXEMPLO DE BLOG COMPLETO
// =====================================

class BlogManager {
  constructor(apiInstance) {
    this.api = apiInstance;
  }

  async criarPostCompleto(dados, imagemCapa = null) {
    try {
      let anexo = null;

      // Upload da imagem de capa se fornecida
      if (imagemCapa) {
        const uploadResult = await this.api.files.uploadImage(imagemCapa);
        anexo = uploadResult.fileUrl;
      }

      // Criar o post
      const post = await this.api.posts.create({
        ...dados,
        anexo,
        data: new Date(),
        estado: 'publicado'
      });

      return post;
    } catch (error) {
      console.error('Erro ao criar post completo:', error);
      throw error;
    }
  }

  async buscarPostsRecentes(limite = 10) {
    const posts = await this.api.posts.getPublished();
    return posts
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, limite);
  }

  async buscarPostsPorCategoria(categoria) {
    return await this.api.posts.getByCategory(categoria);
  }
}

// =====================================
// 8. FUNCÕES DE TESTE E VALIDAÇÃO
// =====================================

async function testarAPI() {
  console.log('=== TESTANDO API ===');
  
  const resultado = await api.test();
  
  if (resultado.success) {
    console.log('✅ API funcionando corretamente');
  } else {
    console.error('❌ Erro na API:', resultado.message);
  }
  
  return resultado;
}

async function exemploCompleto() {
  try {
    // Testar API
    await testarAPI();
    
    // Executar exemplos
    await exemplosPosts();
    await exemplosUsuarios();
    await exemplosEmails();
    await exemplosArquivos();
    
    console.log('✅ Todos os exemplos executados com sucesso');
  } catch (error) {
    console.error('❌ Erro nos exemplos:', error);
  }
}

// =====================================
// 9. UTILITÁRIOS
// =====================================

// Formatar data para exibição
function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR');
}

// Validar email
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Truncar texto
function truncarTexto(texto, limite = 150) {
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite) + '...';
}

// Exportar exemplos se usando módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    exemplosPosts,
    exemplosUsuarios,
    exemplosEmails,
    exemplosArquivos,
    BlogManager,
    testarAPI,
    exemploCompleto
  };
}

console.log('📚 Exemplos de uso da CrudAPI carregados');
console.log('💡 Execute exemploCompleto() para testar todas as funcionalidades');
