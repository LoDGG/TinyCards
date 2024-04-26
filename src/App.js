import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  
  const [mode, setMode] = useState('');
  const [paires, setPaires] = useState([]);
  const [currentPair, setCurrentPair] = useState({});
  const [userAnswer, setUserAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [answer, setAnswer] = useState(false);
  const [found, setFound] = useState(true);
  const [recto, setRecto] = useState('');
  const [verso, setVerso] = useState('');

  const [focusInput, setFocusInput] = useState(false); // State variable to control focusing of input
  const inputRef = useRef(null);
  const correctSound = new Audio("correct.mp3");
  const incorrectSound = new Audio("wrong.mp3");

  useEffect(() => {
    setVerso(recto === 'fr' ? "it": "fr")
    }, [recto, ]);

  useEffect(() => {
    if (inputRef.current) 
      inputRef.current.focus();
    const fetchData = async () => {
      try {
        const response = await axios.get('/paires.json');
        const shuffledPaires = [...response.data].sort(() => Math.random() - 0.5);
        setPaires(shuffledPaires);
        setCurrentPair(shuffledPaires[0]);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };
    fetchData();
    if (focusInput && inputRef.current) {
      inputRef.current.focus();
      setFocusInput(false); // Reset focus state
    }
  }, [focusInput]);

  const startGame = (selectedMode) => {
    setMode(selectedMode);
    let_recto(selectedMode);
    setFocusInput(true);  
  };

  const let_recto = (selectedMode) => {
    if (selectedMode === '3') {
          
      const randomNumber = Math.random();
      setRecto(randomNumber < 0.5 ? "fr" : "it")
    } 
    else {
      setRecto(selectedMode === '1' ? "fr" : "it");
    }
  }

  const show = (Answer) => {
    setAnswer(Answer);
    setUserAnswer(Answer);
    setFound(false);
  };

  const checkAnswer = () => {
   
    const inspectAnswer = userAnswer.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, '')
    const good_answer = currentPair[verso].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, '');
    
    if(inspectAnswer === '') {
      show(good_answer);
      
    } else if (inspectAnswer === good_answer) {
      if (found)
        correctSound.play();
      nextCard();

    } else {
      setMessage('Nope');
      setUserAnswer("");
      incorrectSound.play();
    }
  };

  const nextCard = () => {


    // Remove the current pair from the list of pairs
    const remainingPaires = paires.slice(1);
    if (found === false) {
      remainingPaires.push(currentPair);
      setFound(true);
    }
    setPaires(remainingPaires);
    setCurrentPair(remainingPaires[0]);
    let_recto(mode);
    setUserAnswer('');
    setMessage('');
  };

  const returnToModeSelection = () => {
    setMode('');
    setPaires([]);
    setCurrentPair({});
    setRecto('');
    setUserAnswer('');
    setMessage('');
    setAnswer(false);
    setFound(true);
  };

  return (
    <div className="app">
      <h1>Flashcards</h1>
      <div className="game">
        {!mode && (
          <div>
            <button onClick={() => startGame('1')}>Thème (deviner les traductions)</button>
            <button onClick={() => startGame('2')}>Version (deviner les mots originaux)</button>
            <button onClick={() => startGame('3')}>Mix (aléatoire)</button>
          </div>
        )}

        {mode && currentPair && (
          <div >
            <p className="recto">{`${currentPair[recto] ? currentPair[recto].charAt(0).toUpperCase() + currentPair[recto].slice(1) : currentPair[recto]}`}</p>
            <input
              
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
              className={`user-answer ${found ? 'found' : 'not-found'}`}

            />

            <div className="button-container">
              <button className='button2' onClick={checkAnswer}>Validate</button>
              <button className='button2'onClick={() => show(mode === '2' ? currentPair.fr : currentPair.it)}>Show</button>
            </div>
            <p>{message}</p>
            
          </div>
        )}
      </div>

      {mode && (
        <div className="return-container">
        <button  onClick={returnToModeSelection}>Retour</button>
        </div>
      )}
    </div>
  );
};

export default App;
