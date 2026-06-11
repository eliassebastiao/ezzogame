# BRICK CLASICO v2.0

## Brick Breaker Premium - 1000 Niveis, Combos Epicos, 7 Vidas

---

## Estrutura do Projeto

```
D:\EZZO Workspace\PROJECTOS\Game\
├── Sons/                    <- Sons e Musicas
│   ├── efeitos/            <- SFX novos (.wav)
│   ├── novas_musicas/      <- Musicas novas (.mp3)
│   ├── sons play game/     <- Musica de jogo (existente)
│   ├── musica de inicio/   <- Musica do menu (existente)
│   └── README.md           <- Lista completa de sons
│
├── src/                    <- Codigo Fonte
│   ├── main.js            <- Entry point
│   ├── state.js           <- Estado global e constantes
│   ├── physics.js         <- Fisica, colisoes, poderes
│   ├── render.js          <- Desenho Canvas
│   ├── particles.js       <- Sistema de particulas
│   ├── bricks.js          <- Geracao de niveis (1000+ padroes)
│   ├── theme.js           <- 20 temas visuais
│   ├── audio.js           <- Sistema de audio
│   ├── combo.js           <- Sistema de combos
│   ├── input.js           <- Input (teclado, rato, toque)
│   ├── ui.js              <- UI, HUD, overlays
│   ├── lives.js           <- Logica de vidas
│   ├── auth.js            <- Autenticacao
│   ├── save.js            <- Save/Load
│   ├── supabase.js        <- API cliente
│   ├── profile.js         <- Perfil de jogador
│   ├── achievements.js    <- Sistema de conquistas
│   └── shop.js            <- Loja de skins
│
├── index.html              <- Interface principal
├── server.js               <- Servidor Node.js + API
├── package.json            <- Dependencias
├── supabase-schema.sql     <- Schema da base de dados
├── PLANO_MELHORIAS.md      <- Plano de features v3.0
└── README.md               <- Este ficheiro
```

---

## Sistema de Poderes

### Poderes Ativos (11 total)

| Poder | Efeito | Duracao | Cor |
|-------|--------|---------|-----|
| **Expand** | Paddle aumenta para 140px | 10s | Ciano |
| **Fireball** | Bola destroi tijolos em 1 hit | 7s | Rosa |
| **Laser** | Paddle dispara lasers | 6s | Verde |
| **Shield** | Protege contra 1 queda | 1x | Roxo |
| **Multiball** | Duplica bolas ativas | Instantaneo | Dourado |
| **Magnet** | Atrai bola para o centro do paddle | 8s | Magenta |
| **Slow** | Reduz velocidade das bolas | 6s | Azul |
| **Ghost** | Bola atravessa o fundo | 5s | Branco |
| **Mega** | Bola aumenta para 12px de raio | 4s | Laranja |
| **Drone** | 2 drones disparam lasers | 9s | Laranja Escuro |
| **Bomb** | Explode tijolos num raio de 120px | Instantaneo | Vermelho |

### Armazenamento de Poderes
- Guarda ate **2 poderes** para uso posterior
- **Tecla 1** -> Ativar poder guardado 1
- **Tecla 2** -> Ativar poder guardado 2
- Clica no icone no HUD

---

## Sistema de Tijolos

### Tipos de Tijolos (9 total)

| Tipo | Cor | Efeito ao Destruir | Nivel Minimo |
|------|-----|-------------------|--------------|
| **Normal** | Variavel | Sem efeito | 1 |
| **Armored** | Variavel escuro | Mais HP | 1 |
| **Explosive** | Laranja/Vermelho | Explosao em cadeia (80px) | 2 |
| **Bonus** | Dourado | Dropa powerup | 1 |
| **Indestrutivel** | Cinza Metalico | Nao destroi | 100 |
| **Frozen** | Ciano/Azul | Congela velocidade das bolas | 10 |
| **Mirror** | Prateado | Reflete bola em direcao aleatoria | 15 |
| **Heal** | Verde | Da 1 vida extra | 5 |
| **Coin** | Dourado | +100 pontos | 1 |

---

## Sistema de Combos

| Combo | Nome | Cor | Shake | Particulas |
|-------|------|-----|-------|------------|
| x4 | Boa! | Verde | 3 | 15 |
| x5 | Brutal! | Ciano | 4 | 20 |
| x6 | Fantastico! | Roxo | 5 | 22 |
| x7 | Destruidor! | Rosa | 6 | 25 |
| x8 | Impressionante! | Laranja | 7 | 28 |
| x9 | Espetacular! | Amarelo | 8 | 30 |
| x10 | Magnifico! | Amarelo | 9 | 35 |
| x11+ | ⚡ COMBO GOLD ⚡ | Dourado | 10 | 40 |
| x15+ | 🔥 GOLD MASTER 🔥 | Rosa/Dourado | 16 | 50 |

