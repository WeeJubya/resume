export const QUESTION_BANK = Object.freeze([
  { id: 'q1', type: 'mcq', prompt: 'Which renewable source converts radiant energy from the sun into usable energy?', options: ['Solar Energy','Wind Energy','Hydropower','Geothermal Energy'], correctAnswer: 'Solar Energy' },
  { id: 'q2', type: 'tf', prompt: 'Wind turbines convert the kinetic energy of wind into electricity.', options: ['True','False'], correctAnswer: 'True' },
  { id: 'q3', type: 'mcq', prompt: 'Which renewable source relies on moving water and the continuous water cycle?', options: ['Biomass Energy','Hydropower','Solar Energy','Geothermal Energy'], correctAnswer: 'Hydropower' },
  { id: 'q4', type: 'mcq', prompt: "Which source uses the Earth's natural heat?", options: ['Wind Energy','Geothermal Energy','Biomass Energy','Hydropower'], correctAnswer: 'Geothermal Energy' },
  { id: 'q5', type: 'mcq', prompt: 'Which source can use organic matter such as wood, crops and animal waste?', options: ['Solar Energy','Biomass Energy','Wind Energy','Hydropower'], correctAnswer: 'Biomass Energy' },
  { id: 'q6', type: 'tf', prompt: 'Renewable energy sources emit little-to-no greenhouse gases.', options: ['True','False'], correctAnswer: 'True' },
  { id: 'q7', type: 'tf', prompt: 'Replacing fossil fuels with renewables can slow global warming and reduce air pollution.', options: ['True','False'], correctAnswer: 'True' },
  { id: 'q8', type: 'mcq', prompt: 'Greater use of renewables can reduce dependence on what kind of energy markets?', options: ['Volatile global energy markets','Only local solar markets','Agricultural markets','Telecommunications markets'], correctAnswer: 'Volatile global energy markets' },
  { id: 'q9', type: 'mcq', prompt: 'According to the storyboard, approximately how much UK electricity is generated from renewable sources?', options: ['Over 40%','Under 5%','Exactly 10%','Over 90%'], correctAnswer: 'Over 40%' },
  { id: 'q10', type: 'tf', prompt: 'The Avonmouth Wind Farm case study says the site became operational in 2013.', options: ['True','False'], correctAnswer: 'True' }
]);

export const MATCHING_PAIRS = Object.freeze([
  { typeId: 'solar', typeLabel: 'Solar Energy', descriptionId: 'sun', description: 'Radiant energy from the sun converted into electricity or heat.' },
  { typeId: 'wind', typeLabel: 'Wind Energy', descriptionId: 'air', description: 'Moving air turns turbine blades connected to a generator.' },
  { typeId: 'hydro', typeLabel: 'Hydropower', descriptionId: 'water', description: 'Moving water spins turbines and relies on the continuous water cycle.' },
  { typeId: 'biomass', typeLabel: 'Biomass Energy', descriptionId: 'organic', description: 'Organic matter such as wood, crops and animal waste is used for heat or electricity.' },
  { typeId: 'geothermal', typeLabel: 'Geothermal Energy', descriptionId: 'earth', description: "The Earth's natural heat is used for electricity or direct heating." }
]);

export const MATCHING_DISTRACTORS = Object.freeze([
  { descriptionId: 'fossil', description: 'Burning coal heats water into steam that turns an electricity-generating turbine.' },
  { descriptionId: 'nuclear', description: 'Nuclear fission produces heat to create steam that drives an electricity generator.' }
]);

function shuffled(items, random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createAttempt(random = Math.random) {
  return {
    questions: shuffled(QUESTION_BANK, random).slice(0, 5).map((question) => ({
      ...question,
      options: shuffled(question.options, random)
    })),
    matchingChoices: shuffled([...MATCHING_PAIRS, ...MATCHING_DISTRACTORS], random),
    answers: new Map(),
    matches: new Map()
  };
}

export function answerQuestion(attempt, id, value) {
  if (attempt.questions.some((question) => question.id === id)) attempt.answers.set(id, value);
  return attempt;
}

export function placeMatch(attempt, typeId, descriptionId) {
  const knownType = MATCHING_PAIRS.some((pair) => pair.typeId === typeId);
  const knownDescription = [...MATCHING_PAIRS, ...MATCHING_DISTRACTORS].some((pair) => pair.descriptionId === descriptionId);
  if (knownType && knownDescription) attempt.matches.set(typeId, descriptionId);
  else if (knownType && !descriptionId) attempt.matches.delete(typeId);
  return attempt;
}

export function validateAttempt(attempt) {
  const answered = attempt.questions.filter((question) => attempt.answers.has(question.id)).length;
  const matched = MATCHING_PAIRS.filter((pair) => attempt.matches.has(pair.typeId)).length;
  return {
    valid: answered === 5 && matched === 5,
    unansweredQuestions: 5 - answered,
    unmatchedPairs: 5 - matched
  };
}

export function scoreAttempt(attempt) {
  let points = 0;
  for (const question of attempt.questions) {
    if (attempt.answers.get(question.id) === question.correctAnswer) points += 1;
  }
  for (const pair of MATCHING_PAIRS) {
    if (attempt.matches.get(pair.typeId) === pair.descriptionId) points += 1;
  }
  const percentage = points * 10;
  return { points, total: 10, percentage, passed: percentage >= 80 };
}

export function createReview(attempt) {
  const descriptionById = new Map([...MATCHING_PAIRS, ...MATCHING_DISTRACTORS].map((pair) => [pair.descriptionId, pair.description]));
  return {
    questions: attempt.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      learnerAnswer: attempt.answers.get(question.id),
      correctAnswer: question.correctAnswer,
      correct: attempt.answers.get(question.id) === question.correctAnswer
    })),
    matches: MATCHING_PAIRS.map((pair) => ({
      typeId: pair.typeId,
      typeLabel: pair.typeLabel,
      learnerDescriptionId: attempt.matches.get(pair.typeId),
      learnerDescription: descriptionById.get(attempt.matches.get(pair.typeId)) ?? '',
      correctDescriptionId: pair.descriptionId,
      correctDescription: pair.description,
      correct: attempt.matches.get(pair.typeId) === pair.descriptionId
    }))
  };
}

export function retryAttempt(random = Math.random) {
  return createAttempt(random);
}
