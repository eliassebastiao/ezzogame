# Sons do Brick Clássico

## Sons Existentes (Já no Jogo)

| Ficheiro | Pasta | Evento | Estado |
|---|---|---|---|
| `pecaços-caindo 1.wav` | `Sons/` | Tijolo normal a destruir | ✅ OK |
| `pecaços-caindo 2.wav` | `Sons/` | Tijolo normal a destruir (variante) | ✅ OK |
| `Victory.wav` | `Sons/` | Nível completo / Vitória | ✅ OK |
| `Sond_toque_lançamento.wav` | `Sons/` | Bola no paddle / lançar | ✅ OK |
| `lançamento-2.wav` | `Sons/` | Lançar bola (variante) | ✅ OK |
| `Calabouço Pixelado (1).mp3` | `Sons/sons play game/` | Música de jogo | ✅ OK |
| `Calabouço Pixelado.mp3` | `Sons/sons play game/` | Música de jogo | ✅ OK |
| `Corrida Contra o Destino.mp3` | `Sons/sons play game/` | Música de jogo | ✅ OK |
| `Loop do Labirinto.mp3` | `Sons/sons play game/` | Música de jogo | ✅ OK |
| `Sob o Trovão dos Tambores.mp3` | `Sons/sons play game/` | Música de jogo | ✅ OK |
| `Corrida Contra o Destino.mp3` | `Sons/musica de inicio/` | Música do menu | ✅ OK |
| `Sob o Trovão dos Tambores.mp3` | `Sons/musica de inicio/` | Música do menu | ✅ OK |

---

## Sons Novos Necessários

### 1. Sons de Tijolos (pasta: `Sons/novos/efeitos/`)

Cada tipo de tijolo tem o seu próprio som único ao destruir.

| Ficheiro | Tipo de Tijolo | Descrição do Som | Duração | Formato |
|---|---|---|---|---|
| `break_normal.wav` | Normal | Som padrão de tijolo a quebrar. Leve, seco, tipo bloco a cair. | 0.5s | WAV |
| `break_armored.wav` | Armored | Som metálico. Clang de metal, como bater numa panela. | 0.6s | WAV |
| `break_explosive.wav` | Explosivo | Som de explosão pequena. Boom curto, com eco. | 0.8s | WAV |
| `break_bonus.wav` | Bonus | Som brilhante e cintilante. Tipo chime curto e agudo. | 0.5s | WAV |
| `break_indestructible.wav` | Indestrutível | Som metálico sólido. Batida numa barra de metal, sem quebrar. | 0.4s | WAV |
| `break_frozen.wav` | Frozen | Som de vidro quebrando com eco frio. Cristalino, com ressonância. | 0.7s | WAV |
| `break_mirror.wav` | Mirror | Som de espelho a estilhaçar. Estilhaços finos, agudos. | 0.6s | WAV |
| `break_heal.wav` | Heal | Som positivo e brilhante. Tipo sininho pequeno ou cristal a brilhar. | 0.5s | WAV |
| `break_coin.wav` | Coin | Som de moeda. Clink dourado, curto e doce. | 0.4s | WAV |

---

### 2. Sons de Poderes (pasta: `Sons/novos/efeitos/`)

Som ao apanhar/ativar cada poder.

| Ficheiro | Poder | Descrição do Som | Duração | Formato |
|---|---|---|---|---|
| `powerup_expand.wav` | Expand | Som de expansão. Como ar a expandir, swoosh curto. | 0.5s | WAV |
| `powerup_fireball.wav` | Fireball | Som de fogo a acender. Fwoosh de tocha. | 0.6s | WAV |
| `powerup_laser.wav` | Laser | Som laser. Pew clássico, tipo arma sci-fi. | 0.4s | WAV |
| `powerup_shield.wav` | Shield | Som de escudo a erguer-se. Shhhinnng de vidro/metal. | 0.7s | WAV |
| `powerup_multiball.wav` | Multiball | Som de multiplicação. Eco rápido, bip-bip-bip. | 0.6s | WAV |
| `powerup_magnet.wav` | Magnet | Som magnético. Zumbido baixo, bzzzt com eletricidade. | 0.6s | WAV |
| `powerup_slow.wav` | Slow | Som de abrandamento. Relógio a desacelerar, tic-tac profundo. | 0.7s | WAV |
| `powerup_ghost.wav` | Ghost | Som etéreo. Voz fantasma, sussurro com eco. | 0.8s | WAV |
| `powerup_mega.wav` | Mega | Som grande. Boom com crescimento, crescendo. | 0.7s | WAV |
| `powerup_drone.wav` | Drone | Som mecânico. Robot a ativar, beep-boop com motor. | 0.6s | WAV |
| `powerup_bomb.wav` | Bomb | Som de explosão grande. Boom profundo, com tremor. | 0.8s | WAV |

---

### 3. Sons de Combo (pasta: `Sons/novos/efeitos/`)

Som que toca quando o combo aumenta.

| Ficheiro | Combo | Descrição do Som | Duração | Formato |
|---|---|---|---|---|
| `combo_low.wav` | x4-5 | Som satisfatório. Pequeno pop ou ding. | 0.4s | WAV |
| `combo_mid.wav` | x6-8 | Som crescendo. Whoosh ascendente. | 0.5s | WAV |
| `combo_high.wav` | x9-10 | Som épico. Fanfarra curta, tipo ta-da! | 0.6s | WAV |
| `combo_gold.wav` | x11-14 (Gold) | Som triunfal. Fanfarra completa com ressonância. | 0.8s | WAV |
| `combo_master.wav` | x15+ (Master) | Som explosivo de vitória. Fanfarra + impacto. | 1.0s | WAV |

---

### 4. Sons de Eventos do Jogo (pasta: `Sons/novos/efeitos/`)

| Ficheiro | Evento | Descrição do Som | Duração | Formato |
|---|---|---|---|---|
| `level_up.wav` | Nível Completo | Som de vitória. Level clear de arcade, curto e alegre. | 0.8s | WAV |
| `level_milestone.wav` | Nível 50, 100, 200... | Som de grande conquista. Fanfarra épica, com coro. | 1.2s | WAV |
| `life_up.wav` | Ganhar Vida | Som positivo. Sininho de vida, ding-ding. | 0.5s | WAV |
| `life_down.wav` | Perder Vida | Som negativo. Buzz ou errr baixo. | 0.5s | WAV |
| `game_over.wav` | Game Over | Som de derrota. Wah-wah-wah triste. | 1.0s | WAV |
| `near_miss.wav` | Quase Perdeu (câmara lenta) | Som de tensão. Coração a bater, thump-thump. | 0.6s | WAV |
| `paddle_hit.wav` | Bola no Paddle | Som de rebatida. Leve, com variação de pitch. | 0.3s | WAV |
| `wall_hit.wav` | Bola na Parede | Som de batida. Curto e seco, como tapa. | 0.2s | WAV |
| `store_powerup.wav` | Guardar Poder | Som de armazenamento. Clique mecânico. | 0.3s | WAV |
| `use_stored.wav` | Usar Poder Guardado | Som de ativação. Click com energia. | 0.4s | WAV |

---

### 5. Sons Especiais de Efeitos (pasta: `Sons/novos/efeitos/`)

| Ficheiro | Evento | Descrição do Som | Duração | Formato |
|---|---|---|---|---|
| `frozen_effect.wav` | Congelar bolas (tijolo frozen) | Som de gelo. Cristais a formarem-se, crack-crack. | 0.6s | WAV |
| `mirror_effect.wav` | Refletir bola (tijolo mirror) | Som de espelho. Eco estranho, vwoomp. | 0.5s | WAV |
| `explosion_chain.wav` | Explosão em cadeia | Som de explosão múltipla. Boom-boom-boom rápido. | 0.8s | WAV |
| `drone_shoot.wav` | Drone a disparar laser | Som de tiro pequeno. Pew curto e mecânico. | 0.2s | WAV |
| `bomb_explosion.wav` | Bomba a explodir | Som de explosão grande. Boom com tremor e eco. | 1.0s | WAV |

---

### 6. Músicas Novas (pasta: `Sons/novos/musicas/`)

| Ficheiro | Quando Toca | Descrição | Duração | Formato |
|---|---|---|---|---|
| `musica_tensao.mp3` | Vida baixa (1-2 vidas) | Música tensa. Batida rápida, grave, som de perigo. | 45s | MP3 |
| `musica_combo.mp3` | Combo alto (x10+) | Música épica. Orquestral curta, tipo boss battle. | 45s | MP3 |
| `musica_vitoria.mp3` | Nível 1000 (vitória final) | Música triunfal. Coro completo, celebração. | 60s | MP3 |

