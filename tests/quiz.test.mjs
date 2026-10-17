import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUESTION_BANK, MATCHING_PAIRS, createAttempt, answerQuestion, placeMatch,
  validateAttempt, scoreAttempt, createReview, retryAttempt
} from '../assets/js/quiz.js';

test('question bank contains exactly ten source-grounded questions with unique ids', () => {
  assert.equal(QUESTION_BANK.length, 10);
  assert.equal(new Set(QUESTION_BANK.map((q) => q.id)).size, 10);
  assert.ok(QUESTION_BANK.every((q) => q.prompt && q.correctAnswer !== undefined));
});

test('attempt selects exactly five unique questions', () => {
  const attempt = createAttempt(() => 0.314159);
  assert.equal(attempt.questions.length, 5);
  assert.equal(new Set(attempt.questions.map((q) => q.id)).size, 5);
});

test('submission validation blocks unanswered questions and incomplete matching', () => {
  const attempt = createAttempt(() => 0.2);
  assert.deepEqual(validateAttempt(attempt), { valid: false, unansweredQuestions: 5, unmatchedPairs: 5 });
});

test('eight of ten points passes at exactly 80 percent', () => {
  const attempt = createAttempt(() => 0.1);
  for (const q of attempt.questions) answerQuestion(attempt, q.id, q.correctAnswer);
  const pairs = MATCHING_PAIRS.slice(0, 3);
  for (const pair of pairs) placeMatch(attempt, pair.typeId, pair.descriptionId);
  const [wrongA, wrongB] = MATCHING_PAIRS.slice(3);
  placeMatch(attempt, wrongA.typeId, wrongB.descriptionId);
  placeMatch(attempt, wrongB.typeId, wrongA.descriptionId);
  const result = scoreAttempt(attempt);
  assert.deepEqual(result, { points: 8, total: 10, percentage: 80, passed: true });
});

test('seven of ten points fails', () => {
  const attempt = createAttempt(() => 0.1);
  for (const q of attempt.questions.slice(0, 4)) answerQuestion(attempt, q.id, q.correctAnswer);
  answerQuestion(attempt, attempt.questions[4].id, '__wrong__');
  for (const pair of MATCHING_PAIRS.slice(0, 3)) placeMatch(attempt, pair.typeId, pair.descriptionId);
  const [wrongA, wrongB] = MATCHING_PAIRS.slice(3);
  placeMatch(attempt, wrongA.typeId, wrongB.descriptionId);
  placeMatch(attempt, wrongB.typeId, wrongA.descriptionId);
  const result = scoreAttempt(attempt);
  assert.equal(result.points, 7);
  assert.equal(result.percentage, 70);
  assert.equal(result.passed, false);
});

test('review reports learner choice and correct answer for every asked question and pair', () => {
  const attempt = createAttempt(() => 0.3);
  for (const q of attempt.questions) answerQuestion(attempt, q.id, q.correctAnswer);
  for (const pair of MATCHING_PAIRS) placeMatch(attempt, pair.typeId, pair.descriptionId);
  const review = createReview(attempt);
  assert.equal(review.questions.length, 5);
  assert.equal(review.matches.length, 5);
  assert.ok(review.questions.every((item) => item.correct === true));
  assert.ok(review.matches.every((item) => item.correct === true));
});


test('retry returns a fresh valid five-question attempt with no learner state', () => {
  const first = createAttempt(() => 0.1);
  answerQuestion(first, first.questions[0].id, first.questions[0].correctAnswer);
  placeMatch(first, 'solar', 'sun');
  const retry = retryAttempt(() => 0.8);
  assert.equal(retry.questions.length, 5);
  assert.equal(retry.answers.size, 0);
  assert.equal(retry.matches.size, 0);
});

test('question choices are shuffled per attempt without mutating the bank or its answer keys', () => {
  const attempt = createAttempt(() => 0.05);
  for (const question of attempt.questions) {
    const original = QUESTION_BANK.find((item) => item.id === question.id);
    assert.deepEqual([...question.options].sort(), [...original.options].sort());
    assert.equal(question.correctAnswer, original.correctAnswer);
  }
  assert.ok(attempt.questions.some((question) => {
    const original = QUESTION_BANK.find((item) => item.id === question.id);
    return question.options.some((choice, index) => choice !== original.options[index]);
  }));
});

test('every dropdown includes all five real answers and two distinct distractors in shuffled order', () => {
  const first = createAttempt(() => 0.07);
  const second = createAttempt(() => 0.93);
  assert.equal(first.matchingChoices.length, 7);
  assert.equal(new Set(first.matchingChoices.map((choice) => choice.descriptionId)).size, 7);
  for (const pair of MATCHING_PAIRS) assert.ok(first.matchingChoices.some((choice) => choice.descriptionId === pair.descriptionId));
  assert.notDeepEqual(first.matchingChoices.map((c) => c.descriptionId),second.matchingChoices.map((c) => c.descriptionId));
  const wrong = first.matchingChoices.find((choice) => !MATCHING_PAIRS.some((pair) => pair.descriptionId === choice.descriptionId));
  placeMatch(first,'solar',wrong.descriptionId);
  assert.equal(first.matches.get('solar'),wrong.descriptionId);
  const review = createReview(first);
  assert.equal(review.matches[0].learnerDescription,wrong.description);
  assert.equal(review.matches[0].correct,false);
});
