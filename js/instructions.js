instructions = "Move the falling clusters across the board to match fruit and collect points.  Careful, if your fruit basket gets too full its game over!<br/><br/>Use the " + 'left'.bold() + " and " + 'right'.bold() + " arrow keys to navigate the falling pieces side to side on the board.  " + 'Up'.bold() + " and " + 'down'.bold() + " arrow keys can be used to rotate the group as it falls.  If you've got the piece where you want it, you can press " + 'shift'.bold() + " to speed up its descent.  Once the piece reaches the bottom, its position is locked, so consider yourself warned.<br/><br/>Horizontal and Vertical matches of 3 or more will be cleared and tallied. The game is won when you reach a point ceiling, dictated by your difficulty level.  Want to just play until you lose? Click the continue button after the high score is reached to continue in " + 'Zen Mode'.bold() + "<br/><br/>In " + 'Two Player Mode'.bold() + ", you and your opponent will switch off playing the same board.  If you lose on your turn, the other player wins.  Be smart and be strategic, good playing will earn you bonuses to help survive your turn. ";

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('help').addEventListener('click', function() {
        document.getElementById('helpScreen').classList.toggle('hide');
        document.getElementById('startScreen').classList.toggle('hide');
        document.getElementById('instructions').innerHTML = instructions;
    })

    document.getElementById('return').addEventListener('click', function() {
        document.getElementById('helpScreen').classList.toggle('hide');
        document.getElementById('startScreen').classList.toggle('hide');
    })
})