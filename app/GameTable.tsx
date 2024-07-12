import React from 'react';

interface CardProps {
  value: string;
  isVisible: boolean;
}

const Card: React.FC<CardProps> = ({ value, isVisible }) => {
  return (
    <div className={`w-16 h-24 rounded-lg shadow-md flex items-center justify-center text-xl font-bold ${isVisible ? 'bg-white text-black' : 'bg-blue-500'}`}>
      {isVisible ? value : ''}
    </div>
  );
};

interface PlayerProps {
  playerNumber: number;
  cards: CardProps[];
  totalPoints: number;
  isCurrentPlayer: boolean;
}

const Player: React.FC<PlayerProps> = ({ playerNumber, cards, totalPoints, isCurrentPlayer }) => {
  return (
    <div className={`flex flex-col items-center ${isCurrentPlayer ? 'border-2 border-yellow-400 p-2 rounded' : ''}`}>
      <div className="mb-2 font-bold text-white">Player {playerNumber}</div>
      <div className="flex space-x-2">
        {cards.map((card, index) => (
          <Card key={index} value={card.value} isVisible={card.isVisible} />
        ))}
      </div>
      <div className="mt-2 text-white">Points: {totalPoints}</div>
    </div>
  );
};

interface GameTableProps {
  players: PlayerProps[];
  groundCard: CardProps;
  onDrawCard: () => void;
  onScrewCall: () => void;
  currentPlayerTurn: number;
  roundNumber: number;
}

const GameTable: React.FC<GameTableProps> = ({ 
  players, 
  groundCard, 
  onDrawCard, 
  onScrewCall, 
  currentPlayerTurn,
  roundNumber
}) => {
  return (
    <div className="min-h-screen bg-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-white text-2xl mb-4">Round: {roundNumber}</div>
        <div className="flex justify-between mb-16">
          {players.slice(0, 2).map((player) => (
            <Player 
              key={player.playerNumber} 
              {...player} 
              isCurrentPlayer={player.playerNumber === currentPlayerTurn}
            />
          ))}
        </div>
        <div className="flex justify-center items-center h-64 space-x-4">
          <button onClick={onDrawCard} className="w-24 h-36 bg-green-500 rounded-lg shadow-lg flex items-center justify-center text-white font-bold">
            DRAW
          </button>
          <Card value={groundCard.value} isVisible={groundCard.isVisible} />
          <button onClick={onScrewCall} className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md">
            SCREW
          </button>
        </div>
        <div className="flex justify-between mt-16">
          {players.slice(2, 4).map((player) => (
            <Player 
              key={player.playerNumber} 
              {...player} 
              isCurrentPlayer={player.playerNumber === currentPlayerTurn}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameTable;