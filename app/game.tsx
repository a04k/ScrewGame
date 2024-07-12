"use client"
import React from 'react';
import GameTable from './GameTable';
import { useGameLogic } from './Components/GameLogic';

const Game: React.FC = () => {
  const { gameState, drawCard, callScrew, endRound } = useGameLogic();

  return (
    <div>
      <GameTable
        players={gameState.players}
        groundCard={gameState.groundCard}
        onDrawCard={drawCard}
        onScrewCall={callScrew}
        currentPlayerTurn={gameState.currentPlayerTurn}
        roundNumber={gameState.roundNumber}
      />
      {gameState.screwCalled && (
        <button onClick={endRound} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-md">
          End Round
        </button>
      )}
      {gameState.gameOver && (
        <div className="mt-4 text-white text-2xl">
          Game Over! Winner: Player {
            gameState.players.reduce((minPlayer, player) => 
              player.totalPoints < minPlayer.totalPoints ? player : minPlayer
            ).playerNumber
          }
        </div>
      )}
    </div>
  );
};

export default Game;