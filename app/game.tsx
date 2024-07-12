import React, { useEffect } from "react";
import { useGameLogic } from "./useGameLogic";

const GameUI = () => {
  const {
    gameState,
    drawCard,
    playCard,
    seeCard,
    swapCards,
    callScrew,
    endRound,
    checkForWin,
  } = useGameLogic();

  useEffect(() => {
    if (gameState.cardToSee) {
      const { playerIndex, cardIndex } = gameState.cardToSee;
      if (playerIndex !== -1 && cardIndex !== -1) {
        seeCard(playerIndex, cardIndex);
      }
    }
  }, [gameState.cardToSee]);

  const handlePlayCard = (action, cardIndex) => {
    playCard(action, cardIndex);
  };

  const renderCards = (cards, playerIndex) => {
    return cards.map((card, index) => (
      <div key={index} className="card">
        {card.isVisible ? (
          <img src={`cards/${card.value}.svg`} alt={card.value} />
        ) : (
          <img src="cards/back.svg" alt="back" />
        )}
      </div>
    ));
  };

  return (
    <div className="game">
      <div className="deck">
        <button onClick={drawCard}>Draw Card</button>
        {gameState.drawnCard && (
          <div className="card">
            <img src={`cards/${gameState.drawnCard.value}.svg`} alt={gameState.drawnCard.value} />
          </div>
        )}
      </div>
      <div className="players">
        {gameState.players.map((player, playerIndex) => (
          <div key={player.playerNumber} className="player">
            <h3>Player {player.playerNumber}</h3>
            <div className="cards">
              {renderCards(player.cards, playerIndex)}
            </div>
            {playerIndex === gameState.currentPlayerTurn - 1 && (
              <div className="actions">
                <button onClick={() => handlePlayCard("keep", 0)}>Keep Card 1</button>
                <button onClick={() => handlePlayCard("keep", 1)}>Keep Card 2</button>
                <button onClick={() => handlePlayCard("keep", 2)}>Keep Card 3</button>
                <button onClick={() => handlePlayCard("keep", 3)}>Keep Card 4</button>
                <button onClick={() => handlePlayCard("discard")}>Discard</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameUI;
