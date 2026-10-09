export type Language = 'pt-BR' | 'en' | 'es';

export interface Translations {
  title: string;
  subtitle: string;
  easy: string;
  hard: string;
  showHelp: string;
  hideHelp: string;
  passDistance: string;
  inputPlaceholder: string;
  decreaseBy: string;
  increaseBy: string;
  launch: string;
  launching: string;
  retry: string;
  nextPass: string;
  advanceToPhase: string;
  playAgain: string;
  goalSuccess: string;
  championSuccess: string;
  missShort: string;
  missLong: string;
  tip: string;
  theoremTitle: string;
  pythagoreanTripleNote: string;
  irrationalApproxNote: string;
  useCalculated: string;
  errors: {
    negative: string;
    malformed: string;
    excessivePrecision: string;
    outOfBounds: string;
  };
  canvasLabel: string;
  passerLabel: string;
  attackerLabel: string;
  footer: string;
}

export const DICTIONARIES: Record<Language, Translations> = {
  'pt-BR': {
    title: 'Lançamento de Pitágoras',
    subtitle: 'Jogo Educativo de Futebol da RALECAB GAMES',
    easy: 'Fácil (1-10)',
    hard: 'Difícil (11-30)',
    showHelp: 'Mostrar Ajuda',
    hideHelp: 'Ocultar Ajuda',
    passDistance: 'Distância do Passe (C)',
    inputPlaceholder: 'Ex: 5.00',
    decreaseBy: 'Diminuir',
    increaseBy: 'Aumentar',
    launch: 'Lançar Bola!',
    launching: 'Executando passe...',
    retry: 'Tentar Novamente',
    nextPass: 'Outro Lance',
    advanceToPhase: 'Avançar p/ Fase',
    playAgain: 'Jogar Novamente',
    goalSuccess: 'Golaço! Passe milimétrico dominado e finalizado na rede!',
    championSuccess: '🏆 Sensacional! Você concluiu as 3 fases dominando o Teorema de Pitágoras no futebol!',
    missShort: 'Passe curto! A bola não alcançou o atacante. Aumente o valor de C.',
    missLong: 'Passe longo! A bola passou direto pelo atacante. Reduza o valor de C.',
    tip: 'Dica: Calcule a hipotenusa usando os catetos A (horizontal) e B (vertical) para acertar o lançamento.',
    theoremTitle: 'Teorema de Pitágoras no Futebol',
    pythagoreanTripleNote: 'Tripla pitagórica exata! O resultado da hipotenusa é um número inteiro.',
    irrationalApproxNote: 'Raiz irracional aproximada para duas casas decimais.',
    useCalculated: 'Usar valor calculado',
    errors: {
      negative: 'O valor não pode ser negativo.',
      malformed: 'Formato inválido. Digite um número positivo.',
      excessivePrecision: 'Máximo de 2 casas decimais permitido.',
      outOfBounds: 'Distância além do limite do campo.',
    },
    canvasLabel: 'Campo de futebol tático exibindo o passador e o atacante em um triângulo retângulo com os catetos A e B.',
    passerLabel: 'Passador (P)',
    attackerLabel: 'Atacante (Q)',
    footer: 'RALECAB GAMES • Lançamento de Pitágoras • Aprendizado de Geometria e Teorema de Pitágoras no Futebol',
  },
  'en': {
    title: 'Pythagoras Pass',
    subtitle: 'Educational Football Game by RALECAB GAMES',
    easy: 'Easy (1-10)',
    hard: 'Hard (11-30)',
    showHelp: 'Show Help',
    hideHelp: 'Hide Help',
    passDistance: 'Pass Distance (C)',
    inputPlaceholder: 'Ex: 5.00',
    decreaseBy: 'Decrease',
    increaseBy: 'Increase',
    launch: 'Launch Pass!',
    launching: 'Executing pass...',
    retry: 'Try Again',
    nextPass: 'Next Play',
    advanceToPhase: 'Advance to Phase',
    playAgain: 'Play Again',
    goalSuccess: 'Goal! Precision pass received and slotted into the net!',
    championSuccess: '🏆 Brilliant! You completed all 3 phases mastering the Pythagorean theorem in football!',
    missShort: 'Pass too short! The ball stopped before reaching the striker. Increase C.',
    missLong: 'Pass too long! The ball overshot the striker. Decrease C.',
    tip: 'Tip: Calculate the hypotenuse from horizontal leg A and vertical leg B to complete the pass.',
    theoremTitle: 'Pythagorean Theorem in Football',
    pythagoreanTripleNote: 'Exact Pythagorean triple! The hypotenuse is a whole integer.',
    irrationalApproxNote: 'Irrational square root rounded to two decimal places.',
    useCalculated: 'Use calculated value',
    errors: {
      negative: 'Value cannot be negative.',
      malformed: 'Invalid format. Enter a positive number.',
      excessivePrecision: 'Maximum 2 decimal places allowed.',
      outOfBounds: 'Distance exceeds pitch boundaries.',
    },
    canvasLabel: 'Tactical football pitch displaying passer and striker forming a right triangle with legs A and B.',
    passerLabel: 'Passer (P)',
    attackerLabel: 'Striker (Q)',
    footer: 'RALECAB GAMES • Pythagoras Pass • Geometry and Pythagorean Theorem Learning in Football',
  },
  'es': {
    title: 'Lanzamiento de Pitágoras',
    subtitle: 'Juego Educativo de Fútbol por RALECAB GAMES',
    easy: 'Fácil (1-10)',
    hard: 'Difícil (11-30)',
    showHelp: 'Mostrar Ayuda',
    hideHelp: 'Ocultar Ayuda',
    passDistance: 'Distancia del Pase (C)',
    inputPlaceholder: 'Ej: 5.00',
    decreaseBy: 'Disminuir',
    increaseBy: 'Aumentar',
    launch: '¡Lanzar Balón!',
    launching: 'Ejecutando pase...',
    retry: 'Intentar de Nuevo',
    nextPass: 'Otra Jugada',
    advanceToPhase: 'Avanzar a Fase',
    playAgain: 'Jugar de Nuevo',
    goalSuccess: '¡Golazo! ¡Pase milimétrico recibido y rematado a la red!',
    championSuccess: '🏆 ¡Sensacional! ¡Has completado las 3 fases dominando el Teorema de Pitágoras en el fútbol!',
    missShort: '¡Pase corto! El balón no alcanzó al delantero. Aumenta la distancia C.',
    missLong: '¡Pase largo! El balón sobrepasó al delantero. Reduce la distancia C.',
    tip: 'Consejo: Calcula la hipotenusa usando el cateto A (horizontal) y B (vertical) para acertar.',
    theoremTitle: 'Teorema de Pitágoras en el Fútbol',
    pythagoreanTripleNote: '¡Terna pitagórica exacta! La hipotenusa es un número entero.',
    irrationalApproxNote: 'Raíz irracional redondeada a dos decimales.',
    useCalculated: 'Usar valor calculado',
    errors: {
      negative: 'El valor no puede ser negativo.',
      malformed: 'Formato inválido. Ingresa un número positivo.',
      excessivePrecision: 'Máximo 2 decimales permitidos.',
      outOfBounds: 'Distancia fuera de los límites del campo.',
    },
    canvasLabel: 'Cancha táctica de fútbol mostrando al pasador y al delantero en un triángulo rectángulo con catetos A y B.',
    passerLabel: 'Pasador (P)',
    attackerLabel: 'Delantero (Q)',
    footer: 'RALECAB GAMES • Lanzamiento de Pitágoras • Aprendizaje de Geometría y Teorema de Pitágoras en el Fútbol',
  },
};

export function getTranslations(lang: Language): Translations {
  return DICTIONARIES[lang] || DICTIONARIES['pt-BR'];
}
