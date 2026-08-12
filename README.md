# IkaGX

> **Ikariam Intelligence.**

IkaGX é uma extensão para o navegador baseada em Chrome Extension Manifest V3 que adiciona ferramentas de consulta, coleta e organização de informações ao Ikariam.

O projeto reúne informações do jogo e dados de acesso em uma interface integrada ao Ikariam, mantendo os dados persistidos localmente no navegador.

---

## Recursos

### Histórico de IPs

- Exibe o IP público atual no Lobby e na barra do Ikariam.
- Registra o histórico de acessos por servidor, e-mail e conta.
- Evita registros duplicados da mesma conta usando o mesmo IP no mesmo dia.
- Mantém até 100 registros por combinação de servidor e e-mail.
- Mostra data e hora de cada acesso.
- Identifica o país do IP, código do país e bandeira quando a consulta de geolocalização está disponível.
- Permite pesquisar por conta, IP, e-mail, servidor, mundo ou data.
- Permite atualizar manualmente a geolocalização de IPs que ainda não possuem país associado.
- Exibe a quantidade de contas e IPs únicos registrados.

### Perfis de jogadores

- Adiciona o acesso **Meu Perfil** dentro do Ikariam.
- Consulta e armazena informações do perfil do jogador.
- Exibe pontuação, Mestres de Alvenaria, Cientistas, Generais e Ouro.
- Exibe informações de transporte e cargueiros, incluindo versões fenícias quando disponíveis.
- Consulta e apresenta o progresso das pesquisas:
  - Economia
  - Navegação Marítima
  - Ciência
  - Mitologia
  - Militar
- Mostra informações de identificação e resumo da conta.
- Apresenta o histórico de IPs associado à conta.
- Permite ocultar ou mostrar o e-mail na interface.
- Permite copiar dados do perfil.
- Permite exportar dados do perfil em JSON e CSV.

### Império

O IkaGX possui uma área de gerenciamento e consulta do império, com coleta dos dados de todas as cidades sem exigir a troca manual da cidade ativa.

#### Recursos

Apresenta, por cidade:

- Madeira
- Vinho
- Mármore
- Cristal
- Enxofre
- Capacidade máxima dos recursos
- Produção
- População e informações relacionadas quando disponíveis

#### Edifícios

- Lista os edifícios encontrados em cada cidade.
- Exibe os níveis dos edifícios.
- Identifica construções em processo de melhoria.
- Organiza as cidades em uma tabela comparativa.

#### Inventário

- Coleta os itens disponíveis no inventário.
- Apresenta os itens com suas imagens e informações disponíveis no jogo.

#### Militar

- Coleta as unidades terrestres e navais de todas as cidades.
- Identifica cada unidade a partir das classes utilizadas pelo Ikariam.
- Exibe quantidade por cidade.
- Utiliza os sprites do jogo para diferenciar unidades terrestres e navais.

### Armazenamento local

Os dados coletados são mantidos usando `chrome.storage.local`, separados por servidor e conta.

Entre os dados persistidos estão:

- Histórico de IPs
- E-mail da sessão
- Perfis de jogadores
- Nome dos mundos/servidores
- Snapshots dos impérios

Os snapshots do império podem ser reutilizados posteriormente para consulta sem necessidade de uma nova coleta imediata.

### Interface integrada

A extensão adiciona seus recursos diretamente à interface do Ikariam, incluindo:

- Histórico de IPs
- Meu Perfil
- Império
- Modais de consulta
- Abas de Recursos, Edifícios, Inventário e Militar
- Pesquisa e filtros
- Exportação de dados

---

## Funcionamento da coleta

Ao acessar um mundo do Ikariam, o IkaGX pode:

1. Identificar o servidor e o mundo atual.
2. Obter o IP público através do serviço `ipify`.
3. Consultar a geolocalização do IP através do `ipwho.is`.
4. Consultar informações do perfil diretamente nas respostas AJAX do Ikariam.
5. Complementar os dados com pesquisas e informações de transporte.
6. Armazenar os dados localmente.
7. Atualizar o snapshot do império em segundo plano.

