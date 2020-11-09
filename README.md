# FRUITRIS
SEI 1019 Project 1: Fruitris 

A Tetris like puzzle game inspired by Gadgadsgame from neopets.com

To play Fruitris online visit sschneeberg.github.io

# HOW TO PLAY

Move the falling clusters across the board to match fruit and collect points.  Careful, if your fruit basket gets too full its game over!Use the `left` and `right` arrow keys to navigate the falling pieces side to side on the board.  `Up` and `down` arrow keys can be used to rotate the group as it falls.  If you've got the piece where you want it, you can press `shift` to speed up its descent.  Once the piece reaches the bottom, its position is locked, so consider yourself warned. 

`Horizontal` and `vertical` matches of 3 or more will be cleared and tallied. The game is won when you reach a point ceiling, dictated by your difficulty level.  Want to just play until you lose? Click the continue button after the high score is reached to continue in `Zen Mode`. The longer you play, the faster it gets!

In `Two Player Mode`, you and your opponent will switch off playing the same board.  If you lose on your turn, the other player wins.  Be smart and be strategic, good playing will earn you bonuses to help survive your turn.

Release your bonuses using `1` to clear a row, `2` to zap a column, and `3` to drop a color bomb.

# HOW TO INSTALL

1. `Fork` and `Clone` this respository to your local machine
2. Open `index.html` in your browser to play or 
3. Open the directory in your text editor of choice to view or edit the code

## Please note: All icons used in this game a free downloads from craftpix.net
These are not intended for commercial use.  This is an educational and personal project.
###

# HOW IT WORKS

Fruitris runs on a main logic loop that sets up two gravity functions: one controls the movement of the current falling fruit group, the other maintains the fall of stationary fruit once matches have been cleared.  

Put on a `setInterval`,  `dropFruitGroup()` works as follows:
1. Check to see if any stacked fruits need to fall (`fruitFall`) 
2. Check if the moving piece has hit the bottom, 

    if not, then continue to move the pice from the board 
    (`checkBottom` returns true when pieces can move) 

    if so, `addFruitGroup` to the stationary stack at the base of the gameboard

```javascript
function dropFruitGroup() {
    //game logic loop
    fruitFall();
    //if everything can move
    if (checkBottom()) {
        //drop pieces
        for (let fruit of fruitGroup) {
            fruit.y = fruit.y + movement;
        }
    } else {
        //add to board and create a new peice
        addFruitGroup();
    }

}
```

The javascript code relies on two main data structures: an class for the fruit and a 2d arrray to track the board state.  Within `addFruitGroup`, we write the fallen fruits into the board array.  Then we check to see if any matches have been made and clear those from the board.  `fruitFall` closes the gaps by searching the 2d array for any filled cells sitting above empty cells and moves the data into the unoccupied space, while wiping the old location.  The horizontal and vertical match checks optimize for time by starting at the newly dropped fruit and radiating outwards (left and right or up and down from the new element), stopping when a non match is detected.
###
Snippet from `checkHorizontalMatch`:
```javascript
    //check for matches moving left from current fruit
    for (n = j - 1; n > -1; n--) {
        if (board[i][n] !== 0 && board[i][n].color === fruit.color) {
            matchedFruit.push([i, n]);
        } else {
            //if the next one to the left doesn't match stop checking
            break;
        }
    }
    //check for matches moving right from current fruit
    for (n = j + 1; n < board[i].length; n++) {
        if (board[i][n] !== 0 && board[i][n].color === fruit.color) {
            matchedFruit.push([i, n]);
        } else {
            //if the next one to the right doesn't match stop checking
            break;
        }
    }
```
###
Before drawing the next piece, we check the `end conditions` of the game.  If a match was made, the score is incremented and checked against the highscore/win benchmark for the selected single player difficulty level (`5000` at easy, `10000` at medium, and `15000` at hard).  This check also increases the speed at which new pieces are dropped if a different score increment has been surpassed. If the player has won, an end screen is displayed with the options to `play again`, `change modes`, or `continue`.  Playing again wipes the board and score trackers and restarts the game loop for the same mode the previous game was in.  Changing modes takes the player back to the starting menu.  Continue is only available in sinlge player and allows the user to continue playing until they lose the game.
###
Losing the game simply involves allowing a stack to reach the rop of the board.  If no matches are found in that check stage, we check this end condition by looking to see if any cell in the top row of the board is occupied.  If so, the end screen is displayed, this time without the continue option.  If no win or lose is detected, the next piece is drawn and begins its descent across the board. 
###
In `two player mode`, there is no win condition.  Players trade off on the same board according to a `time interval`.  If one loses on their turn, the other wins.  At each increment of `500` points, the player is awarded a `power up` to make turns more survivable and encourage strategic play.   There are three power up options: removing a row, a column, and all instances of the same fruit.  Each accesses the board array and resets the cell values in order to do so.
###

Clearing a row:
``` javascript
function clearRow() {
    //clear rows only in the bottom half of board to ensure maximum helpfulness
    let rows = [7, 8, 9, 10, 11];
    let i = Math.floor(Math.random() * rows.length);
    let row = rows[i];
    for (j = 0; j < board[0].length; j++) {
        board[row][j] = 0;
    }
    checkClear();
}
```
###
Clearing a column:
``` javascript
function clearCol() {
    let j = Math.floor(Math.random() * board[0].length);
    for (i = 0; i < board.length; i++) {
        board[i][j] = 0;
    }
}
```
###
Clearing a color:
``` javascript
function clearColor() {
    let colors = [1, 2, 3, 4];
    let index = Math.floor(Math.random() * colors.length);
    let color = colors[index];
    for (i = 0; i < board.length; i++) {
        for (j = 0; j < board[0].length; j++) {
            if (board[i][j].color === color) {
                board[i][j] = 0;
            }
        }
    }
    checkClear();
}
```
### 
`clearRow` and `clearColor` each check for matches after completetion, as both may create gaps in the board which `fruitFall` will close and potentially form new three in a row matches. 

###
Player information is stored in its own class object, with values to track a wins, turns, power ups, and scores.  The game is controlled through DOM manipulation and event listeners, running primarily on `click` and `keydown` actions.  Rather than create and remove DOM elements, `inner text` is changed and a `hide` class in toggled to display each screen as needed in game play.
###

# Future Considerations

Should I return to this game in the future, I would look to deploy the following aspects:

## 2-Player Split Screen 

Rather than compete to not fill the same board as your opponent, two players could operate boards side by side and race to a high score win condition or simply battle it out for the highest score.  This would be easy to implement with the javascript I have written; however, my html set up would require some refactoring and restructuring.

## Animations

The focus of this week long endeavor has primarily been the functionality of the game. While a decent portion of time was put towards styling both the css and the html canvas graphics, I weighed the addition of transitions and animations slightly less than ensuring all modes could successfully be played and bugs were ironed out once projects were deployed, and before being presented. If I were to put more time, I would like to add small animations such as a pop when fruits are removed and a grow in of the end screen on win or lose.  
### 
The grow affect can be achieved using `key frames` and the `transform: scale()` property in css; however, this applies on element creation/loading.  Because I favored the manipulation of element text over element creation, I would need a different animation strategy or to reapproach my end screen display.  



