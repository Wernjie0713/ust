'use client'

import React, { useState, useEffect } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: 'sorting' | 'environmental' | 'process' | 'tips';
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GameState {
  currentQuestion: number;
  score: number;
  lives: number;
  streak: number;
  timeLeft: number;
  gamePhase: 'menu' | 'playing' | 'result' | 'explanation';
  selectedAnswer: number | null;
  isAnswerRevealed: boolean;
}

interface Reward {
  ecoPoints: number;
  ecoTokens: number;
  badge?: string;
  title?: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Which of these items should NOT go in the recycling bin?",
    options: ["Plastic water bottle", "Pizza box with grease", "Aluminum can", "Glass jar"],
    correctAnswer: 1,
    explanation: "Greasy pizza boxes contaminate other recyclables and should go in regular trash. Clean pizza boxes can be recycled!",
    category: 'sorting',
    difficulty: 'easy'
  },
  {
    id: 2,
    question: "What happens to plastic bottles after they're recycled?",
    options: ["They become new bottles", "They're turned into clothing fibers", "They become carpeting", "All of the above"],
    correctAnswer: 3,
    explanation: "Recycled plastic bottles can be transformed into new bottles, polyester clothing, carpets, and many other products!",
    category: 'process',
    difficulty: 'medium'
  },
  {
    id: 3,
    question: "How long does it take for a plastic bottle to decompose in nature?",
    options: ["50 years", "100 years", "450 years", "1000+ years"],
    correctAnswer: 2,
    explanation: "Plastic bottles take approximately 450 years to decompose naturally, which is why recycling is so important!",
    category: 'environmental',
    difficulty: 'medium'
  },
  {
    id: 4,
    question: "Which recycling symbol indicates the most commonly recycled plastic?",
    options: ["♳ (1 - PET)", "♴ (2 - HDPE)", "♵ (3 - PVC)", "♶ (4 - LDPE)"],
    correctAnswer: 0,
    explanation: "PET (♳) plastic is the most commonly recycled plastic, used for water bottles and food containers.",
    category: 'sorting',
    difficulty: 'hard'
  },
  {
    id: 5,
    question: "What's the best way to prepare containers for recycling?",
    options: ["Leave them as is", "Rinse them clean", "Fill with water", "Break them into pieces"],
    correctAnswer: 1,
    explanation: "Rinsing containers removes food residue that could contaminate other recyclables in the sorting process.",
    category: 'tips',
    difficulty: 'easy'
  },
  {
    id: 6,
    question: "Which material can be recycled indefinitely without losing quality?",
    options: ["Paper", "Plastic", "Glass", "Cardboard"],
    correctAnswer: 2,
    explanation: "Glass can be recycled endlessly without any loss in quality or purity, making it one of the most sustainable materials!",
    category: 'environmental',
    difficulty: 'medium'
  },
  {
    id: 7,
    question: "What percentage of energy is saved when recycling aluminum cans vs. making new ones?",
    options: ["25%", "50%", "75%", "95%"],
    correctAnswer: 3,
    explanation: "Recycling aluminum cans saves 95% of the energy required to make new ones from raw materials!",
    category: 'environmental',
    difficulty: 'hard'
  },
  {
    id: 8,
    question: "Which of these is considered 'wishcycling' (incorrectly putting items in recycling)?",
    options: ["Clean yogurt containers", "Plastic bags in curbside bins", "Empty cereal boxes", "Glass bottles"],
    correctAnswer: 1,
    explanation: "Plastic bags jam sorting machines and should be taken to special drop-off locations, not curbside bins.",
    category: 'sorting',
    difficulty: 'medium'
  }
];

interface EducationGameProps {
  onReturnToHub?: () => void;
}

