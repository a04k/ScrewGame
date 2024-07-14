# Screw: The Card Game

## Overview
 multiplayer card game for 2-6 players, played over 5 rounds. Lowest score wins.
 built as a fun project, and a homage to the actual game.

## Deck Composition
- Number cards (1-10): 4 of each (score added is the card number)
- Basra (B): 2 cards (+10 to score)
- Swap (5od w Hat) (S): 4 cards (+10 to score)
- El K7b 🐐 (K3b Dayer) (K): 2 cards (+10 to score)
- -1 card: 1 card (subtracts 1 from score)
- Green Screw (GS): 4 cards (add 0 to round score)
- Red Screw: 2 cards (add 30 to score)
- +20 cards: 2 cards (add 20 to score)

## Setup
1. Shuffle the deck and deal 4 cards to each player.
2. Place one card face-up on the ground as the starting card.
3. The remaining cards form the draw deck.

## Round Start
1. There's a 20-second window before the round starts.
2. After the room host clicks the start game button, there's a 5-second buffer.
3. Players then have 15 seconds to view two of their four cards.
4. 5 Second countdown to round start
5. Cards are then turned face-down for the round.

## Gameplay
1. Players take turns, starting with player 1.
2. The ground cards and the deck form stacks.
3. The current top ground card is always visible to all players.
4. The deck cards are always flipped.

### On a Player's Turn
A player can:
- Click on one of their cards
- Click on the deck
- Click on the ground card

#### Clicking on Own Card
- If the card matches the top ground card, it can be played (by clicking the player's card then the ground card).
- If the played card doesn't match, the player takes both their card and the ground card into their hand.

#### Clicking on the Deck
- The player draws a card and can either play it to the ground (by clicking the ground) or swap it with one of their own cards (by clicking on one of the cards in his hand).

---
 Special card functions only work when drawn from the deck and played to the ground immediately.
 ---

#### Clicking on the Ground Card
- The player can swap it with one of their own cards.

### Special Card Functions (when drawn from deck and played)
- 7, 8: Player can view one of their own cards
- 9, 10: Player can view one opponent's card
- K: Player can view one card from each opponent
- B: Player can discard one of their cards
- S: Player can swap one of their cards with an opponent's card

## Round End
1. A round ends when a player calls "Screw" and a full loop is completed back to that player.
2. The "Screw" caller's turn is skipped.
3. All cards are revealed when the turn reaches the "Screw" caller.
4. There's a 30-second break between rounds, showing current game totals.

## Scoring
- The player with the lowest round score adds 0 to their game total.
- If the "Screw" caller doesn't have the lowest score, their round score is doubled and added to their game total.
- All other players add their round score to their game total.

## Game End
The game ends after 5 rounds. The player with the lowest total score wins.

## Additional Rules
- When the draw deck is empty, reshuffle the ground cards (except the top card) to form a new deck.
- Only the active player can see cards revealed by special card effects.
- If a player clicks away from their initial click, the action is dismissed and they can make another move.
- The game state is updated after every turn.