---

## Especificações Técnicas para Criação

### Formato
- **SFX**: WAV, 44100Hz, 16-bit, mono ou stereo
- **Música**: MP3, 44100Hz, 128-192kbps, stereo

### Volume
- **SFX**: Exportar a **-6dB** (para evitar distorção quando juntamos)
- **Música**: Exportar a **-3dB**

### Estilo
- **Retro Arcade / 8-bit / Synthwave**
- Combina com o visual neon/cyberpunk do jogo
- Sons curtos e impactantes (SFX = 0.2-1.0s)

### Duração Máxima
- SFX: **1.5 segundos** (máximo)
- Música: **60 segundos** (loop)

### Ferramentas Recomendadas
- **Bfxr** (gratuito, online) — para sons 8-bit retro
- **FL Studio** — para música e sons mais complexos
- **Audacity** — para edição e ajuste
- **SFXR** — para geração rápida de sons arcade

---

## Estrutura de Pastas Final

```
Sons/
├── efeitos/                    ← SFX de jogo (todos os .wav)
│   ├── break_*.wav
│   ├── powerup_*.wav
│   ├── combo_*.wav
│   ├── level_*.wav
│   ├── life_*.wav
│   ├── game_over.wav
│   ├── near_miss.wav
│   ├── paddle_hit.wav
│   ├── wall_hit.wav
│   ├── store_powerup.wav
│   ├── use_stored.wav
│   ├── frozen_effect.wav
│   ├── mirror_effect.wav
│   ├── explosion_chain.wav
│   ├── drone_shoot.wav
│   └── bomb_explosion.wav
│
├── sons play game/             ← Música de jogo (já existente)
│   ├── Calabouço Pixelado (1).mp3
│   ├── Calabouço Pixelado.mp3
│   ├── Corrida Contra o Destino.mp3
│   ├── Loop do Labirinto.mp3
│   └── Sob o Trovão dos Tambores.mp3
│
├── musica de inicio/           ← Música do menu (já existente)
│   ├── Corrida Contra o Destino.mp3
│   └── Sob o Trovão dos Tambores.mp3
│
├── novas_musicas/              ← Músicas novas
│   ├── musica_tensao.mp3
│   ├── musica_combo.mp3
│   └── musica_vitoria.mp3
│
└── README.md                   ← Este ficheiro
```

---

## Prioridade de Criação (Recomendado)

### Fase 1 — Essenciais (faz o jogo soar completo)
1. Sons de tijolos: `break_frozen.wav`, `break_mirror.wav`, `break_heal.wav`, `break_coin.wav`
2. Sons de poderes: `powerup_magnet.wav`, `powerup_slow.wav`, `powerup_ghost.wav`, `powerup_mega.wav`, `powerup_drone.wav`, `powerup_bomb.wav`
3. Sons de combo: `combo_low.wav`, `combo_mid.wav`, `combo_high.wav`, `combo_gold.wav`, `combo_master.wav`

### Fase 2 — Eventos de jogo
4. `level_up.wav`, `life_up.wav`, `life_down.wav`, `game_over.wav`, `near_miss.wav`
5. `paddle_hit.wav`, `wall_hit.wav`, `store_powerup.wav`, `use_stored.wav`

### Fase 3 — Especiais e música
6. `frozen_effect.wav`, `mirror_effect.wav`, `explosion_chain.wav`, `drone_shoot.wav`, `bomb_explosion.wav`
7. `musica_tensao.mp3`, `musica_combo.mp3`, `musica_vitoria.mp3`

---

## Notas para o Programador

Quando criares os sons, coloca-os na pasta `Sons/novos/efeitos/` e `Sons/novas_musicas/` e depois diz-me onde estão. Eu atualizo o código para:
- Adicionar os novos caminhos no `audio.js`
- Associar cada som ao evento correto
- Implementar pitch variation (sons que mudam de tom)
- Adicionar música adaptativa (que muda com a situação do jogo)
- Fazer crossfade entre músicas
- Adicionar filtro de áudio no slow-mo (baixar pitch)

---

## Total de Sons

- **Sons existentes**: 11
- **Sons novos necessários**: 45
- **Músicas novas**: 3
- **Total**: 59 ficheiros de áudio

---

*Lista criada em: 2026-06-11*
*Jogo: Brick Clássico v2.0*
