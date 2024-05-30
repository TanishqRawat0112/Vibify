console.log("Vibify : Vibe with Me!!");
let currentsong=new Audio();

let songs;
let currFolder;
let mainF;

function secondsToMinutesSeconds(timeInSeconds) {
    if(isNaN(timeInSeconds)||timeInSeconds<0){
        return " 00:00"
    }
    // Calculate minutes and seconds
  const totalSeconds = Math.floor(timeInSeconds);
//   const totalMilliseconds = Math.round((timeInSeconds - totalSeconds) * 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  // Convert to string format with leading zeros
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  // Concatenate and return the result
  return `${formattedMinutes}:${formattedSeconds}`;
  }

async function getSongs(folder){
    currFolder=folder;
    let a=await fetch(`/${folder}/`);
    let response = await a.text();
    let div=document.createElement("div");
    div.innerHTML = response;
    let as=div.getElementsByTagName("a");
     
    songs=[];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mpeg")){
            let entry=element.href.split(`/${folder}/`)[1];
            entry=entry.split(".mpeg")[0];
            // let temp=[];
            // temp=entry.split("%20");
            // entry=temp.join(' ');
            songs.push(entry);
        }
    }
    //Show all the songs in the playlist:
    let songUL= document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML="";
    for (const song of songs) {
        songUL.innerHTML=songUL.innerHTML + `<li> 
        <img class="invert" src="images/music.svg" alt="Music">
        <div class="info">
        <div class="songname">${song.replaceAll("%20"," ").split("-")[0]}</div>
        <div class="artistname">${song.replaceAll("%20"," ").split("-")[1]}</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
        <img class="invert" src="images/play-song.svg" alt="play">
        </div></li>`;
    }

    //Attach an event listener to each song:
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click",(element)=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim()+"-"+e.querySelector(".info").children[1].innerHTML.trim());
        })
    });

    return songs;
}

const playMusic = (track,pause=false)=>{
    // let audio = new Audio("/Spotify Clone WebApp/songs/"+track+".mpeg");
    currentsong.src = `/${currFolder}/`+track+".mpeg";
    if(pause==false){
        currentsong.play();
        play.src="images/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums(){
    let a=await fetch(`/songs/`);
    let response = await a.text();
    let div=document.createElement("div");
    div.innerHTML = response;
    let anchors=div.getElementsByTagName("a");
    let cardContainer=document.querySelector(".cardContainer");
    
    let array=Array.from(anchors);
    
        for (let index = 0; index < array.length-1; index++) {
            const e = array[index];
        if(e.href.includes("/songs")){   
            let folder =e.href.split("/").slice(-2)[0];
            //Get the meta data for the folder:
            let a=await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            
            cardContainer.innerHTML=cardContainer.innerHTML + `<div data-folder="${folder}" class="card rounded">
            <div class="play">
                <img width="50" height="50" src="images/play.svg" alt="play">
            </div>
            <img src="\ songs/${folder}/cover.jpeg"
                alt="card1">
            <h2 class="cardHeading">${response.heading}</h2>
            <p class="cardCaption">${response.title}</p>
        </div>`
        }
    }
    let fdr="eng";
    //Add an event listener on the card to load the playlist:
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item=>{
            fdr=item.currentTarget.dataset.folder;
            songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0].replaceAll("%20"," "));
        })
    });

     //Add en event listener to previous button:
     previous.addEventListener("click",()=>{
        let index = songs.indexOf(currentsong.src.split(`/${fdr}/`)[1].split(".mpeg")[0]);
        if(index-1<0){
            index=songs.length;
        }
        let nextSong=songs[index-1].replaceAll("%20"," ");
        playMusic(nextSong);
    })

    //Add en event listener to NEXT button:
    next.addEventListener("click",()=>{
        let index = songs.indexOf(currentsong.src.split(`/${fdr}/`)[1].split(".mpeg")[0]);
        if(index+1>songs.length-1){
            index=-1;
        }
        let nextSong=songs[index+1].replaceAll("%20"," ");
        playMusic(nextSong);
    })

    //Adding the functionality to automatically change the song whnever the song ends:
    currentsong.addEventListener("ended",()=>{
        console.log(currentsong.currentTime,currentsong.duration);
        let index = songs.indexOf(currentsong.src.split(`/${fdr}/`)[1].split(".mpeg")[0]);
        if(index+1>songs.length-1){
            index=-1;
        }
        let nextSong=songs[index+1].replaceAll("%20"," ");
        playMusic(nextSong);
    });
}

async function main() {
    document.querySelector(".range").getElementsByTagName("input")[0].value=100;
    //Getting the list of all the songs
    mainF="songs/eng"
    await getSongs(mainF);
    playMusic(songs[0].replaceAll("%20"," "),true);

    //Display all the albums on the page:
    displayAlbums();

    //Attach previous, play and next to each song:
    // let play=document.getElementById("play");
    play.addEventListener("click",()=>{
        if(currentsong.paused){
            currentsong.play();
            play.src="images/pause.svg";
        }
        else{
            currentsong.pause();
            play.src="images/play-song.svg";
        }
    })

    //Listen for time update event:
    currentsong.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerHTML= `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left= (currentsong.currentTime/currentsong.duration) * 100 + "%";

        //add an event listener to seekbar:
        document.querySelector(".seekbar").addEventListener("click",e=>{
            let percent=(e.offsetX/e.target.getBoundingClientRect().width)* 100;
            document.querySelector(".circle").style.left= percent + "%";
            currentsong.currentTime=(currentsong.duration)/100*percent;
        })
    })

    //add an event listener to the hamburger button:
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0%";
    })

    //add event listener to the close button:
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-150%";
    })

   

    //add an event listener to volume:
    let vol=100;
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentsong.volume=parseInt(e.target.value)/100;
        vol=parseInt(e.target.value);
        if(vol==0){
            volume.src="images/mute.svg";
        }
        if(vol>0 && vol <=50){
            volume.src="images/volume-less.svg";
        }
        if(vol>50){
            volume.src="images/volume.svg";
        }
    })


    //My personal feature to mute-unmute the volume and the change the buttons with just one single click:
    volume.addEventListener("click",()=>{
        if(currentsong.volume>0){
            currentsong.volume=0;
            volume.src="images/mute.svg";
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else if(currentsong.volume==0){
            if(vol>50){
                currentsong.volume=vol/100;
                volume.src="images/volume.svg";
                document.querySelector(".range").getElementsByTagName("input")[0].value=vol;
            }
            else if(vol>0 && vol<=50){
                currentsong.volume=vol/100;
                volume.src="images/volume-less.svg";
                document.querySelector(".range").getElementsByTagName("input")[0].value=vol;
            }
            else{
                currentsong.volume=1;
                volume.src="images/volume.svg";
                document.querySelector(".range").getElementsByTagName("input")[0].value=100;
            }
        }
    })

    
}

main();

