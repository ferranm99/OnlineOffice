//this script is in charge of editing and updating the canvas 
  
var sprites_path = ["sprites/man1.png", "sprites/man2.png", "sprites/man3.png", "sprites/man4.png", "sprites/woman1.png", "sprites/woman2.png", "sprites/woman3.png", "sprites/woman4.png"];

var mouseposition = [0,0];

//linear interpolation between two values
function lerp(a,b,f)
{
	return a * (1-f) + b * f;
}


function getMousePosition(event) {
    
  var rect = canvas.getBoundingClientRect();

  mouseposition[0] =  event.clientX - rect.left;
  mouseposition[1] =  event.clientY - rect.top;
  
  var msg = {
    type: "move",
    positionX: mouseposition[0],
    positionY: mouseposition[1],
    userid: my_id
                    
    };

                
    socket.send(JSON.stringify(msg));

  
}

document.getElementById('myCanvas').addEventListener("click", getMousePosition);



var imgs = {};

//example of images manager
function getImage(url) {
	//check if already loaded
	if(imgs[url])
		return imgs[url];


	//if no loaded, load and store
	var img = imgs[url] = new Image();
	img.src = url;
	return img;
}


var idle = [0];
var walking = [2,3,4,5,6,7,8,9];

function renderAnimation( ctx, image, anim, x, y, scale, offset, flip )
{
	offset = offset || 0;
	var t = Math.floor(performance.now() * 0.001 * 10);
	renderFrame( ctx, image, anim[ t % anim.length ] + offset, x,y,scale,flip);
}

function renderFrame(ctx, image, frame, x, y, scale, flip)
{
	var w = 32; //sprite width
	var h = 64; //sprite height
	scale = scale || 1;
	var num_hframes = image.width / w;
	var xf = (frame * w) % image.width;
	var yf = Math.floor(frame / num_hframes) * h;
	ctx.save();
	ctx.translate(x,y);
	if( flip )
	{
		ctx.translate(w*scale,0);
		ctx.scale(-1,1);
	}
	ctx.drawImage( image, xf,yf,w,h, 0,0,w*scale,h*scale );
	ctx.restore();
}


//DRAW
function draw() {
    
    var parent = canvas.parentNode;
	var rect = parent.getBoundingClientRect();
	canvas.width = rect.width;
	canvas.height = canvas.width*827/1209;

    
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    //clear rect
    ctx.clearRect(0,0,canvas.width, canvas.height);

    //background image
    var img = getImage("images/offices.png");
    ctx.drawImage( img, 0,0,canvas.width, canvas.height );
    
    //sprite drawing
    var spriteimg = getImage(sprites_path[my_avatar]);
    
    renderAnimation( ctx, spriteimg, walking, posX, posY, 2, 0, 0 );
    
    for(i = 0; i < usuarios.length; i++){
        
        var useravatar = getImage(sprites_path[usuarios[i].avatar]);
        
        renderAnimation( ctx, useravatar, walking, usuarios[i].positionX, usuarios[i].positionY , 2, 0, 0 );
        
    }
    
}

//UPDATE

function update(delta_t){
    //update MY position
    posX = lerp( posX,mouseposition[0], delta_t ); 
    posY = lerp( posY,mouseposition[1], delta_t ); 
    
    //update OTHERS positions
    for(i =0; i< usuarios.length ; i++){
        usuarios[i].positionX = lerp(  usuarios[i].positionX, usuarios[i].destinyX, delta_t ); 
        usuarios[i].positionY = lerp(  usuarios[i].positionY, usuarios[i].destinyY, delta_t ); 
    }
    
}

    
var last = performance.now();

function loop()
{
   draw();


   //to compute seconds since last loop
   var now = performance.now();
   //compute difference and convert to seconds
   var elapsed_time = (now - last) / 1000; 
   //store current time into last time
   last = now;

   //now we can execute our update method
   update( elapsed_time );

   //request to call loop() again before next frame
   requestAnimationFrame( loop );
}

//start loop
loop();