export default function EducationGame({ onReturnToHub }: EducationGameProps = {}) {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    lives: 3,
    streak: 0,
    timeLeft: 30,
    gamePhase: 'menu',
    selectedAnswer: null,
    isAnswerRevealed: false
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [finalReward, setFinalReward] = useState<Reward | null>(null);

  // Timer effect
  useEffect(() => {
    if (gameState.gamePhase === 'playing' && gameState.timeLeft > 0 && !gameState.isAnswerRevealed) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState.timeLeft === 0 && gameState.gamePhase === 'playing') {
      // Time's up - treat as wrong answer
      handleTimeUp();
    }
  }, [gameState.timeLeft, gameState.gamePhase, gameState.isAnswerRevealed]);

  const startGame = (difficulty: 'easy' | 'medium' | 'hard' | 'mixed') => {
    let selectedQuestions: Question[];
    
    if (difficulty === 'mixed') {
      selectedQuestions = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    } else {
      selectedQuestions = QUIZ_QUESTIONS.filter(q => q.difficulty === difficulty).slice(0, 5);
    }

    setQuestions(selectedQuestions);
    setGameState({
      currentQuestion: 0,
      score: 0,
      lives: 3,
      streak: 0,
      timeLeft: 30,
      gamePhase: 'playing',
      selectedAnswer: null,
      isAnswerRevealed: false
    });
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (gameState.isAnswerRevealed) return;
    
    setGameState(prev => ({ 
      ...prev, 
      selectedAnswer: answerIndex,
      isAnswerRevealed: true
    }));

    const currentQ = questions[gameState.currentQuestion];
    const isCorrect = answerIndex === currentQ.correctAnswer;
    
    setTimeout(() => {
      if (isCorrect) {
        handleCorrectAnswer();
      } else {
        handleWrongAnswer();
      }
    }, 1500); // Show explanation for 1.5 seconds
  };

  const handleTimeUp = () => {
    setGameState(prev => ({ 
      ...prev, 
      selectedAnswer: null,
      isAnswerRevealed: true
    }));
    
    setTimeout(() => {
      handleWrongAnswer();
    }, 1500);
  };

  const handleCorrectAnswer = () => {
    const newStreak = gameState.streak + 1;
    const streakBonus = newStreak >= 3 ? newStreak * 10 : 0;
    const timeBonus = Math.floor(gameState.timeLeft / 3) * 5;
    const basePoints = 100;
    
    setGameState(prev => ({
      ...prev,
      score: prev.score + basePoints + streakBonus + timeBonus,
      streak: newStreak,
      gamePhase: 'explanation'
    }));
  };

  const handleWrongAnswer = () => {
    const newLives = gameState.lives - 1;
    
    if (newLives <= 0) {
      endGame();
    } else {
      setGameState(prev => ({
        ...prev,
        lives: newLives,
        streak: 0,
        gamePhase: 'explanation'
      }));
    }
  };

  const nextQuestion = () => {
    if (gameState.currentQuestion + 1 >= questions.length) {
      endGame();
    } else {
      setGameState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        timeLeft: 30,
        selectedAnswer: null,
        isAnswerRevealed: false,
        gamePhase: 'playing'
      }));
    }
  };

  const endGame = () => {
    const reward = calculateReward();
    setFinalReward(reward);
    setGameState(prev => ({ ...prev, gamePhase: 'result' }));
  };

  const calculateReward = (): Reward => {
    const { score, streak } = gameState;
    let ecoPoints = Math.floor(score / 10);
    let ecoTokens = Math.floor(score / 100);
    let badge = undefined;
    let title = undefined;

    // Bonus rewards based on performance
    if (score >= 800) {
      badge = "🏆 Recycling Master";
      title = "Eco Expert";
      ecoPoints += 50;
      ecoTokens += 10;
    } else if (score >= 600) {
      badge = "🥇 Eco Champion";
      title = "Green Guru";
      ecoPoints += 30;
      ecoTokens += 5;
    } else if (score >= 400) {
      badge = "🥈 Recycling Pro";
      ecoPoints += 20;
      ecoTokens += 3;
    } else if (score >= 200) {
      badge = "🥉 Eco Learner";
      ecoPoints += 10;
      ecoTokens += 1;
    }

    return { ecoPoints, ecoTokens, badge, title };
  };

  const resetGame = () => {
    setGameState({
      currentQuestion: 0,
      score: 0,
      lives: 3,
      streak: 0,
      timeLeft: 30,
      gamePhase: 'menu',
      selectedAnswer: null,
      isAnswerRevealed: false
    });
    setQuestions([]);
    setFinalReward(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sorting': return '🗂️';
      case 'environmental': return '🌍';
      case 'process': return '♻️';
      case 'tips': return '💡';
      default: return '❓';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#2ecc71';
      case 'medium': return '#f39c12';
      case 'hard': return '#e74c3c';
      default: return '#3498db';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `url('/bg.png') center center / cover no-repeat`,
      color: 'white',
      position: 'relative'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(46,204,113,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(52,152,219,0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(155,89,182,0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Game Menu */}
      {gameState.gamePhase === 'menu' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎓</div>
            <h1 style={{
              margin: '0 0 16px 0',
              fontSize: '32px',
              color: '#2ecc71'
            }}>
              Eco Education Quiz
            </h1>
            <p style={{
              margin: '0 0 32px 0',
              fontSize: '16px',
              opacity: 0.9,
              lineHeight: '1.5'
            }}>
              Test your recycling knowledge and learn amazing facts about sustainability!
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <button
                onClick={() => startGame('easy')}
                style={{
                  background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🟢 Easy<br/>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>Basic recycling</span>
              </button>

              <button
                onClick={() => startGame('medium')}
                style={{
                  background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🟡 Medium<br/>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>Environmental facts</span>
              </button>

              <button
                onClick={() => startGame('hard')}
                style={{
                  background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🔴 Hard<br/>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>Expert level</span>
              </button>

              <button
                onClick={() => startGame('mixed')}
                style={{
                  background: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🌈 Mixed<br/>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>All levels</span>
              </button>
            </div>

            <button
              onClick={() => onReturnToHub ? onReturnToHub() : window.history.back()}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ← Back to Game Hub
            </button>
          </div>
        </div>
      )}

      {/* Playing Phase */}
      {gameState.gamePhase === 'playing' && questions.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          padding: '20px'
        }}>
          {/* Header with stats */}
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>Question</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {gameState.currentQuestion + 1}/{questions.length}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>Score</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f1c40f' }}>
                  {gameState.score}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>Streak</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e74c3c' }}>
                  {gameState.streak}🔥
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Lives */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '20px',
                      opacity: i < gameState.lives ? 1 : 0.3
                    }}
                  >
                    ❤️
                  </div>
                ))}
              </div>

              {/* Timer */}
              <div style={{
                background: gameState.timeLeft <= 10 ? 'rgba(231,76,60,0.3)' : 'rgba(52,152,219,0.3)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: gameState.timeLeft <= 10 ? '#e74c3c' : '#3498db',
                minWidth: '40px',
                textAlign: 'center'
              }}>
                {gameState.timeLeft}s
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '32px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            {questions[gameState.currentQuestion] && (
              <>
                {/* Category and Difficulty */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '24px',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    background: 'rgba(155,89,182,0.3)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {getCategoryIcon(questions[gameState.currentQuestion].category)}
                    {questions[gameState.currentQuestion].category}
                  </div>
                  <div style={{
                    background: `${getDifficultyColor(questions[gameState.currentQuestion].difficulty)}30`,
                    color: getDifficultyColor(questions[gameState.currentQuestion].difficulty),
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {questions[gameState.currentQuestion].difficulty.toUpperCase()}
                  </div>
                </div>

                {/* Question */}
                <h2 style={{
                  margin: '0 0 32px 0',
                  fontSize: '24px',
                  textAlign: 'center',
                  lineHeight: '1.4'
                }}>
                  {questions[gameState.currentQuestion].question}
                </h2>

                {/* Answer Options */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(1, 1fr)',
                  gap: '16px'
                }}>
                  {questions[gameState.currentQuestion].options.map((option, index) => {
                    let buttonStyle = {
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: '2px solid rgba(255,255,255,0.2)',
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      cursor: gameState.isAnswerRevealed ? 'default' : 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left' as const
                    };

                    if (gameState.isAnswerRevealed) {
                      if (index === questions[gameState.currentQuestion].correctAnswer) {
                        buttonStyle = {
                          ...buttonStyle,
                          background: 'rgba(46,204,113,0.3)',
                          border: '2px solid #2ecc71',
                          color: '#2ecc71'
                        };
                      } else if (index === gameState.selectedAnswer) {
                        buttonStyle = {
                          ...buttonStyle,
                          background: 'rgba(231,76,60,0.3)',
                          border: '2px solid #e74c3c',
                          color: '#e74c3c'
                        };
                      }
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        style={buttonStyle}
                      >
                        <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Explanation Phase */}
      {gameState.gamePhase === 'explanation' && questions.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center'
          }}>
            {/* Result Icon */}
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>
              {gameState.selectedAnswer === questions[gameState.currentQuestion].correctAnswer ? '✅' : '❌'}
            </div>

            {/* Result Text */}
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '28px',
              color: gameState.selectedAnswer === questions[gameState.currentQuestion].correctAnswer ? '#2ecc71' : '#e74c3c'
            }}>
              {gameState.selectedAnswer === questions[gameState.currentQuestion].correctAnswer ? 'Correct!' :
               gameState.selectedAnswer === null ? 'Time\'s Up!' : 'Incorrect!'}
            </h2>

            {/* Correct Answer */}
            <div style={{
              background: 'rgba(46,204,113,0.2)',
              border: '1px solid rgba(46,204,113,0.5)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Correct Answer:</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2ecc71' }}>
                {String.fromCharCode(65 + questions[gameState.currentQuestion].correctAnswer)}. {questions[gameState.currentQuestion].options[questions[gameState.currentQuestion].correctAnswer]}
              </div>
            </div>

            {/* Explanation */}
            <div style={{
              background: 'rgba(52,152,219,0.2)',
              border: '1px solid rgba(52,152,219,0.5)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>💡 Did you know?</div>
              <div style={{ fontSize: '16px', lineHeight: '1.5' }}>
                {questions[gameState.currentQuestion].explanation}
              </div>
            </div>

            {/* Score Update */}
            {gameState.selectedAnswer === questions[gameState.currentQuestion].correctAnswer && (
              <div style={{
                background: 'rgba(241,196,15,0.2)',
                border: '1px solid rgba(241,196,15,0.5)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Points Earned:</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f1c40f' }}>
                  +{100 + (gameState.streak >= 3 ? gameState.streak * 10 : 0) + Math.floor(gameState.timeLeft / 3) * 5} points
                  {gameState.streak >= 3 && <span style={{ marginLeft: '8px' }}>🔥 Streak Bonus!</span>}
                </div>
              </div>
            )}

            <button
              onClick={nextQuestion}
              style={{
                background: 'linear-gradient(135deg, #3498db, #2980b9)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {gameState.currentQuestion + 1 >= questions.length ? '🏁 Finish Quiz' : '➡️ Next Question'}
            </button>
          </div>
        </div>
      )}

      {/* Result Phase */}
      {gameState.gamePhase === 'result' && finalReward && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center'
          }}>
            {/* Trophy */}
            <div style={{ fontSize: '100px', marginBottom: '20px' }}>🏆</div>

            <h1 style={{
              margin: '0 0 16px 0',
              fontSize: '32px',
              color: '#f1c40f'
            }}>
              Quiz Complete!
            </h1>

            {/* Final Score */}
            <div style={{
              background: 'rgba(241,196,15,0.2)',
              border: '1px solid rgba(241,196,15,0.5)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f1c40f', marginBottom: '8px' }}>
                {gameState.score}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.8 }}>Final Score</div>
            </div>

            {/* Badge */}
            {finalReward.badge && (
              <div style={{
                background: 'rgba(155,89,182,0.2)',
                border: '1px solid rgba(155,89,182,0.5)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{finalReward.badge}</div>
                {finalReward.title && (
                  <div style={{ fontSize: '16px', color: '#9b59b6', fontWeight: 'bold' }}>
                    New Title Unlocked: {finalReward.title}
                  </div>
                )}
              </div>
            )}

            {/* Rewards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: 'rgba(46,204,113,0.2)',
                border: '1px solid rgba(46,204,113,0.5)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ecc71' }}>
                  +{finalReward.ecoPoints}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>EcoPoints</div>
              </div>

              <div style={{
                background: 'rgba(52,152,219,0.2)',
                border: '1px solid rgba(52,152,219,0.5)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
                  +{finalReward.ecoTokens}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>EcoTokens</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={resetGame}
                style={{
                  background: 'linear-gradient(135deg, #3498db, #2980b9)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🔄 Play Again
              </button>

              <button
                onClick={() => onReturnToHub ? onReturnToHub() : window.history.back()}
                style={{
                  background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🎮 Game Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
