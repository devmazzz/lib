
# Documentação da Biblioteca CrudAPI

Uma biblioteca JavaScript nativa para simplificar o uso da API do Sistema CRUD Google Apps Script.

## 🚀 Instalação e Configuração

### 1. Incluir a Biblioteca

```html
<!-- No HTML -->
<script src="crud-api-lib.js"></script>
<script src="crud-examples.js"></script>
```

### 2. Configurar e Inicializar

```javascript
// Configuração
const API_URL = 'https://script.google.com/macros/s/SEU_DEPLOYMENT_ID/exec';
const TOKEN = 'seu_token_aqui';

// Criar instância
const api = new CrudAPI(API_URL, TOKEN);

// Ou usar função helper
const api = createCrudAPI(API_URL, TOKEN);
```

## 📚 Módulos Disponíveis

### Posts (`api.posts`)
- `list()` - Listar posts
- `get(id)` - Buscar post específico
- `create(data)` - Criar post
- `update(id, data)` - Atualizar post
- `delete(id)` - Deletar post
- `getPublished()` - Posts publicados
- `getByCategory(categoria)` - Posts por categoria
- `togglePublish(id, status)` - Publicar/despublicar

### Usuários (`api.users`)
- `list()` - Listar usuários
- `create(data)` - Criar usuário
- `update(token, data)` - Atualizar usuário
- `delete(token)` - Deletar usuário
- `toggleStatus(token, status)` - Ativar/desativar
- `changeRole(token, role)` - Alterar role

### Emails (`api.emails`)
- `list()` - Listar emails enviados
- `send(email, titulo, conteudo)` - Enviar email
- `sendObject(data)` - Enviar via objeto
- `sendBulk(emails, titulo, conteudo)` - Envio em massa

### Arquivos (`api.files`)
- `uploadImage(file)` - Upload de imagem
- `uploadVideo(file, fileName, type)` - Upload de vídeo
- `view(fileId)` - Visualizar arquivo
- `uploadMultipleImages(files)` - Upload múltiplo

## 🔧 Exemplos de Uso

### Posts

```javascript
// Criar post
const post = await api.posts.create({
  titulo: 'Meu Post',
  conteudo: 'Conteúdo...',
  categoria: 'tecnologia',
  publicado: true
});

// Listar posts publicados
const posts = await api.posts.getPublished();

// Atualizar post
await api.posts.update(post.id, {
  titulo: 'Novo Título'
});
```

### Upload de Arquivos

```javascript
// Upload por arquivo
const input = document.getElementById('fileInput');
input.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const result = await api.files.uploadImage(file);
  console.log('Upload:', result.fileUrl);
});

// Upload por URL
const result = await api.files.uploadImage('https://exemplo.com/imagem.jpg');
```

### Emails

```javascript
// Enviar email simples
await api.emails.send(
  'usuario@email.com',
  'Assunto',
  'Mensagem'
);

// Envio em massa
const resultados = await api.emails.sendBulk(
  ['email1@test.com', 'email2@test.com'],
  'Assunto',
  'Mensagem'
);
```

## 🛡️ Tratamento de Erros

```javascript
try {
  const posts = await api.posts.list();
  console.log('Posts:', posts);
} catch (error) {
  console.error('Erro:', error.message);
}
```

## 🧪 Testes

```javascript
// Testar se a API está funcionando
const status = await api.test();
if (status.success) {
  console.log('API OK');
} else {
  console.error('Erro na API:', status.message);
}
```

## 🎯 Casos de Uso Avançados

### Blog Manager

```javascript
class BlogManager {
  constructor(apiInstance) {
    this.api = apiInstance;
  }

  async criarPostCompleto(dados, imagemCapa) {
    // Upload da imagem
    let anexo = null;
    if (imagemCapa) {
      const upload = await this.api.files.uploadImage(imagemCapa);
      anexo = upload.fileUrl;
    }

    // Criar post
    return await this.api.posts.create({
      ...dados,
      anexo,
      data: new Date()
    });
  }

  async buscarPostsRecentes(limite = 10) {
    const posts = await this.api.posts.getPublished();
    return posts
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, limite);
  }
}

const blog = new BlogManager(api);
```

## 📋 Referência Completa

### Estrutura de Dados

#### Post
```javascript
{
  id: "uuid",
  titulo: "Título",
  descricao: "Descrição", 
  url: "https://exemplo.com",
  resumo: "Resumo",
  conteudo: "Conteúdo completo",
  anexo: "url_do_anexo",
  tipo: "artigo",
  categoria: "tecnologia",
  excerpt: "Trecho",
  publicado: true,
  data: "2024-01-01",
  estado: "publicado"
}
```

#### Usuário
```javascript
{
  token: "user_abc123",
  role: "anonimo", // ou "admin"
  created: "2024-01-01",
  status: "active" // ou "inactive"
}
```

### Métodos de Validação

```javascript
// Campos obrigatórios são validados automaticamente
// Roles são validadas (apenas "admin" ou "anonimo")
// Emails são validados no envio
// Arquivos são validados no upload
```

## 🔍 Debugging

```javascript
// Ativar logs detalhados
api.debug = true;

// Ver requisições
console.log('URL:', api.baseUrl);
console.log('Token:', api.token);
```

## ⚡ Performance

- Requisições assíncronas
- Validação local antes do envio
- Cache automático quando possível
- Tratamento de erros robusto

## 🎨 Personalização

```javascript
// Extender a API
class MinhaAPI extends CrudAPI {
  async buscarMeusDados() {
    return await this.get('meuEndpoint');
  }
}

const minhaApi = new MinhaAPI(API_URL, TOKEN);
```
