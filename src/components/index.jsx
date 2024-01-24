import React, { useState, useEffect } from "react";
import { Flex, Spin, Col, Row, Button, Radio, Result } from "antd";
import { ArrowRightOutlined, BulbOutlined } from "@ant-design/icons";
import LoadingBar from "react-top-loading-bar";
import './style.css';

export default function QuizBody() {
  const [quizData, setQuizData] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTrue, setState] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [value, setValue] = useState(1);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(100);
  const [timerWarning, setTimerWarning] = useState(false);
  const [userResponses, setUserResponses] = useState([]);
  const [showQuizStatus, setQuiz] = useState(false);

  async function fetchData() {
    try {
      const response = await fetch(`https://the-trivia-api.com/v2/questions/`);
      const result = await response.json();
      setQuizData(result);
      setState(true);
      setQuizAnswers([...result[0].incorrectAnswers, result[1].correctAnswer]);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    }
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (quizData.length > 0) {
      const returnArr = shuffleArray([
        ...quizData[questionIndex].incorrectAnswers,
        quizData[questionIndex].correctAnswer,
      ]);
      setQuizAnswers(returnArr);
    }
  }, [questionIndex, quizData]);

  useEffect(() => {
    if (quizStarted && !quizCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining((prevTime) => prevTime - 1);

        if (timeRemaining === 60) {
          setTimerWarning(true);
        }

        if (timeRemaining === 0) {
          setQuizCompleted(true);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [quizStarted, quizCompleted, timeRemaining]);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleNextQuestion = () => {
    setProgress(progress + 10);

    if (value === quizData[questionIndex].correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }

    if (questionIndex + 1 < quizData.length) {
      setQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setQuizCompleted(true);
    }

    setUserResponses((prevResponses) => [
      ...prevResponses,
      {
        question: quizData[questionIndex].question.text,
        userAnswer: value,
        correctAnswer: quizData[questionIndex].correctAnswer,
      },
    ]);

    setValue(1);
  };

  const handleRetry = () => {
    setQuestionIndex(0);
    setProgress(0);
    setScore(0);
    setQuizCompleted(false);
    setQuizStarted(true);
    setTimeRemaining(600);
    setTimerWarning(false);
  };

  const handleExit = () => {
    setQuestionIndex(0);
    setProgress(0);
    setScore(0);
    setQuizCompleted(false);
    setQuizStarted(false);
    setTimeRemaining(600);
    setTimerWarning(false);
  };

  return (
    <div className="main">
      {!quizStarted ? (
        <div className="startbtn">
            <h1>Welcome to the Quiz App</h1>
            <p>
              Test your knowledge with our interactive quiz. Click the "Start Quiz" button to begin!
            </p>
            <Button type="primary" size="medium" onClick={handleStartQuiz}>
          Start Quiz <span className="glow-icon"><BulbOutlined /></span>
        </Button>
        </div>
      ) : isTrue && !quizCompleted ? (
        <div className="question-section">
          <div>
            <div className="header">
              <h1>Quiz</h1>
              <div>
                <div>
                  Time Remaining: {Math.floor(timeRemaining / 60)}:
                  {timeRemaining % 60 < 10
                    ? `0${timeRemaining % 60}`
                    : timeRemaining % 60}
                </div>
                    {timerWarning && (
                      <div style={{ color: "#b50303", fontWeight: "bold" }}>
                        1 minute left!
                      </div>
                    )}
              </div>
            </div>
          </div>
              <LoadingBar
                style={{ background: "#fff" , height: 4 ,boxShadow: '0 3px 5px #fff' }}
                progress={progress + 10}
                onLoaderFinished={() => setProgress(progress)}
              />
          <Row wrap={false}>
          
          
            <Col  span={2} xs={3} sm={2} md={1} >
                <div className="que_div_first"
                  style={{
                    padding: "0 10px 0px 0px",
                  }}
                >
                  <h3>{`${
                    questionIndex < 9
                      ? `0${questionIndex + 1}`
                      : questionIndex + 1
                  }:  `}</h3>
                </div>

            </Col>
            <Col span={22} xs={21} sm={22} md={23}>
              <h3>{quizData[questionIndex].question.text}</h3>
            </Col>
          </Row>
          <Row>
            <Radio.Group
              className="radio-group"
              onChange={onChange}
              value={value}
            >
              {quizAnswers &&
                quizAnswers.map((v, i) => (
                  <Col span={24} key={i}>
                    <Radio className="option" value={v} key={v}>
                      {v}
                    </Radio>
                  </Col>
                ))}
            </Radio.Group>
          </Row>
          <div className="btn-div">
            <Button
            //   type="primary"
              style={{fontWeight: 'bold',
              border: 'none',       
            }}
              size="medium"
              onClick={handleNextQuestion}
              disabled={value === 1}
            >
              {questionIndex < 9 ? "Next" : "Submit"}
              <ArrowRightOutlined style={{fontWeight:'bolder'}} />
            </Button>
          </div>
        </div>
      ) : !quizCompleted ? (
        <Flex align="center" gap="middle">
          <Spin size="large" />
        </Flex>
      ) : (
        <Result
          className="result"
          status={score / quizData.length >= 0.5 ? "success" : "error"}
          title={`Quiz Completed! Your score : ${score}/${quizData.length}`  
        }
          extra={
            <div>
              <Button id="retry" type="primary" size="medium" onClick={handleRetry}>
                Retry Quiz
              </Button>
              <Button id="chk_result"
                style={{ margin: "0px 10px" }}
                type="primary"
                size="medium"
                onClick={() => setQuiz(!showQuizStatus)}
              >
                {!showQuizStatus ? "View quiz status" : "Hide quiz status"}
              </Button>
              <Button id="exit"
                type="danger"
                size="large"
                onClick={handleExit}
                className="exit"
              >
                Exit
              </Button>
            </div>
          }
        >
          {showQuizStatus ? (
            <div className="quiz-status" id="end_results">
              <h3>Quiz Status</h3>
              <ol>
                {userResponses.map((response, index) => (
                  <li key={index}>
                  <p style={{ color: 'white' }}>
                    <strong>Question:</strong> {response.question}
                  </p>
                  <p>
                    <strong>Your Answer:</strong> <span  style={{ color: response.userAnswer === response.correctAnswer ? 'darkgreen' : 'darkred' ,  }} >{response.userAnswer}</span>
                  </p>
                  <p >
                    <strong>Correct Answer:</strong> <span style={{ color: response.userAnswer === response.correctAnswer ? 'darkgreen' : 'darkred' , }} >{response.correctAnswer} </span>
                  </p>
                  <hr />
                </li>
                ))}
              </ol>
            </div>
          ) : (
            <div></div>
          )}
        </Result>
      )}
    </div>
  );
}