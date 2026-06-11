Plano de Implementação: Extreme Game Feel & UI Premium ("Juice")
Queremos levar o jogo ao nível dos grandes títulos de arcade modernos (como Shatter, Peggle ou Arkanoid). Para isso, vamos adicionar mecânicas de "Juice" (impacto e satisfação), melhorias visuais e uma interface moderna e viva.

🎨 O que propomos implementar
1. Efeitos Visuais Dinâmicos e Dinâmica do Jogo
Efeito de Grade Deformável (Ripple Grid): O fundo não será estático. Quando a bola colidir com o paddle, paredes ou tijolos, a grade de fundo sofrerá uma leve distorção elástica temporária (ondulação) que se propaga do ponto de impacto.
Popups de Pontuação Flutuantes (Juicy Popups): Ao destruir tijolos, pequenos textos como +100 ou COMBO x3 surgirão na tela, subindo e sumindo suavemente com cores neon correspondentes ao combo ou tipo de bloco.
Câmera Lenta de "Quase Perda" (Bullet-Time Near-Miss): Se a última bola em jogo estiver prestes a cair e passar muito perto do paddle, o jogo entrará em câmera lenta dramática por uma fração de segundo, dando ao jogador um reflexo extra para fazer o salvamento ("Near Miss Save").
Melhorias de Impacto do Paddle:
Paddle Hit Flash: O paddle brilhará em branco instantaneamente ao bater na bola, dissipando o brilho gradualmente.
Squash & Stretch: O paddle achatará levemente na vertical no momento do impacto da bola e esticará na horizontal de volta, dando uma sensação orgânica e elástica.
Rastros de Bola Especiais (Gradient Trails):
Bolas comuns ganham um rastro gradiente suave de cor neon.
A bola de fogo ganha um rastro de chamas intensas com partículas de fagulha.
2. Interface Premium (Glassmorphism & Glows)
Glassmorphism CSS nos Painéis: Atualizar os overlays (Menu Inicial, Game Over, Definições, Vitória) no index.html com filtros de desfoque de fundo (backdrop-filter: blur), bordas semitransparentes ultra-finas e sombras de brilho neon pulsantes.
Micro-animações de Botões: Efeitos de escala ao passar o rato (hover) e pequenas explosões de partículas brilhantes ao clicar.
📂 Ficheiros a Alterar
🛠️ 
state.js
 [MODIFY]
Adicionar propriedades ao estado do jogo para controlar os novos efeitos:

popups: [] (mensagens flutuantes de pontos)
gridRipples: [] (pontos de impacto na grade)
paddleFlash: 0 (opacidade do flash de colisão)
paddleScaleY: 1, paddleScaleX: 1 (para efeitos squash/stretch)
slowMoTimer: 0 (frames restantes de câmera lenta)
🛠️ 
physics.js
 [MODIFY]
Implementar o cálculo e ativação de câmera lenta (Slow-motion) quando a bola estiver prestes a escapar perto do paddle.
Aplicar o multiplicador de tempo a todas as velocidades de física se a câmera lenta estiver ativa.
Disparar o flash e deformação do paddle no impacto.
Disparar ondulações de grade (gridRipples) em todas as colisões relevantes.
Integrar a criação de popups flutuantes na destruição de tijolos.
🛠️ 
particles.js
 [MODIFY]
Adicionar lógica para gerir (adicionar, atualizar e desenhar) os textos flutuantes de pontuação.
Adicionar partículas de chamas exclusivas para o rastro da Bola de Fogo.
🛠️ 
render.js
 [MODIFY]
Desenhar a grade deformável usando as posições perturbadas pelas ondas de impacto ativas.
Aplicar as transformações de escala (squash & stretch) e renderizar o flash por cima do paddle.
Desenhar os popups flutuantes no canvas.
Aplicar uma tonalidade escura/neon na tela inteira quando a câmera lenta estiver ativa para dar foco dramático.
🛠️ 
index.html
 [MODIFY]
Atualizar os estilos CSS para aplicar Glassmorphism moderno e vibrante.
Adicionar animações de entrada e efeitos neon dinâmicos aos botões e painéis.
🔬 Plano de Verificação
Testes Manuais
Jogar e verificar se a câmera lenta ativa corretamente no último segundo antes de perder a bola.
Observar a distorção da grade no fundo ao acertar nas paredes e blocos.
Confirmar que o paddle apresenta feedback elástico (squash) e brilha ao rebater a bola.
Validar os textos de pontuação flutuando acima dos blocos destruídos.
Inspecionar o visual do menu inicial e do menu de configurações na tela principal.