
# Sistema CRUD Google Apps Script

Um sistema completo de CRUD (Create, Read, Update, Delete) desenvolvido para Google Apps Script que permite gerenciar posts, usuários e emails através de uma API REST simples.

## 🚀 Características

- **CRUD completo** para Posts, Usuários e Emails
- **Sistema de permissões** baseado em tokens
- **Upload de arquivos** (imagens, vídeos, áudios)
- **Integração com Google Sheets** como banco de dados
- **API REST** pronta para uso
- **Controle de acesso** por roles (admin/anônimo)

## 📋 Pré-requisitos

- Conta Google
- Google Sheets
- Google Apps Script
- Conhecimento básico de JavaScript/REST APIs

## 🛠️ Instalação

### 1. Criar Google Spreadsheet

1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie uma nova planilha
3. Copie o ID da planilha da URL (parte entre `/d/` e `/edit`)
4. Anote este ID para usar na configuração

### 2. Configurar Google Apps Script

1. Acesse [Google Apps Script](https://script.google.com)
2. Crie um novo projeto
3. Copie os seguintes arquivos para o editor:
   - `Code.gs`
   - `UsersCRUD.gs`
   - `PostsCRUD.gs`
   - `EmailCRUD.gs`
   - `FileUpload.gs`

### 3. Configurar o Sistema

1. Abra `Code.gs` no Google Apps Script
2. Substitua `SEU_SPREADSHEET_ID_AQUI` pelo ID da sua planilha
3. Execute a função `setupSystem()` para criar as planilhas necessárias
4. Autorize as permissões quando solicitado

### 4. Deploy da API

1. No Google Apps Script, clique em **"Deploy"** > **"New deployment"**
2. Escolha tipo: **"Web app"**
3. Configure:
   - Execute como: **"Me"**
   - Quem tem acesso: **"Anyone"**
4. Clique em **"Deploy"**
5. Copie a URL do web app gerada

## 🔐 Sistema de Autenticação

### Tipos de Usuário

| Role | Token Padrão | Permissões |
|------|--------------|------------|
| **Admin** | `admin_token_123456` | Todas as operações (CRUD completo) |
| **Anônimo** | Token gerado | Apenas leitura de posts publicados |

### Autenticação

Todas as requisições devem incluir o parâmetro `token`:

```javascript
// GET
https://sua-url.com/exec?action=getPosts&token=seu_token

// POST - via body
{
  "action": "createPost",
  "token": "seu_token",
  "titulo": "Meu Post"
}
```

## 📚 API Reference

### Base URL
```
https://script.google.com/macros/s/[SEU_DEPLOYMENT_ID]/exec
```

### Posts

#### Listar Posts
```http
GET /exec?action=getPosts&token=SEU_TOKEN
```

#### Buscar Post
```http
GET /exec?action=getPost&id=POST_ID&token=SEU_TOKEN
```

#### Criar Post (Admin)
```http
POST /exec
Content-Type: application/json

{
  "action": "createPost",
  "token": "ADMIN_TOKEN",
  "titulo": "Título do Post",
  "descricao": "Descrição",
  "conteudo": "Conteúdo completo",
  "publicado": true
}
```

#### Atualizar Post (Admin)
```http
POST /exec
Content-Type: application/json

{
  "action": "updatePost",
  "token": "ADMIN_TOKEN",
  "id": "POST_ID",
  "titulo": "Novo Título"
}
```

#### Deletar Post (Admin)
```http
POST /exec
Content-Type: application/json

{
  "action": "deletePost",
  "token": "ADMIN_TOKEN",
  "id": "POST_ID"
}
```

### Usuários

#### Listar Usuários (Admin)
```http
GET /exec?action=getUsers&token=ADMIN_TOKEN
```

#### Criar Usuário (Admin)
```http
POST /exec
Content-Type: application/json

{
  "action": "createUser",
  "token": "ADMIN_TOKEN",
  "role": "anonimo"
}
```

### Emails

#### Enviar Email (Admin)
```http
POST /exec
Content-Type: application/json

{
  "action": "sendEmail",
  "token": "ADMIN_TOKEN",
  "emailDestino": "usuario@email.com",
  "titulo": "Assunto",
  "conteudo": "Mensagem"
}
```

#### Listar Emails (Admin)
```http
GET /exec?action=getEmails&token=ADMIN_TOKEN
```

### Upload de Arquivos

#### Upload de Imagem (Admin)
```http
POST /exec
Content-Type: application/json

{
  "action": "postImg",
  "token": "ADMIN_TOKEN",
  "imageData": "base64_encoded_image",
  "fileName": "imagem.jpg"
}
```

#### Upload por URL
```http
POST /exec
Content-Type: application/json

{
  "action": "postImg",
  "token": "ADMIN_TOKEN",
  "imageUrl": "https://exemplo.com/imagem.jpg"
}
```

## 💻 Exemplos de Uso

### JavaScript/Frontend

```javascript
const API_BASE = 'https://script.google.com/macros/s/SEU_DEPLOYMENT_ID/exec';
const ADMIN_TOKEN = 'admin_token_123456';

// Listar posts
async function listarPosts() {
  const response = await fetch(`${API_BASE}?action=getPosts&token=${ADMIN_TOKEN}`);
  return await response.json();
}

// Criar post
async function criarPost(dadosPost) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'createPost',
      token: ADMIN_TOKEN,
      ...dadosPost
    })
  });
  
  return await response.json();
}

// Upload de imagem
async function uploadImagem(arquivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function(e) {
      const base64Data = e.target.result.split(',')[1];
      
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'postImg',
          token: ADMIN_TOKEN,
          imageData: base64Data,
          fileName: arquivo.name
        })
      });
      
      resolve(await response.json());
    };
    reader.readAsDataURL(arquivo);
  });
}
```

### cURL

```bash
# Listar posts
curl "https://script.google.com/macros/s/SEU_DEPLOYMENT_ID/exec?action=getPosts&token=admin_token_123456"

# Criar post
curl -X POST "https://script.google.com/macros/s/SEU_DEPLOYMENT_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "createPost",
    "token": "admin_token_123456",
    "titulo": "Meu Post",
    "descricao": "Descrição do post",
    "conteudo": "Conteúdo completo",
    "publicado": true
  }'
```

## 📊 Estrutura dos Dados

### Posts
```json
{
  "id": "uuid",
  "titulo": "Título do Post",
  "descricao": "Descrição",
  "url": "https://exemplo.com",
  "resumo": "Resumo",
  "conteudo": "Conteúdo completo",
  "anexo": "url_do_anexo",
  "tipo": "artigo",
  "categoria": "tecnologia",
  "excerpt": "Trecho",
  "publicado": true,
  "data": "2024-01-01",
  "estado": "publicado"
}
```

### Usuários
```json
{
  "token": "user_abc123",
  "role": "anonimo",
  "created": "2024-01-01",
  "status": "active"
}
```

### Emails
```json
{
  "id": "uuid",
  "emailDestino": "usuario@email.com",
  "titulo": "Assunto",
  "conteudo": "Mensagem",
  "dataEnvio": "2024-01-01"
}
```

## 🔧 Troubleshooting

### Problemas Comuns

| Erro | Solução |
|------|---------|
| "Token obrigatório" | Inclua o parâmetro `token` na requisição |
| "Acesso negado" | Verifique se está usando o token correto para a operação |
| "Planilha não encontrada" | Execute `setupSystem()` e verifique o SPREADSHEET_ID |
| "Erro ao fazer upload" | Certifique-se de que o arquivo está em base64 |

### Limitações

- **Tamanho máximo de arquivo**: 50MB
- **Rate limit**: 100 requisições por 100 segundos
- **Tempo máximo de execução**: 6 minutos por requisição

## 🛡️ Segurança

- ✅ Tokens únicos gerados automaticamente
- ✅ Validação de permissões em todas as operações
- ✅ Arquivos compartilhados com acesso controlado
- ✅ Emails enviados através do Gmail autenticado

## 📂 Estrutura do Projeto

```
├── Code.gs              # Configuração principal e endpoints
├── UsersCRUD.gs         # Operações CRUD de usuários
├── PostsCRUD.gs         # Operações CRUD de posts
├── EmailCRUD.gs         # Sistema de emails
├── FileUpload.gs        # Sistema de upload
└── Documentacao.md      # Documentação técnica detalhada
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique a [documentação técnica](Documentacao.md)
2. Confira se as permissões estão configuradas corretamente
3. Teste com o token de admin padrão primeiro
4. Verifique os logs no Google Apps Script

---

**Desenvolvido com ❤️ para simplificar o desenvolvimento de APIs com Google Apps Script**
