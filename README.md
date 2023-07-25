# Rock, Paper, Scissors, Lizard, Spock on Ethereum
***

This is a technical assignment (D) for [Kleros](https://kleros.io/). It needs to use the `SEPOLIA` network.

## Run locally

First, clone the repository.
```bash
git clone https://github.com/andresmechali/rpsls-eth
```

Next, access the project's folder and install dependencies.
```bash
cd rpsls-eth
npm install
```

Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**NOTE: You need to have the MetaMask plugin installed**

## How to play

This is a modified version of the classic Rock, Paper, Scissors game. The specific rules can be found [here](https://en.wikipedia.org/wiki/Rock_paper_scissors#Additional_weapons).

First, `player 1` picks the opponent's address, a move and the amount of ETH to stake, and clicks on `Create game`. This will require
signing the transaction with MetaMask, and accepting a request for getting the public key for encryption (more on this [later](#salt)).
Once approved, this will create a RPSLS game and redirect to the game's page. This address needs to be copied and sent to `player 2`.

Next, `player 2` visits the game's page, and picks a move. This will require to match the staked amount with `player 1`'s.

Once this is done, `player 1` can visit the game's page again and finalize the game. This will not only require a signature, but also will
ask for permission to decrypt some data (again, more on this [later](#salt)). Once the transaction is finalized, the player that wins the
game will receive the whole staked ETH.

If any of the players takes more than 5 minutes to move, the other player can claim a timeout and win the game.

## Salt

For `player 1` to create a game, and later finalize it, it is required a *salt* to add randomness and to prevent `player 2` of being
able to look at `player 1`'s move on the contract's data. This salt needs to be generated randomly for each game, and being inaccessible
by other players. The way it is being handling in this project is by utilizing `generateBytes` from the `crypto` module, which is
cryptographically secure. In order to store it and being able to access it upon refresh, it is being encrypted
using MetaMask's public encryption key and temporarily stored on the `sessionStorage`. When needed, it is decrypted using the private
key from the MetaMask wallet. This system has is caveats, and was chosen only for the purpose of simplicity, while still being secure. An
alternative would be that the player logs before playing (using something like Google's login) and the data is stored in an external
authenticated database. This would add unnecessary complexity for the scope of this exercise.

## Mixed strategy Nash equilibria
Obtaining the mixed strategy Nash equilibria for this game is very straightforward, as it is a symmetric game. Therefore, all the probabilities
will be equal, so it will be `1/5` for each move.
For fun and to double-check, we can easily calculate these probabilities.
Let's call `a`, `b`, `c`, `d` and `1-a-b-c-d` the probabilities of the opponent picking moved `rock (R)`, `paper (P)`, `scissors (S)`, `lizard (L)` and `spock (K)`,
respectively. Also, let's say that the rewards are `1` for winning, `0` for tieing and `-1` for losing.
The expected value for picking `rock` is then:

```
R = a*0 + b*(-1) + c*1 + d*1 + (1-a-b-c-d)*(-1) = a + 2c +2d - 1
```

Similarly,
```
P = 1 - b -2c
S = 2b + c + 2d - 1
L = -2a -2c -d + 1
K = a - b + c - d
```

We know by definition that `R = P = S = L = K`, and we have 5 equations and 5 variables. This can easily be solved by taking arbitrary pairs of
equations, obtaining relations between variables, and replacing them in other equations.

For example, we know that `a + 2c + 2d - 1 = 2b + c + 2d - 1`, so `a = 2b - c`.

After a few iterations, we obtain that `a = b = c = d = 1/5`.