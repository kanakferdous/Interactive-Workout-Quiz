// Elements
const sections = document.querySelectorAll('.section');
const introSection = document.getElementById('intro-section');
const quizSection = document.getElementById('quiz-section');
const loadingSection = document.getElementById('loading-section');
const resultSection = document.getElementById('result-section');
const footerSection = document.getElementById('footer-section');

const questionText = document.getElementById('question-text');
const progress = document.querySelector('.progress');
const questionCounter = document.getElementById('question-counter');
const loadingPercentage = document.getElementById('loading-percentage');

const quizForm = document.getElementById('quiz-form');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

// Quiz Data
const questions = [
    {
        question: "Do you think hours of cardio is beneficial for fat loss?",
        hint: "(Many people think doing cardio every day is the answer.)",
        options: ["Yes", "No", "Not Sure"]
    },
    {
        question: "If there was a 7-minute routine to get you fit, would you want to add it to your daily routine?",
        hint: "(Certain exercise routines can help ignite your metabolism for faster fat burn.)",
        options: ["Definitely", "Maybe", "Not Sure"]
    }
];

let currentQuestionIndex = 0;
let currentStep = 1;
const totalSteps = 5;
let answers = [];
let progressPercentage = 0;

// Initialize session data JSON
let sessionData = {
    sessionID: Date.now(),
    responses: {}
};

// Save session data in localStorage
function saveSessionData() {
    localStorage.setItem('workoutSession', JSON.stringify(sessionData));
}

// Load session data from localStorage
function loadSessionData() {
    const savedData = JSON.parse(localStorage.getItem('workoutSession'));
    if (savedData && savedData.sessionID === sessionData.sessionID) {
        sessionData = savedData;
    }
}

// Clear session data from localStorage
function clearSessionData() {
    localStorage.removeItem('workoutSession');
}

// Initialize Quiz
function startQuiz(gender) {
    currentStep = 2;
    sessionData.responses.intro = { selectedGender: gender };
    saveSessionData();
    progressPercentage = 20;
    switchSection(quizSection);
    loadQuestion();
}

// Switch Section Function
function switchSection(targetSection) {
    sections.forEach(section => section.classList.remove('active'));
    targetSection.classList.add('active');

    if (targetSection === resultSection) {
        window.addEventListener('scroll', checkScrollToBottom);
    } else {
        window.removeEventListener('scroll', checkScrollToBottom);
    }
}

// Load Question and restore previous response if available
function loadQuestion() {
    const questionData = questions[currentQuestionIndex];
    questionText.innerText = questionData.question;
    document.querySelector("small").innerText = questionData.hint;

    quizForm.innerHTML = '';

    let hasSavedResponse = false; // Track if there's a saved response for enabling the Next button

    questionData.options.forEach((option) => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'answer';
        input.value = option;

        // Check if there's a saved response and pre-select it
        if (sessionData.responses[`question${currentQuestionIndex + 1}`] === option) {
            input.checked = true;
            hasSavedResponse = true; // Set to true if a saved response is found
        }

        input.addEventListener('change', () => {
            enableNextButton();
            sessionData.responses[`question${currentQuestionIndex + 1}`] = option;
            saveSessionData();
        });

        const span = document.createElement('span');
        span.innerText = option;

        label.appendChild(input);
        label.appendChild(span);
        quizForm.appendChild(label);
    });

    // Enable Next button if there's a saved response
    nextButton.disabled = !hasSavedResponse;

    updateNavigation();
    updateProgress();
}

// Enable Next Button when an option is selected
function enableNextButton() {
    nextButton.disabled = false;
}

// Next Question Function
function nextQuestion() {
    const selectedAnswer = document.querySelector("input[name='answer']:checked").value;
    answers[currentQuestionIndex] = selectedAnswer;

    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
        currentStep++;
        progressPercentage += 20;
        updateProgress();
        updateNavigation();
    } else {
        startLoading();
    }
}

// Previous Question Function
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
        currentStep--;
        progressPercentage -= 20;
        updateProgress();
        updateNavigation();
    } else {
        // Clear session data and return to intro section
        clearSessionData();
        switchSection(introSection);
    }
}

// Update Navigation Buttons and Counter
function updateNavigation() {
    prevButton.disabled = currentStep === 1;
    nextButton.disabled = !document.querySelector("input[name='answer']:checked");
    questionCounter.innerText = `${currentStep}/${totalSteps}`;
}

// Update Progress Bar based on progress percentage
function updateProgress() {
    progress.style.width = `${progressPercentage}%`;
}

// Start Loading/Processing
function startLoading() {
    switchSection(loadingSection);
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += 1;
        loadingPercentage.innerText = `${progress}%`;
        const circleSize = 100 * (progress / 100);
        document.querySelector(".circle").style.width = `${circleSize}%`;
        document.querySelector(".circle").style.height = `${circleSize}%`;

        if (progress >= 100) {
            clearInterval(loadingInterval);
            showResult();
        }
    }, 50);
}

// Show Result Section and attach scroll event
function showResult() {
    switchSection(resultSection);
    clearSessionData();
    window.addEventListener('scroll', checkScrollToBottom);
}

// Check if the user has scrolled to the bottom of the result section
function checkScrollToBottom() {
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight) {
        footerSection.classList.remove('hidden');
        window.removeEventListener('scroll', checkScrollToBottom);
    }
}

// Initialize session on page load
window.onload = function () {
    loadSessionData();
    if (sessionData.responses.intro) {
        startQuiz(sessionData.responses.intro.selectedGender);
    }
};