A coleta do império percorre as cidades identificadas na conta e consulta os dados necessários diretamente pelas requisições do próprio Ikariam.

---

## Privacidade e dados

O IkaGX não possui um servidor próprio para armazenar os dados coletados.

Os dados persistidos pela extensão ficam no armazenamento local do navegador através de `chrome.storage.local`.

A extensão utiliza serviços externos para funções específicas:

- `api.ipify.org` — identificação do IP público atual.
- `ipwho.is` — consulta de país, código do país e bandeira associada ao IP.

As informações de perfil, cidades, edifícios, inventário e unidades militares são obtidas a partir das páginas e respostas do próprio Ikariam.

---

## Instalação

### Chrome / Chromium

1. Baixe ou clone o repositório:

```bash
git clone https://github.com/IkaGX/ikagx.git
```

2. Abra:

```text
chrome://extensions
```

3. Ative o **Modo do desenvolvedor**.

4. Clique em **Carregar sem compactação**.

5. Selecione a pasta do projeto que contém o arquivo `manifest.json`.

6. Acesse o Ikariam e verifique a presença dos recursos adicionados pelo IkaGX.

### Atualização durante o desenvolvimento

Depois de alterar os arquivos da extensão:

1. Volte para `chrome://extensions`.
2. Localize o IkaGX.
3. Clique em **Recarregar**.
4. Atualize a página do Ikariam.

---

## Estrutura do projeto

```text
ikagx/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── img/
│   ├── buttons_sprite_army.png
│   ├── buttons_sprite_fleet.png
│   ├── cargueiros.png
│   ├── cargueirosFenicios.png
│   ├── mercantes.png
│   ├── mercantesfenicios.png
│   └── ícones e sprites do jogo
├── libs/
│   └── jquery-4.0.0.min.js
├── content.js
├── empire.js
├── interceptor.js
├── log.js
├── lookup.js
├── modal.js
├── manifest.json
├── style.css
├── LICENSE
└── README.md
```

### Principais módulos

| Arquivo | Função |
|---|---|
| `content.js` | Inicialização da extensão, identificação do mundo/IP e integração com a interface do Ikariam |
| `lookup.js` | Perfis, consultas complementares, pesquisas, barcos e exportação |
| `empire.js` | Coleta e apresentação do império, recursos, edifícios, inventário e militar |
| `log.js` | Persistência de IPs, perfis, mundos e impérios |
| `modal.js` | Histórico de IPs e pesquisa dos registros |
| `interceptor.js` | Interceptação de respostas AJAX do Ikariam |
| `style.css` | Interface visual da extensão |
| `manifest.json` | Configuração da extensão Manifest V3 |

---

## Tecnologias

- JavaScript
- Chrome Extension Manifest V3
- jQuery
- Chrome Storage API
- XMLHttpRequest / Fetch
- APIs AJAX do Ikariam
- `Intl.DisplayNames` para tradução dos nomes de países

---

## Compatibilidade

O projeto atual é estruturado como uma extensão **Chrome/Chromium Manifest V3**.

A compatibilidade com outros navegadores pode exigir ajustes específicos no manifesto, APIs de extensão e permissões.

---

## Contribuindo

Sugestões, correções e melhorias são bem-vindas.

Para contribuir:

1. Faça um fork do projeto.
2. Crie uma branch para sua alteração.
3. Faça as alterações.
4. Teste a extensão no Ikariam.
5. Abra um Pull Request.

Problemas e sugestões também podem ser registrados através das Issues do repositório.

---

## Licença

Este projeto está licenciado sob a licença **MIT**.

Consulte o arquivo `LICENSE` para os termos completos.

---

## Repositório

**IkaGX**

https://github.com/IkaGX/ikagx

Desenvolvido para a comunidade do Ikariam com foco em produtividade, organização e inteligência durante o jogo.

---

**IkaGX**

*Ikariam Intelligence.*
