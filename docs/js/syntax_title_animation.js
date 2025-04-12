// Run the action when we are sure the DOM has been loaded
function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        // `DOMContentLoaded` already fired
        action();
    }
}

var doAnimation = true;

const alternativeTitles = ['Syntax Puzzles',
                           'Puzzling Syntax',
                           'Puzzles for Syntax'];
                           

whenDocumentLoaded(() => {
    const section = document.getElementById("order-row-intro")
    
    // Create options for Observer:
    const options = {
        rootMargin: '100px 0px',
        threshold: [0.25, 0, 0.25, 0]
    }

    var id = null;
    const pauseFrames = 20;

    let observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
                doAnimation = true;
                let titleElement = document.getElementById('syntax-puzzles-title');
                
                let index = 0;
                let letterIndex = 1;
                let directionRight = true;
                let pauseFrameCounter = 0;
                let pause = false;
                let showCursor = true;

                clearInterval(id);
                id = setInterval(changeTitleFrame, 100);

                function changeTitleFrame(){

                    if (pause){
                        pauseFrameCounter += 1;

                        if (!showCursor) {
                            titleElement.innerText = alternativeTitles[index].slice(0, letterIndex);
                        } else {
                            titleElement.innerText = alternativeTitles[index].slice(0, letterIndex);
                            titleElement.innerHTML += '<b> | <b>';
                        }

                        if ((pauseFrameCounter % 4) == 0) showCursor = !showCursor;
                    } else {
                        titleElement.innerText = alternativeTitles[index].slice(0, letterIndex);
                        titleElement.innerHTML += '<b> | <b>';
                        
                        if (directionRight) letterIndex += 1;
                        else letterIndex -= 1;

                        if (letterIndex > alternativeTitles[index].length){
                            letterIndex -= 1;
                            directionRight = false;
                            pause = true;
                        }

                        if (letterIndex <= 0){
                            directionRight = true;
                            index += 1;
                        }

                        if (index >= alternativeTitles.length) index = 0;
                    };

                    if (pauseFrameCounter > pauseFrames){
                        pauseFrameCounter = 0;
                        pause = false;
                    }
                }
            } else {
                doAnimation = false;
                clearInterval(id);
                // console.log("Inactive")
            }
        })
    }, options)
  
  // Iterate over each queried el, and add observer:
    observer.observe(section)
});