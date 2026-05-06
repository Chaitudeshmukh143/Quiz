import { useEffect, useMemo, useState } from "react";
import WebcamMonitor from "./WebcamMonitor";
import { questions } from "../data/questions";

const QUIZ_DURATION_SECONDS = 70 * 60;

const WARNING_LIMIT_MESSAGE = {
  noFace: "Quiz auto-submitted after repeated face-missing warnings.",
  multipleFaces: "Quiz auto-submitted because multiple people were detected repeatedly.",
  offCenter: "Quiz auto-submitted after repeated face-position warnings."
};

export default function Quiz() {
  const [studentName, setStudentName] = useState("");
  const [answers, setAnswers] = useState({});
  const [warningCount, setWarningCount] = useState(0);
  const [violationFeed, setViolationFeed] = useState([]);
  const [currentWarning, setCurrentWarning] = useState("");
  const [proctorStatus, setProctorStatus] = useState("Idle");
  const [cameraError, setCameraError] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [submissionReason, setSubmissionReason] = useState("");
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const score = useMemo(() => {
    return questions.reduce((total, question) => {
      return total + (answers[question.id] === question.answer ? 1 : 0);
    }, 0);
  }, [answers]);

  const responseSummary = useMemo(() => {
    const incorrect = questions.filter(
      (question) => answers[question.id] && answers[question.id] !== question.answer
    ).length;
    const unanswered = questions.length - Object.keys(answers).length;

    return {
      correct: score,
      incorrect,
      unanswered
    };
  }, [answers, score]);

  useEffect(() => {
    if (!currentWarning) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCurrentWarning("");
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [currentWarning]);

  useEffect(() => {
    if (!quizStarted || quizSubmitted) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timerId);
          handleSubmit("Time is up. Quiz auto-submitted after 1 hour 10 minutes.");
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [quizStarted, quizSubmitted]);

  const handleSelect = (questionId, option) => {
    if (quizSubmitted) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [questionId]: option
    }));
  };

  const handleStartQuiz = () => {
    if (!studentName.trim()) {
      setCameraError("Please enter the candidate name before starting the quiz.");
      return;
    }

    if (!cameraEnabled) {
      setCameraError("Please allow camera access before starting the quiz.");
      return;
    }

    setTimeLeft(QUIZ_DURATION_SECONDS);
    setQuizStarted(true);
    setCameraError("");
    setSubmissionReason("");
  };

  const handleProctorStatusChange = (nextStatus) => {
    setProctorStatus(nextStatus);

    if (
      nextStatus === "Camera permission denied" ||
      nextStatus === "Camera unavailable"
    ) {
      setCameraEnabled(false);
      setQuizStarted(false);
    }
  };

  const handleViolation = ({ type, message, totalWarnings, shouldAutoSubmit }) => {
    setWarningCount(totalWarnings);
    setCurrentWarning(message);
    setViolationFeed((previous) => [
      {
        id: `${type}-${Date.now()}`,
        message,
        time: new Date().toLocaleTimeString()
      },
      ...previous
    ].slice(0, 5));

    if (shouldAutoSubmit) {
      handleSubmit(WARNING_LIMIT_MESSAGE[type] || "Quiz auto-submitted due to proctoring violations.");
    }
  };

  const handleSubmit = (reason = "Quiz submitted successfully.") => {
    setQuizSubmitted(true);
    setQuizStarted(false);
    setSubmissionReason(reason);
  };

  const answeredCount = Object.keys(answers).length;
  const formatTime = (totalSeconds) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Google Form Ready</p>
          <h1>Advanced Java OOPs Test - Hard Level</h1>
          <p className="hero-copy">
            30 hard-level questions covering polymorphism, inheritance, abstraction,
            constructor chaining, overriding, interfaces, and the Object class.
          </p>
        </div>

        <div className="hero-stats">
          <div>
            <span>Total Questions</span>
            <strong>30</strong>
          </div>
          <div>
            <span>Marks</span>
            <strong>30</strong>
          </div>
          <div>
            <span>Answered</span>
            <strong>{answeredCount}</strong>
          </div>
          <div>
            <span>Warnings</span>
            <strong>{warningCount}</strong>
          </div>
          <div>
            <span>Duration</span>
            <strong>1h 10m</strong>
          </div>
          <div>
            <span>Time Left</span>
            <strong>{formatTime(timeLeft)}</strong>
          </div>
        </div>
      </section>

      {!quizStarted && !quizSubmitted && (
        <section className="start-card">
          <h2>Start proctored quiz</h2>
          <p>
            This quiz uses browser-only AI proctoring with webcam monitoring. Camera
            access is required before you begin.
          </p>
          <label className="field-group">
            <span>Candidate Name</span>
            <input
              type="text"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder="Enter student name"
            />
          </label>
          <div className="start-actions">
            <button
              className="primary-btn"
              onClick={() => {
                setCameraEnabled(true);
                setCameraError("");
              }}
            >
              Allow Camera
            </button>
            <button className="primary-btn" onClick={handleStartQuiz}>
              Start Quiz
            </button>
          </div>
          <p className="helper-text">
            Questions will appear only after camera access is allowed and the quiz is started.
          </p>
          {cameraError && <p className="error-text">{cameraError}</p>}
        </section>
      )}

      {quizSubmitted ? (
        <section className="result-card">
          <p className="eyebrow">Submission Complete</p>
          <h2>{studentName || "Candidate"} - Score: {score} / 30</h2>
          <p>{submissionReason}</p>
          <div className="result-grid">
            <div>
              <span>Candidate</span>
              <strong>{studentName || "Not provided"}</strong>
            </div>
            <div>
              <span>Answered</span>
              <strong>{answeredCount}</strong>
            </div>
            <div>
              <span>Warnings</span>
              <strong>{warningCount}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{proctorStatus}</strong>
            </div>
            <div>
              <span>Time Used</span>
              <strong>{formatTime(QUIZ_DURATION_SECONDS - timeLeft)}</strong>
            </div>
            <div>
              <span>Correct</span>
              <strong>{responseSummary.correct}</strong>
            </div>
            <div>
              <span>Incorrect</span>
              <strong>{responseSummary.incorrect}</strong>
            </div>
            <div>
              <span>Unanswered</span>
              <strong>{responseSummary.unanswered}</strong>
            </div>
          </div>

          <div className="response-review">
            <h3>Response Review</h3>
            <div className="review-list">
              {questions.map((question) => {
                const selectedAnswer = answers[question.id];
                const isCorrect = selectedAnswer === question.answer;

                return (
                  <article
                    key={`review-${question.id}`}
                    className={`review-card ${isCorrect ? "review-correct" : "review-wrong"}`}
                  >
                    <div className="question-head">
                      <span>Question {question.id}</span>
                      <strong>{isCorrect ? "Correct" : selectedAnswer ? "Incorrect" : "Not Answered"}</strong>
                    </div>
                    <p>{question.prompt}</p>
                    <p>
                      <strong>Your answer:</strong> {selectedAnswer || "Not answered"}
                    </p>
                    <p>
                      <strong>Correct answer:</strong> {question.answer}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {(quizStarted || quizSubmitted || cameraEnabled) ? (
        <section className="content-grid">
          <div className="quiz-column">
            {quizStarted || quizSubmitted ? (
              questions.map((question) => (
                <article key={question.id} className="question-card">
                  <div className="question-head">
                    <span>Question {question.id}</span>
                    <strong>1 mark</strong>
                  </div>
                  <h3>{question.prompt}</h3>
                  {question.code ? <pre>{question.code}</pre> : null}
                  <div className="options-grid">
                    {question.options.map((option) => {
                      const selected = answers[question.id] === option;

                      return (
                        <label
                          key={option}
                          className={`option-card ${selected ? "selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={selected}
                            onChange={() => handleSelect(question.id, option)}
                            disabled={quizSubmitted}
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </article>
              ))
            ) : (
              <section className="start-card">
                <h2>Ready to begin</h2>
                <p>
                  Camera access is active. Press <strong>Start Quiz</strong> to show the questions and begin the timer.
                </p>
              </section>
            )}
          </div>

          <div className="monitor-column">
            {cameraEnabled && !quizSubmitted ? (
              <WebcamMonitor
                enabled={cameraEnabled && !quizSubmitted}
                onError={setCameraError}
                onReady={() => {
                  setCameraEnabled(true);
                  setCameraError("");
                }}
                onStatusChange={handleProctorStatusChange}
                onViolation={handleViolation}
              />
            ) : (
              <aside className="proctor-box idle-box">
                <p className="eyebrow">AI Proctoring</p>
                <h2>Waiting to start</h2>
                <p>The webcam monitor appears here after camera access is allowed.</p>
              </aside>
            )}

            <aside className="summary-box">
              <h2>Exam Controls</h2>
              <p>Candidate: {studentName || "Not entered"}</p>
              <p>Status: {proctorStatus}</p>
              <p>Time left: {formatTime(timeLeft)}</p>
              <p>Warnings used: {warningCount}</p>
              {cameraError ? <p className="error-text">{cameraError}</p> : null}
              <button
                className="primary-btn"
                onClick={() => handleSubmit()}
                disabled={quizSubmitted || !quizStarted}
              >
                Submit Quiz
              </button>
            </aside>

            <aside className="summary-box">
              <h2>Recent Alerts</h2>
              {violationFeed.length === 0 ? (
                <p>No warnings yet.</p>
              ) : (
                <div className="alert-list">
                  {violationFeed.map((entry) => (
                    <div key={entry.id} className="alert-item">
                      <strong>{entry.time}</strong>
                      <p>{entry.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </section>
      ) : null}

      {currentWarning ? (
        <div className="warning-toast" role="alert">
          {currentWarning}
        </div>
      ) : null}
    </main>
  );
}