---

## Sistema de Audio

### Sons Existentes
- pecacos-caindo 1.wav - Tijolo a destruir
- pecacos-caindo 2.wav - Tijolo (variante)
- Victory.wav - Nivel completo
- Sond_toque_lancamento.wav - Bola no paddle
- lancamento-2.wav - Lancar bola (variante)

### Musicas Existentes
- Menu: musica de inicio/
- Jogo: sons play game/

### Sons Necessarios (Ver Sons/README.md)
- 45 novos SFX - Tijolos, poderes, combos, eventos
- 3 novas musicas - Tensao, combo, vitoria

---

## Sistema de Fisica

### Correcoes Aplicadas
1. Colisao bola-tijolo - Circulo-retangulo, verifica TODOS os tijolos
2. Sem penetracao - Bola empurrada para fora do tijolo
3. Colisao paddle - Sem penetracao, angulo limitado (-60 a -120)
4. Multiball - Angulos validos (sem dx=0)
5. Bola no canto - Normal padrao para cima (0, -1)
6. Reflexao multipla - Resolve com o tijolo mais proximo

### Constantes
- BALL_SPEED = 5
- BALL_MAX_SPEED = 9
- BALL_MIN_SPEED = 3.5
- Paddle Speed = 7
- BRICK_COLS = 10
- BRICK_W = 56
- BRICK_H = 20

---

## Sistema de Temas (20 total)

Temas mudam a cada 50 niveis:
1. Cyberpunk Neon
2. Retro Synthwave
3. Deep Ocean
4. Matrix Code
5. Volcanic Lava
6. Cosmic Nebula
7. Glacial Blizzard
8. Cyber Acid
9. Sunset Glow
10. Royal Amber
11. Aurora Borealis
12. Toxic Waste
13. Blood Moon
14. Neon Tokyo
15. Deep Space
16. Golden Hour
17. Electric Storm
18. Candy Crush
19. Jungle Fire
20. Midnight Chrome

---

## Sistema de Perfil

- XP e Nivel de jogador
- Avatar (iniciais, upload, ou emoji)
- Bio personalizavel
- Estatisticas (jogos, score, tijolos, tempo)
- Conquistas (50+ tipos)
- Loja de skins (paddle, bola, tema, particulas)
- Coins
- Ranking global

---

## API Endpoints

| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| /api/register | POST | Criar conta |
| /api/login | POST | Entrar |
| /api/save/:user | PUT | Guardar jogo |
| /api/load/:user | GET | Carregar jogo |
| /api/profile/:user | GET/PUT | Perfil |
| /api/history/:user | POST/GET | Historico |
| /api/ranking | GET | Ranking global |
| /api/xp/:user | POST | Adicionar XP |
| /api/session/:user | POST | Registar sessao |
| /api/stats/:user | GET | Estatisticas |
| /api/achievements | GET | Todas conquistas |
| /api/achievements/:user | GET/POST | Conquistas do jogador |
| /api/shop | GET | Loja |
| /api/shop/:user/buy | POST | Comprar item |
| /api/shop/:user/equip | POST | Equipar item |
| /api/inventory/:user | GET | Inventario |

---

## Controles

- **Setas / A, D** - Mover paddle
- **Rato** - Mover paddle (posicao)
- **Espaco** - Lancar bola
- **P / ESC** - Pausar
- **1** - Usar poder guardado 1
- **2** - Usar poder guardado 2

---

## Tecnologias

- **Frontend**: HTML5 Canvas, CSS3, JavaScript ES6+
- **Backend**: Node.js, HTTP nativo
- **Base de Dados**: PostgreSQL (Supabase)
- **Mobile**: Capacitor (Android/iOS)

---

## Instalacao

```bash
npm install
npm run serve
```

Servidor inicia em: http://localhost:8081

---

## Desenvolvimento

```bash
# Desenvolvimento web
npm run serve

# Android (Capacitor)
npm run dev

# Build APK
npm run build:apk
```

---

## Roadmap

### v2.0 (Atual)
- Sistema de poderes (11 poderes)
- Sistema de tijolos (9 tipos)
- 20 temas visuais
- Sistema de combos
- Sistema de perfil
- Conquistas
- Loja de skins
- Fisica corrigida

### v3.0 (Futuro)
- Modos de jogo (endless, challenge, zen)
- Boss levels
- Tijolos moveis
- Multiplayer
- Eventos temporarios
- Battle pass

---

## Autor

**EZZO Maquina**

---

## Licenca

MIT

---

## Notas

- Lista completa de sons em: Sons/README.md
- Plano de melhorias em: PLANO_MELHORIAS.md
- Schema da BD em: supabase-schema.sql

---

*Documento atualizado em: 2026-06-11*
*Versao: 2.0*
