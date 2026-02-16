// Progressive quiz logic for the interactive "How Well" section.
document.addEventListener('DOMContentLoaded', () => {
    // Initialize quiz wiring after the document is parsed so every card exists.
    const quizCards = Array.from(document.querySelectorAll('.quiz-card'));
    // Each card contributes a reset function so the entire quiz can be reset at once.
    const resetFunctions = [];

    // Show exactly one quiz card at a time.
    const activateCard = (index) => {
        quizCards.forEach((card, idx) => {
            card.classList.toggle('is-active', idx === index);
        });
    };

    // Bring every card back to its untouched state and show the first one.
    const resetQuiz = () => {
        resetFunctions.forEach((fn) => fn());

        if (quizCards.length) {
            activateCard(0);
        }
    };

    quizCards.forEach((card, index) => {
        // Cache frequently used elements and datasets for the current card.
        const options = Array.from(card.querySelectorAll('.quiz-option'));
        const feedback = card.querySelector('.quiz-feedback');
        const submitButton = card.querySelector('.quiz-submit');
        const correctLetter = card.dataset.correct;
        const isLastCard = index === quizCards.length - 1;
        let selectedOption = null;

        // Revert this card's UI and state so the question can be replayed.
        const resetCard = () => {
            selectedOption = null;
            card.classList.remove('is-answered', 'is-active');

            options.forEach((opt) => {
                opt.classList.remove('is-selected', 'is-correct', 'is-incorrect');
                opt.disabled = false;
            });

            if (feedback) {
                feedback.textContent = '';
                feedback.classList.remove('feedback-correct', 'feedback-incorrect');
            }

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit';
                delete submitButton.dataset.resetReady;
            }
        };

        resetFunctions.push(resetCard);

        // Clicking an option focuses it and clears any prior verdict.
        options.forEach((option) => {
            option.addEventListener('click', () => {
                if (card.classList.contains('is-answered')) {
                    return;
                }

                options.forEach((opt) => opt.classList.remove('is-selected', 'is-correct', 'is-incorrect'));
                option.classList.add('is-selected');
                selectedOption = option;

                if (feedback) {
                    feedback.textContent = '';
                    feedback.classList.remove('feedback-correct', 'feedback-incorrect');
                }

                if (submitButton) {
                    submitButton.disabled = false;
                }
            });
        });

        if (submitButton) {
            submitButton.textContent = 'Submit';

            // Handles both grading and the navigation/reset flow.
            submitButton.addEventListener('click', () => {
                if (!selectedOption) {
                    if (feedback) {
                        feedback.textContent = 'Please select an option first.';
                        feedback.classList.remove('feedback-correct', 'feedback-incorrect');
                    }
                    return;
                }

                if (!card.classList.contains('is-answered')) {
                    // First click grades the answer and locks the choices.
                    card.classList.add('is-answered');
                    const isCorrect = selectedOption.dataset.option === correctLetter;
                    selectedOption.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');

                    if (!isCorrect) {
                        // Highlight the correct option to give instant feedback.
                        const correctOption = options.find((opt) => opt.dataset.option === correctLetter);
                        if (correctOption) {
                            correctOption.classList.add('is-selected', 'is-correct');
                        }
                    }

                    if (feedback) {
                        const message = isCorrect ? card.dataset.correctMessage : card.dataset.wrongMessage;
                        feedback.textContent = message;
                        feedback.classList.remove('feedback-correct', 'feedback-incorrect');
                        feedback.classList.add(isCorrect ? 'feedback-correct' : 'feedback-incorrect');
                    }

                    options.forEach((opt) => {
                        opt.disabled = true;
                    });

                    submitButton.textContent = isLastCard ? 'Finish Quiz' : 'Next Question';
                    return;
                }

                if (index + 1 < quizCards.length) {
                    // Move to the next card after an answered question.
                    activateCard(index + 1);
                } else {
                    if (submitButton.dataset.resetReady === 'true') {
                        delete submitButton.dataset.resetReady;
                        resetQuiz();
                    } else {
                        // Require the user to click once more before the quiz resets.
                        submitButton.textContent = 'Good Job!';
                        submitButton.dataset.resetReady = 'true';
                    }
                }
            });
        }
    });

    // Start with a clean slate in case the DOM contained prefilled classes.
    resetQuiz();

    // Browser bfcache restores prior DOM state, so re-init on pageshow.
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            resetQuiz();
        }
    });
});
