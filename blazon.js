
function blazon()
{
var editor = ace.edit("input_string");
var input_string = editor.getSession().getValue();
var input_string = input_string.toLowerCase();

var words = split_remove_white_space(input_string);

//document.getElementById("input").innerHTML=words;

//console.log("words: " +words.toString;)
var lexed_tokens = lexer(words);
var tokens_copy = lexed_tokens.slice(0);
console.log("tokens");
console.log(lexed_tokens);

var parse_tree = parse_function(lexed_tokens);
console.log("after parsing");
console.log(lexed_tokens);
console.log(tokens_copy);
document.getElementById("result").innerHTML= print_tree(parse_tree);

console.log(parse_tree);

var c=document.getElementById("canvas");
var ctx=c.getContext("2d");
ctx.lineWidth=5;

clip_shield(ctx);

draw_tree(new Array(new Point2D(25,25), new Point2D(25,625), new Point2D(625,625), new Point2D(625,25)), ctx, parse_tree);

//parse_tree.draw();

//var doleking = new ordinary("bend","bendy","diagonal bar going from upper left to lower right");
//console.log(doleking);


//console.log(tinctures[0].is_metal);
console.log("PIE!");

}

function clip_shield(ctx)
{
  ctx.beginPath();
  ctx.moveTo(25,25);

  for(var x =-300; x <= 300; x++)
  {
    ctx.lineTo((300+x)+25,625-(x*x)/500);
  }

  ctx.lineTo(625,25);
  ctx.lineTo(25,25);
  ctx.closePath();
  ctx.stroke();
  ctx.clip(); // Draw it
}

function print_tree(partition)
{
  var working_string = partition.description;

  working_string += " " +partition.linetype.description ;

  for(var x =0;  x<partition.tree.length; x++)
  {
    if(partition.tree[x].is_a === "tincture")
    {

      working_string+= ", coloured " + partition.tree[x].colour;
      if(partition.tree[x].charges.length > 0)
      working_string += " with " + partition.tree[x].charges[0].quantity + " ";
      for(var j = 0; j < partition.tree[x].charges.length; j++)
      {
        if (j > 0)
          {working_string += " and " + partition.tree[x].charges[j].quantity ;}
        working_string += " "  + partition.tree[x].charges[j].tincture.colour + " " + partition.tree[x].charges[j].description;
      }

    }
    else
    {
      //reccur
      working_string += " " + print_tree(partition.tree[x]);
    }

  }
  return working_string;
}


//recursive drawing function
function draw_tree(points,ctx,tree_section)
{
  console.log(tree_section);
  ctx.save();

  //save the current canvas state

  //clip the current area!

  ctx.beginPath();
  ctx.moveTo(points[0].x,points[0].y);
  
  for (var x =0; x < points.length; x++)
  {
    ctx.lineTo(points[x].x, points[x].y);
  }

  ctx.closePath();

  if(tree_section.is_a==="tincture")
  {
    ctx.save();

    console.log("Drawing tincture");
    tree_section.draw(ctx);

    for(var i =0; i < tree_section.charges.length; i++)    
    {
      draw_tree(points, ctx, tree_section.charges[i]);
    }

    ctx.restore();
  }
  else if(tree_section.is_a==="partition")
  {
    
    //ctx.clip();
    points = tree_section.draw(points,ctx);


    console.log("I'm a draw a pretty picture");
    for(var x =0;  x<tree_section.tree.length; x++)
    {
        draw_tree(points[x],ctx,tree_section.tree[x]);
    }

  }

  else{
    console.log("drawing charge");

    tree_section.draw(points, ctx, tree_section);
  }


  ctx.restore();

}


function tincture(tincture,colour,is_metal,hex)
{
  this.tincture=tincture;
  this.colour=colour;
  this.is_metal=is_metal;
  this.is_a = "tincture";
  this.charges = new Array();
  this.hex = hex;
  this.draw = function(ctx){ ctx.fillStyle=this.hex; ctx.fill(); ctx.lineWidth=1; ctx.strokeStyle=this.hex; ctx.stroke(); /* ctx.lineWidth=4; ctx.strokeStyle="#ffffff"; ctx.stroke();*/ } ;
}

function partition(blazon,description,sections,draw)
{
  this.blazon=blazon;
  this.description=description;
  this.sections=sections;
  this.linetype= new linetype("straight","");
  this.tree= new Array();
  //this.tree.length=this.sections; 
  this.is_a = "partition";
  this.draw = draw;
}
function clone_partition(p)
{
  var q = new partition(p.blazon,p.description,p.sections,p.draw);
  q.linetype = p.linetype;
  return q;
}
function ordinary(blazon,plural,description,draw)
{
  this.blazon=blazon;
  this.plural=plural;
  this.description=description;
  this.linetype= new linetype("straight","straight");
  this.tincture;
  this.is_a = "charge";
  this.draw=draw;
}

function clone_ordinary(given_ordinary)
{
  var tmp =  new ordinary(given_ordinary.blazon, given_ordinary.plural, given_ordinary.description);
  tmp.linetype = given_ordinary.linetype;
  tmp.tincture = given_ordinary.tincture;
  tmp.draw = given_ordinary.draw;
  return tmp;
}

function linetype(name,description)
{
  this.name=name;
  this.description=description;
}

function prefix(string,quantity)
{
  this.string=string;
  this.quantity=quantity;
}

// build a series of tokens to be parsed from the string given     
// also perform basic error checking
// bend, sinister -> 'bend sinister' needs to be handled as well

function lexer(strings)
{ 
  var words = strings;

  //define a series of look up tables

  // all the tinctures
  var tinctures = new Array(new tincture("azure","blue",false,"#003399"),new tincture("gules","red",false,"#CC0000"), new tincture("sable","black",false,"#000000"), new tincture("purpure","purple",false,"#990099"),new tincture("vert","green",false,"#339933"), new tincture("or","gold/yellow",true,"#FFCC00"),new tincture("argent","silver/white",true,"#E8E8E8"));

  
  var partitions = new Array(new partition("bend","split diagonally from upper left to lower right",2,draw_bend), new partition("fess","halved horizontally",2,draw_fess), new partition("pale","halved vertically",2,draw_pale), new partition("saltire","quartered diagonally like an x",4,draw_saltire), new partition("cross","divided into four quarters like a +",4,draw_cross), new partition("quarterly","divided into four quarters like a +",4), new partition("chevron","divided like a chevron a ^ shape",2), new partition("pall","divided into three parts in a Y shape",3) );

  var linetypes = new Array(new linetype("wavy","in a wavy pattern"), new linetype("indented","in a spikey pattern"), new linetype("invected","in a bumpy pattern"), new linetype("sengrailed","in an inverted bumpy pattern"), new linetype("nebuly","in a bloby pattern"), new linetype("embattled","in a square pattern"), new linetype("dovetailed","in a dovetail shape pattern"), new linetype("potenty","in a T shaped pattern"));

  var charge_prefixis = new Array( new prefix("a",1), new prefix("one",1), new prefix("two",2) ,new prefix("three",3), new prefix("four",4), new prefix("five",5),new prefix("six",6), new prefix("seven",7),new prefix("eight",8), new prefix("nine",9));

  var secondary_prefixis = new Array("between", "beneath");
  var ordinarys = new Array(new ordinary("bend","bendy","diagonal bar going from upper left to lower right",draw_ordinary_bend), new ordinary("bar","barry","horizontal bar",draw_ordinary_bar), new ordinary("pale","pallets","vertical bar",draw_ordinary_pale), new ordinary("saltire","","solid x shape",draw_ordinary_saltire), new ordinary("cross","","solid + shape",draw_ordinary_cross), new ordinary("chevron","chevronny","inverted V shape"), new ordinary("pall","","solid Y shape"), new ordinary("chief","","horizontal bar at the top of the field",draw_ordinary_chief), new ordinary("bordure","","solid border around the current field"), new ordinary("escutcheon","escutcheons","shield"), new ordinary("mullet","mullets","five poited star"), new ordinary("square","check","a square", draw_ordinary_square ) ,new ordinary("bee","bees","a bee", draw_image) );

  console.log("Right here mofo");
  console.log(ordinarys[0]);

  var tokens = new Array();

  // for each word
  for(var i=0; i<strings.length; i++)
  {

    // SYNTAX ANALYSIS (Small amonut)

    // check that party and parted are corectly followed by per
    if (words[i]==="party" || words[i]==="parted") 
    {
      if (words[i+1]!=="per") 
      {
        alert(words[i] + " must be followed by per.");
      }
    }

    //check that per is correctly followed by a partition
    if (words[i]==="per")
    {
      var is_partition = false
      for(var x = 0; x<partitions.length; x++)
      { 
        //console.log(partitions[x].blazon);
        //console.log(x);
        if (words[i+1]===partitions[x].blazon)
        {
          //console.log("true");
          is_partition= true;
        }
      }  
      if(!is_partition)
      {
        alert("The word following \"per\" must be a type of partition.");
      }  
    
      // should really have poped the per into a token but untill refactor this works
      
      // most hackey work around of all time but still...
      i++;

      // check that the word after the partition is either:
      // another partition 
      // a tincture
      // a fur 
      // a type of line for the division (ensure the next word is one of the above)

      // build tokens of line tpyes
      //console.log("build tokens of line types");
      for(var j=0; j<partitions.length; j++) 
      {
        //console.log(strings[i]);
        //console.log(partitions[j].blazon);

        if(words[i]===partitions[j].blazon)
        {
          if (words[i-1]!=="per") 
          {
            alert("Partitions must be prefixed by \"per\".");
            return;
          }  
          //create a new partition to be as a token for parsing
           var current_token = clone_partition(partitions[j]);
          // bend can be reversed with the postfix sinister
          if(words[i]=="bend" && words[i+1]=="sinister")
          {
            //concatonate sinister to the current charge
            words[i]="bend sinister";
            //remove the word at i + one (sinister)
            words.splice(i+1,1);
            current_token.blazon="bend sinister";
            current_token.description="split diagonally from upper right to lower left";
            current_token.draw = draw_bend_sinister;
            //console.log(words);
          }
          else
          {
            if(words[i+1]==="sinister")
            {
              alert("The postfix \"sinister\" can only be applied to bend");
            }  
          }
          var has_linetype = false;
          for(var x = 0; x < linetypes.length; x++)
          {
            if(words[i+1] === linetypes[x].name)
            {
              has_linetype = true;
              current_token.linetype= new linetype(linetypes[x].name,linetypes[x].description);
              console.log("generate token " + words[i] + " " + words[i+1] );
              words.splice(i,2);
            }
          }
          if(!has_linetype)
          {
            console.log("generate token " + words[i]);
            words.splice(i,1);
          }
          tokens.push(current_token);
          console.log(tokens.toString());
          i--; // move index back due to removing from array
        }//if words[i] is a partition
      }
    }


    //console.log("check for charges");
    // check for charges
    check_for_charges:
    for (var j=0; j< charge_prefixis.length; j++)
    {
      // if this word is a prefix
      if(words[i]===charge_prefixis[j].string)
      {
        console.log("prefix found \"" + words[i] + "\"");

        // the token we are going to build
        var current_token;

        // the next word an ordinary?
        var is_ordinary = false;
        for (var x = 0; x < ordinarys.length; x++)
        {
          if(words[i+1]===ordinarys[x].blazon || words[i+1]===(ordinarys[x].plural))
          {
            current_token = clone_ordinary(ordinarys[x]);
            current_token.quantity=charge_prefixis[j].quantity;
            if((words[i+1]==="bend" || words[i+1]==="bendy") && words[i+2]==="sinister" )
            {
              //concatonate sinister to the current charge
              words[i+1]="bend sinister";
              //remove the word at i + 2 (sinister)
              words.splice(i+2,1);
              current_token.blazon="bend sinister";
              current_token.description="split diagonally from upper right to lower left";
              current_token.draw = draw_ordinary_bend_sinister;
            }

            console.log("charge is an ordinary \""+ words[i+1]+ "\"");
            is_ordinary = true;
          }
        }


        // if the charge is an ordinary the next word can be either a line type
        // or a tincture or both
        if (is_ordinary)
        {
          console.log("charge is still an ordinary.");
          var valid_ordinary = false;
          //check if the next word is a tincture
          //console.log(words[i+2]);
          check_tincture:
          for (var x = 0; x < tinctures.length; x++)
          {
            //console.log(words[i+2]);
            //console.log(tinctures[x].tincture);
            if(words[i+2]===tinctures[x].tincture)
            {
              //console.log("tincture found " +tinctures[x].tincture);
              current_token.tincture = clone_tincture(tinctures[x]); 


              valid_ordinary = true;

              words.splice(i,3);
              i--;
              console.log(words.toString());
              break check_tincture;
            }
          }  
          //check for line tpye
          check_for_line_type:
          for(var x = 0; x < linetypes.length; x++)
          {
            if(words[i+2] === linetypes[x].name)
            {
              current_token.linetype=linetypes[x];

              // check for ticture after line type
              for (var x = 0; x < tinctures.length; x++)
              {
                if(words[i+3]==tinctures[x].tincture)
                {
                  current_token.tincture = clone_tincture(tinctures[x]); 
                  valid_ordinary = true;
                  console.log(words.toString());
                  words.splice(i,4);
                  i--;
                  console.log(words.toString());
                  break check_for_line_type;
                }
              }  

            }
          }//for
          if (valid_ordinary)
          {
            tokens.push(current_token);
            console.log(tokens);
            break check_for_charges;
          }
        }


        // If the next word isn't an ordinary then it may or may not be 
        // a semi formal charge in which case panic
        else //(!is_ordinary)
        {
          console.log("Non-ordinary charge");

          // keep going through the set of strings untill:
          // two tinctures or fus adjacent to each other 
          // a new partition
          // a new charge pre-fix

        }
      }
    }// check for charges

    // check for tinctures and furs remaining 
    var has_revemoved = false;
    for (var x = 0; x < tinctures.length; x++) {
      if (words[i]===tinctures[x].tincture) 
      {
        console.log(words.toString());
        console.log("found ticture " + tinctures[x].tincture)
        var current_token = clone_tincture(tinctures[x]); 
        tokens.push(current_token);
        words.splice(i,1);
        i--;
        console.log(words.toString());
        console.log(tokens);
        console.log(tokens[0]);
        
        break;
      }
    }//checking for tictures
  }//for loop

  return tokens;
}//lexing function


function clone_tincture(given_tincture)
{
  var tmp = new tincture(given_tincture.tincture, given_tincture.colour, given_tincture.is_metal, given_tincture.hex);
  //tmp.charges = given_tincture.charges;
  return tmp;
}


// Consturct a tree of partitions and fields for every token 
// if the blazon is valid the tree sould have no empty nodes
// partitions spawn branches tinctures are terminating nodes
// charges fit ontop of tinctures 
// peice of cake
function parse_function(tokens)
{

  // the "root" node for this tree is the shield itself 
  var escutcheon = new partition("escutcheon","A shield",1);
  escutcheon.draw = draw_escutcheon;
  //escutcheon.linetype = new linetype("none","");
  //console.log(escutcheon.tree.length);

  if(recursivly_constuct(tokens,escutcheon,escutcheon))
  {
    console.log("parsing sucsess");
  }  
  else
  {
    //alert("recursive constuct failure")
    return false;
  }
   if (tokens.length>0)
  {
    alert("More tinctures than fields");
    return false;
  }
  //console.log(escutcheon.tree.length);
  console.log("bob");
  console.log(escutcheon);
  return(escutcheon);
}
  

function recursivly_constuct(tokens,partition_pointer,root)
{
  // while this partition isn't full
  //console.log(tokens);
  console.log("partition_pointer.tree.length = " + partition_pointer.tree.length);
  console.log("parition_pointer.sections = " + partition_pointer.sections);
  while(partition_pointer.tree.length < partition_pointer.sections)
  {  
    console.log(root);
    if(tokens.length <= 0)
    {
      alert("Empty sections provide more tinctures!")
      return false;
    }
    if(tokens[0].is_a === "partition")
    {
      partition_pointer.tree.push(tokens[0]);
      //recure
      var tmp = tokens.shift();
      if(!(recursivly_constuct(tokens,tmp,root)))
      {
        return false;
      }  

    }
    else if(tokens[0].is_a==="tincture")
    {
    
      partition_pointer.tree.push(tokens.shift());
      console.log(root);
      var charge_index = 0;
      while(tokens.length > 0 && tokens[0].is_a==="charge")
      {
        partition_pointer.tree[partition_pointer.tree.length-1].charges[charge_index]=tokens.shift(); 
        if(partition_pointer.tree[partition_pointer.tree.length-1].charges[charge_index].tincture.is_metal == partition_pointer.tree[partition_pointer.tree.length-1].is_metal) 
        {
          alert("Rule of ticture broken.  No instances of metal on metal or colour on colour are allowed");
          return false;
        } 
        charge_index ++;       
      }
    }
    else if(tokens[0].is_a==="charge")
    {
      alert("Error, a charge can only be placed on a tictured field.");
      return false; 
    }
    else
    {
      alert("Errors, somthing has gone horribly wrong.");
      return false;
    }
  }//while
  return true;
}
// split a string into words removing any excess whitespace
function split_remove_white_space(x)
{

  x = x.replace(/(\r\n|\n|\r)/gm," ");
  var x = x.split(" ");

  // going backwards means you don't miss items when 
  // after removing them the array size changes

  
  for (var i=x.length; i>0 ;i--)
  { 
    if (x[i]==="") {
    
    x.splice(i,1);

  }
}

return x;
}


function find_mid_y(points)
{
  // find the mid point from the highest and lowest

  var miny = -1;
  var maxy = 9001;
  var high_point;
  var low_point;

  //because up is down in html5 canvases!!!!
  //this is going to read like its labling the points upside down
  for(var x =0; x < points.length; x++)
  {
    if(points[x].y < maxy)
    {
      maxy = points[x].y;
      high_point = points[x];
    }  
    if(points[x].y > miny) 
    {
      miny = points[x].y;
      low_point = points[x];
    }  
  }

  return miny - ((miny - maxy)/2);


}


function draw_fess(points,ctx)
{
  //mid point on y 
  var midy = find_mid_y(points);
  //from the top left most point determine if the line intersects with any of the other lines
  var new_fields = determine_new_fields(points,new Array(new Point2D(0,midy), new Point2D(800, midy)), 2);
  return new_fields;
}

//should be re-written to draw with passed points rather than hard coded values
function draw_escutcheon(points,ctx)
{
  ctx.beginPath();
  ctx.moveTo(points[0].x,points[0].y);
  for (var x =1; x < points.length; x++)
  {
    ctx.lineTo(points[x].x, points[x].y);
  }

  ctx.closePath();
  //ctx.stroke();
   
  return new Array(points);
} 

function find_mid_x(points)
{

  // find the mid point from the left most to the right most

  var maxx = -1;
  var minx = 9001;
  var left_point;
  var right_point;

  // for all points find the most extreem right and left 
  for(var x =0; x < points.length; x++)
  {
    if(points[x].x < minx)
    {
      minx = points[x].x;
      left_point = points[x];
    }  
    if(points[x].x > maxx) 
    {
      maxx = points[x].x;
      right_point = points[x];
    }  
  }

  //mid point on x 
  return maxx - ((maxx - minx)/2);

}



function draw_pale(points,ctx)
{
  var midx = find_mid_x(points);
  //from the top left most point determine if the line intersects with any of the other lines
  var new_fields = determine_new_fields(points,new Array(new Point2D(midx,0), new Point2D(midx,800)), 2);
  return new_fields;
}


function determine_new_fields(points,division_points,number_of_new_fields){

  // we know how many new fields are going to be generated form the type of partiton we were given

  //create a 2d array with a row for each new field
  var new_fields= new Array();
  for(var x =0; x < number_of_new_fields; x++)
  {
    new_fields.push(new Array());
  }

  console.log(new_fields);

  var current_field_index = 0;

  for(var i =0;i<points.length;i++)
  {
    console.log("work in progress fields");
    console.log(new_fields);

    var j = (i+1)%points.length;

    //console.log(i + "" + j);
    var intersect = Intersection.intersectLineLine(points[i], points[j], division_points[0], division_points[1]); 
    console.log(intersect);

    // if there has been an intersect
    if(intersect.points.length > 0)
    {
      if(intersect.points[0].x == points[i].x && intersect.points[0].y == points[i].y)
      {
        // push the current point
        new_fields[current_field_index].push(points[i]);
        current_field_index++; 
        current_field_index%=number_of_new_fields;
        new_fields[current_field_index].push(points[i]);
 
      } 
      else if (intersect.points[0].x == points[j].x && intersect.points[0].y == points[j].y)
      {
        new_fields[current_field_index].push(points[i]);
      }
      else
      {
        // the intersect isn't on a given point
        // push the current point
        new_fields[current_field_index].push(points[i]);
        // push the intersect into the current new boundry
        new_fields[current_field_index].push(intersect.points[0]);
        current_field_index++; 
        current_field_index%=number_of_new_fields;
        new_fields[current_field_index].push(intersect.points[0]);
      }
    }
    else
    {
      //add this point to the new field
      new_fields[current_field_index].push(points[i]);
    }
  }


  //console.log("Raw fields");
  //console.log(new_fields);
  for(var x = 0; x < new_fields.length; x++)
  {
    console.log(new_fields[x]);
    new_fields[x] = set_boundries(new_fields[x]);
    new_fields[x] = remove_duplicates(new_fields[x]);
  }

  //console.log("New fields");
  //console.log(new_fields);
  return new_fields;
}

function draw_cross(points,ctx)
{
  var tmp_fields = draw_pale(points,ctx);


  var intersect_points = new Array();
  // find the new points 
  for(var i=0;i<tmp_fields[1].length; i++)
    for(var j=0; j<tmp_fields[0].length; j++)
    {
      if((tmp_fields[1][i].x == tmp_fields[0][j].x) && (tmp_fields[1][i].y == tmp_fields[0][j].y))
        intersect_points.push(tmp_fields[1][i]);
    }

    intersect_points = set_boundries(intersect_points);

    var midy = ((intersect_points[0].y - intersect_points[1].y) /2.0) + intersect_points[1].y;
  
  console.log("new midy");
  console.log( midy);   

  var left_half = fess_on_midpoint(tmp_fields[0],ctx,new Point2D(0,midy));
  var right_half = fess_on_midpoint(tmp_fields[1],ctx,new Point2D(0,midy));

  var new_fields = left_half.concat(right_half);

  var tmp = new_fields[1];
  new_fields[1]=new_fields[2];
  new_fields[2]=tmp;


  console.log("cross result");
  console.log(new_fields);

  return new_fields;
}


function fess_on_midpoint(points,ctx,midpoint)
{
  var midy = midpoint.y;

  //from the top left most point determine if the line intersects with any of the other lines
  var new_fields = determine_new_fields(points,new Array(new Point2D(0,midy), new Point2D(800, midy)), 2);

  return new_fields;
}

function remove_duplicates(points)
{

  for(var i = 0; i < points.length; i++)
  {
    var j = (i+1) % points.length;
    if((points[i].x == points[j].x ) &&  (points[i].y == points[j].y))
    {
      points.splice(j,1);
    }
  }  
  return points;
}

function draw_saltire(points,ctx)
{
  // find the Incenter of the shape. :)
  var midy = points[0].y;
  var midx = points[0].x;


  for(var i =1; i < points.length; i++)
  {
    midy += points[i].y;
    midx += points[i].x;
  }
  
  midy = midy / points.length;
  midx = midx / points.length;



  ctx.beginPath();
  ctx.moveTo(0,(0+midy-midx));
  ctx.lineTo(9001,(9001+midy-midx));
  ctx.closePath();
  //ctx.stroke();

  var new_fields = determine_new_fields(points,new Array(new Point2D(0,0+midy-midx),new Point2D(9001,9001,+midy-midx)), 2);

  var tmp = sinister_on_midpoint(new_fields[0],ctx, new Point2D(midx,midy));
  new_fields = tmp.concat(sinister_on_midpoint(new_fields[1],ctx,new Point2D(midx,midy)));
  return new_fields;
}

function sinister_on_midpoint(points,ctx, midpoint)
{

    midy = midpoint.y;
    midx = midpoint.x;
    var yintersect = midy+midx;
    var xintersect = midy+midx;
    var new_fields = determine_new_fields(points,new Array(new Point2D(0, yintersect),new Point2D(xintersect,0)), 2);

    return new_fields;
}


function draw_bend(points,ctx)
{

  console.log("bend points");
  console.log(points);
  if(points.length==4)
  {
    ctx.beginPath();
    ctx.moveTo(points[0].x,points[0].y);
    ctx.lineTo(points[2].x,points[2].y);
    ctx.closePath();
    //ctx.stroke();
  
    //from the top left most point determine if the line intersects with any of the other lines
    //var new_fields = new Array( new Array(points[0],points[2],points[3]), new Array(points[0],points[1],points[2]));

    //FIX
    // Dear Tom from the past this has now been fixed
    // do not pity the fool for he has the mind of a jellyfish

    var new_fields = determine_new_fields(points,new Array(points[0],points[2]), 2);

    console.log("new bend bounds");
    console.log(new_fields);
    return new_fields;

  }
  else if(points.length == 3)
  {
    var centre = triangle_centre(points);
    midy = centre.y;
    midx = centre.x;

    ctx.beginPath();
    ctx.moveTo(0,(0+midy-midx));
    ctx.lineTo(9001,(9001+midy-midx));
    ctx.closePath();
    //ctx.stroke();

    var new_fields = determine_new_fields(points,new Array(new Point2D(0,0+midy-midx),new Point2D(9001,9001,+midy-midx)), 2);

    console.log("new bend bounds");
    console.log(new_fields);
    return new_fields;

  }
  else
  {
    // find the Incenter of the shape. :)
    var midy = points[0].y;
    var midx = points[0].x;


    for(var i =1; i < points.length; i++)
    {
      midy += points[i].y;
      midx += points[i].x;
    }
    
    midy = midy / points.length;
    midx = midx / points.length;



    ctx.beginPath();
    ctx.moveTo(0,(0+midy-midx));
    ctx.lineTo(9001,(9001+midy-midx));
    ctx.closePath();
    //ctx.stroke();

    var new_fields = determine_new_fields(points,new Array(new Point2D(0,0+midy-midx),new Point2D(9001,9001,+midy-midx)), 2);

    console.log("new bend bounds");
    console.log(new_fields);
    return new_fields;

  }
}

function draw_bend_sinister(points,ctx)
{

  console.log("bend sinister points");
  console.log(points);
  
  if(points.length==4)
  {
    ctx.beginPath();
    ctx.moveTo(points[1].x,points[1].y);
    ctx.lineTo(points[3].x,points[3].y);
    ctx.closePath();
    //ctx.stroke();
  
    //from the top left most point determine if the line intersects with any of the other lines
    //var new_fields = new Array( new Array(points[0],points[1],points[3]), new Array(points[3],points[1],points[2]));


    var new_fields = determine_new_fields(points,new Array(points[1],points[3]), 2);


    console.log("new bend sinister bounds");
    console.log(new_fields);
    return new_fields;

  }
  else if(points.length==3)
  {
    var centre = triangle_centre(points);

    var yintersect = centre.y+centre.x;
    var xintersect = centre.y+centre.x;

    ctx.beginPath();
    ctx.moveTo(0, yintersect);
    ctx.lineTo(xintersect,0);
    ctx.closePath();
    //ctx.strokeStyle="#00ffff"; ctx.stroke();
    //ctx.stroke();

    var new_fields = determine_new_fields(points,new Array(new Point2D(0, yintersect),new Point2D(xintersect,0)), 2);

    console.log("new bend sinister bounds");
    console.log(new_fields);
    return new_fields;

  }
  else 
  {

    // find the Incenter of the shape. :)
    var midy = points[0].y;
    var midx = points[0].x;


    for(var i =1; i < points.length; i++)
    {
      midy += points[i].y;
      midx += points[i].x;
    }
    
    midy = midy / points.length;
    midx = midx / points.length;
    console.log(midx +" x " + midy + " y " );

    //alert(midx);
    //alert(midy);

    // 

    var yintersect = midy+midx;
    var xintersect = midy+midx;

    ctx.beginPath();
    ctx.moveTo(0, yintersect);
    ctx.lineTo(xintersect,0);
    ctx.closePath();
    //ctx.strokeStyle="#00ffff"; ctx.stroke();
    //ctx.stroke();

    var new_fields = determine_new_fields(points,new Array(new Point2D(0, yintersect),new Point2D(xintersect,0)), 2);

    console.log("new bend sinister bounds");
    console.log(new_fields);
    return new_fields;



  }
}


/*
function order_boundries(boundries)
{
  //if atomic list then return
  if(boundries.length <=1)
  {
    return boundries;
  }
  //else split and reccur
  else
  {
    var left = new Array(); 
    var right = new Array();
    var middle = boundries.length/2;

    for(var x = 0; x < boundries.middle; x++)
    {
      left.push(boundries[x]);
    }
    for(var x = boundries.middle; x < boundries.length; x++)
    {
       right.push(boundries[x]);
    } 
    left = order_boundries(left);
    right = order_boundries(right);
    return merge(left,right);
  }
}

function merge(left, right)
{
  var merged_list= new Array();
  var left_index =0;
  var right_index =0;
  while(left.length > 0 && right.length > 0)
  {
    if(left[left_index][0].x < right[right_index][0].x)
    {
      result.push(left.splice(0,1));
      left_index++;
    }
    else
    {
      result.push(right.splice(0,1));
      right_index++;
    }

  }  
  while(left.length>0)
  {
    result.push(left.splice(0,1));
  }
  while(right.length>0)
  {
    result.push(right.splice(0,1));
  }

  console.log("return");
  console.log(result);
  return result;
}
*/


function triangle_centre(points)
{


  //all threee points 

  var midpoint = new Point2D((points[1].x + points[2].x)/2.0  , (points[1].y + points[2].y)/2.0)


  // off midpoints
  var x = points[0].x + 2.0/3.0*(midpoint.x - points[0].x);
  var y = points[0].y + 2.0/3.0*(midpoint.y - points[0].y);

  console.log(x);
  console.log(y);

  console.log("midpoint");
  console.log(midpoint);

  return new Point2D(x,y);


}


function set_boundries(points)
{
  console.log(points);
  //find the top left most point
  //again up is down 
  var miny = 9001;
  var minx = 9001;
  var max_index = -1;
  for(var i = 0; i < points.length; i++)
  {

    console.log(miny);
    console.log(points[i].y);
    if(points[i].y < miny)
    {
      miny = points[i].y;
      minx = points[i].x;
      max_index = i;
      console.log("swap");
      console.log("winner");
      console.log(miny);
    }
    else if(points[i].y == miny)
      if(points[i].x <= minx)
      {
  miny = points[i].y;
        minx = points[i].x;
        max_index = i;
        console.log("swap");
  console.log("winner");
  console.log(miny);
      }
  }  
  console.log("max_index");
  console.log(max_index);
  
  var tmp = new Array();
  for(var i = 0; i < points.length; i++)
  {
    tmp.push(points[((max_index + i)%points.length)]);
  }

  console.log("Wrong order points");
  console.log(points);
  console.log("Fixed order points");
  console.log(tmp);
  return tmp;

}


function draw_ordinary_bar(points,ctx, tree_section)
{

  //aproximate centre
  var miny = -1;
  var maxy = 9001;

  ctx.save();

  ctx.beginPath();


  for(var x =0; x < points.length; x++)
  {
    ctx.lineTo(points[x].x,points[x].y);
    console.log(points[x]);

    if(points[x].y < maxy)
    {
      maxy = points[x].y;
    }  
    if(points[x].y > miny) 
    {
      miny = points[x].y;
    }  
  }

  ctx.closePath();

  ctx.clip();

  var midy = miny - ((miny - maxy)/2);

  var thickness = (midy - maxy)/3;
  
  console.log(thickness);

  var bounds = new Array(new Point2D(0,midy+thickness), new Point2D(700,midy+thickness), new Point2D(700,midy-thickness), new Point2D(0,midy-thickness));
  console.log(bounds);

  draw_tree(bounds, ctx, tree_section.tincture);

  ctx.restore();
}

function draw_ordinary_chief(points,ctx, tree_section)
{

  //aproximate centre
  var miny = -1;
  var maxy = 9001;

  ctx.save();

  ctx.beginPath();

  for(var x =0; x < points.length; x++)
  {
    ctx.lineTo(points[x].x,points[x].y);
    console.log(points[x]);

    if(points[x].y < maxy)
    {
      maxy = points[x].y;
    }  
    if(points[x].y > miny) 
    {
      miny = points[x].y;   
    }  

  }

  ctx.closePath();

  ctx.clip();

  var midy = miny - ((miny - maxy)/2);
  var thickness = (maxy - midy)/3;
  
  var bounds = new Array(new Point2D(0,maxy), new Point2D(700,maxy), new Point2D(700,maxy-(2*thickness)), new Point2D(0,maxy-(2*thickness)));
  console.log(bounds);

  draw_tree(bounds, ctx, tree_section.tincture);

  ctx.restore();
}


function draw_ordinary_pale(points,ctx, tree_section)
{
 //aproximate centre
  var minx = -1;
  var maxx = 9001;

  ctx.save();

  ctx.beginPath();

  for(var x =0; x < points.length; x++)
  {
    ctx.lineTo(points[x].x,points[x].y);
    console.log(points[x]);

    if(points[x].x < maxx)
    {
      maxx = points[x].x;
    }  
    if(points[x].x > minx) 
    {
      minx = points[x].x;
    }  
  }

  ctx.closePath();

  ctx.clip();

  var midx = minx - ((minx - maxx)/2);

  console.log(midx);
  var thickness = (midx - maxx)/3;

  
  console.log(thickness);

  var bounds = new Array(new Point2D(midx+thickness,0), new Point2D(midx+thickness,700), new Point2D(midx-thickness,700), new Point2D(midx-thickness,0));
  console.log(bounds);

  draw_tree(bounds, ctx, tree_section.tincture);

  ctx.restore();
}

function draw_ordinary_cross(points,ctx, tree_section){

 //aproximate centre
  var minx = -1;
  var maxx = 9001;
  var miny = -1;
  var maxy = 9001;

  ctx.save();

  ctx.beginPath();

  for(var x =0; x < points.length; x++)
  {
    ctx.lineTo(points[x].x,points[x].y);
    console.log(points[x]);

    if(points[x].x < maxx)
    {
      maxx = points[x].x;
    }  
    if(points[x].x > minx) 
    {
      minx = points[x].x;
    }  
    if(points[x].y < maxy)
    {
      maxy = points[x].y;
    }  
    if(points[x].y > miny) 
    {
      miny = points[x].y;
    }  
  }

  ctx.closePath();
  ctx.clip();

  if(points.length==3)
  {
    var centre = triangle_centre(points);
    midy = centre.y;
    midx = centre.x;
    var thickness = (minx - maxx)/12;
  }
  else
  {
    var midy = miny - ((miny - maxy)/2);
    var midx = minx - ((minx - maxx)/2);
    console.log(midx);
    var thickness = (midx - maxx)/3;
  }
 
  console.log(thickness);

  var bounds = new Array(new Point2D(midx+thickness,0), new Point2D(midx+thickness,700), new Point2D(midx-thickness,700), new Point2D(midx-thickness,0));
  console.log(bounds);

  draw_tree(bounds, ctx, tree_section.tincture);

  var bounds = new Array(new Point2D(0,midy+thickness), new Point2D(700,midy+thickness), new Point2D(700,midy-thickness), new Point2D(0,midy-thickness));
  console.log(bounds);

  draw_tree(bounds, ctx, tree_section.tincture);

  ctx.restore();
}

function draw_ordinary_bend(points,ctx, tree_section)
{
  
  ctx.save();

  ctx.beginPath();

  //aproximate centre
  var minx = -1;
  var maxx = 9001;
  var miny = -1;
  var maxy = 9001;

  for(var x =0; x < points.length; x++)
  {
    ctx.lineTo(points[x].x ,points[x].y);
    console.log(points[x]);

    if(points[x].x < maxx)
    {
      maxx = points[x].x;
    }  
    if(points[x].x > minx) 
    {
      minx = points[x].x;

    }  
    if(points[x].y < maxy)
    {
      maxy = points[x].y;
    }  
    if(points[x].y > miny) 
    {
      miny = points[x].y;
    }      
  }

  ctx.closePath();

  ctx.clip();


  if(points.length == 3)
  {

    var centre = triangle_centre(points);
    midy = centre.y;
    midx = centre.x;

    var thickness = (minx - maxx)/12;
    
    var bounds = new Array(new Point2D(-1000-thickness,(-1000+midy-midx)), new Point2D(-1000+thickness,(-1000+midy-midx)), new Point2D(9001+thickness,(9001+midy-midx)), new Point2D(9001-thickness,(9001+midy-midx)));
    console.log(bounds);

    draw_tree(bounds, ctx, tree_section.tincture);

    ctx.restore();

  } 
  else 
  {


    var midy = miny - ((miny - maxy)/2);
    var midx = minx - ((minx - maxx)/2);

    // use intersections to determine more apporpriate thickness
    var tmp_intersectpoints = new Array();

    for(var i =0; i < points.length; i++)
    {
      var j = (i+1)%points.length;


      var intersect = Intersection.intersectLineLine(points[i], points[j],new Point2D(0,midy) ,new Point2D(1000, midy)); 
      console.log(intersect);


      // if there has been an intersect
      if(intersect.points.length > 0)
      {
        tmp_intersectpoints.push(intersect.points[0]);
      }
        
    }

    
    tmp_intersectpoints = set_boundries(tmp_intersectpoints);
    maxx = tmp_intersectpoints[0].x;
    minx = tmp_intersectpoints[1].x;
    var midx = minx - ((minx - maxx)/2);


    var thickness = (midx - maxx)/3;
   
    var bounds = new Array(new Point2D(-1000-thickness,(-1000+midy-midx)), new Point2D(-1000+thickness,(-1000+midy-midx)), new Point2D(9001+thickness,(9001+midy-midx)), new Point2D(9001-thickness,(9001+midy-midx)));
    console.log(bounds);

    draw_tree(bounds, ctx, tree_section.tincture);

    ctx.restore();

  }
}    




function draw_ordinary_bend_sinister(points,ctx, tree_section)
{

  //aproximate centre
  var minx = -1;
  var maxx = 9001;
  var miny = -1;
  var maxy = 9001;

  for(var x =0; x < points.length; x++)
  {
    ctx.lineTo(points[x].x ,points[x].y);
    console.log(points[x]);

    if(points[x].x < maxx)
    {
      maxx = points[x].x;
    }  
    if(points[x].x > minx) 
    {
      minx = points[x].x;

    }  
    if(points[x].y < maxy)
    {
      maxy = points[x].y;
    }  
    if(points[x].y > miny) 
    {
      miny = points[x].y;
    }      
  }

  console.log("Bend sinister charge being drawn");




  ctx.save();

  ctx.clip();

  if(points.length == 3)
  {

    var centre = triangle_centre(points);
    midy = centre.y;
    midx = centre.x;

    var thickness = (minx - maxx)/12;
    

    var yintersect = midy+midx;
    var xintersect = midy+midx;

    var bounds = new Array(new Point2D(0+thickness, yintersect),new Point2D(0-thickness, yintersect),new Point2D(xintersect-thickness,0),new Point2D(xintersect+thickness,0));

    console.log(bounds);

    draw_tree(bounds, ctx, tree_section.tincture);

    ctx.restore();



  }
  else{
    // find the Incenter of the shape. :)
    var midy = points[0].y;
    var midx = points[0].x;


    for(var i =1; i < points.length; i++)
    {
      midy += points[i].y;
      midx += points[i].x;
    }
    
    midy = midy / points.length;
    midx = midx / points.length;

    var tmp_intersectpoints = new Array();

    for(var i =0; i < points.length; i++)
    {
      var j = (i+1)%points.length;


      var intersect = Intersection.intersectLineLine(points[i], points[j],new Point2D(0,midy) ,new Point2D(1000, midy)); 
      console.log(intersect);


      // if there has been an intersect
      if(intersect.points.length > 0)
      {
        tmp_intersectpoints.push(intersect.points[0]);
      }
        
    }

    
    tmp_intersectpoints = set_boundries(tmp_intersectpoints);
    maxx = tmp_intersectpoints[0].x;
    minx = tmp_intersectpoints[1].x;
    var midx = minx - ((minx - maxx)/2);



    var yintersect = midy+midx;
    var xintersect = midy+midx;

    var thickness = (midx - maxx)/3;

    var bounds = new Array(new Point2D(0+thickness, yintersect),new Point2D(0-thickness, yintersect),new Point2D(xintersect-thickness,0),new Point2D(xintersect+thickness,0));

    console.log(bounds);

    draw_tree(bounds, ctx, tree_section.tincture);

  }


    ctx.restore();

}  


function draw_ordinary_saltire(points,ctx, tree_section){

  draw_ordinary_bend(points,ctx,tree_section);
  draw_ordinary_bend_sinister(points,ctx,tree_section);

}


function draw_ordinary_square(points,ctx, tree_section){

  //aproximate centre
  var minx = -1;
  var maxx = 9001;
  var miny = -1;
  var maxy = 9001;

  for(var x =0; x < points.length; x++)
  {
    ctx.lineTo(points[x].x ,points[x].y);
    console.log(points[x]);

    if(points[x].x < maxx)
    {
      maxx = points[x].x;
    }  
    if(points[x].x > minx) 
    {
      minx = points[x].x;

    }  
    if(points[x].y < maxy)
    {
      maxy = points[x].y;
    }  
    if(points[x].y > miny) 
    {
      miny = points[x].y;
    }      
  }

  if(points.length==3){

    var centre = triangle_centre(points);
    midy = centre.y;
    midx = centre.x;

    var thickness = (minx - maxx)/8;
    
    var bounds = new Array(new Point2D(midx+thickness, midy+thickness),new Point2D(midx+thickness, midy-thickness),new Point2D(midx-thickness, midy-thickness),new Point2D(midx-thickness, midy+thickness));
    bounds=set_boundries(bounds);

    draw_tree(bounds, ctx, tree_section.tincture);

    console.log("herp");
    console.log(bounds);
  }
  else
  {

  // work out thickness
    // find the Incenter of the shape. :)
    var midy = points[0].y;
    var midx = points[0].x;


    for(var i =1; i < points.length; i++)
    {
      midy += points[i].y;
      midx += points[i].x;
    }
    
    midy = midy / points.length;
    midx = midx / points.length;


    
    var tmp_intersectpoints = new Array();

    
   if(minx-maxx < miny-maxy)
   {
    for(var i =0; i < points.length; i++)
    {
      var j = (i+1)%points.length;


      var intersect = Intersection.intersectLineLine(points[i], points[j],new Point2D(0,midy) ,new Point2D(1000, midy)); 
      console.log(intersect);


      // if there has been an intersect
      if(intersect.points.length > 0)
      {
        tmp_intersectpoints.push(intersect.points[0]);
      }
        
    }

    
    tmp_intersectpoints = set_boundries(tmp_intersectpoints);
    maxx = tmp_intersectpoints[0].x;
    minx = tmp_intersectpoints[1].x;
    var midx = minx - ((minx - maxx)/2);

    var thickness = (midx - maxx)/1.5;
    var bounds = new Array(new Point2D(midx+thickness, midy+thickness),new Point2D(midx+thickness, midy-thickness),new Point2D(midx-thickness, midy-thickness),new Point2D(midx-thickness, midy+thickness));
  }
  else
  {
    for(var i =0; i < points.length; i++)
    {
      var j = (i+1)%points.length;


      var intersect = Intersection.intersectLineLine(points[i], points[j],new Point2D(midx,0) ,new Point2D(midx, 1000)); 
      console.log(intersect);


      // if there has been an intersect
      if(intersect.points.length > 0)
      {
        tmp_intersectpoints.push(intersect.points[0]);
      }
        
    }

    
    tmp_intersectpoints = set_boundries(tmp_intersectpoints);
    maxx = tmp_intersectpoints[0].y;
    minx = tmp_intersectpoints[1].y;
    var midy = miny - ((miny - maxy)/2);

    var thickness = (midy - maxy)/1.5;
    
    var bounds = new Array(new Point2D(midx+thickness, midy+thickness),new Point2D(midx+thickness, midy-thickness),new Point2D(midx-thickness, midy-thickness),new Point2D(midx-thickness, midy+thickness));
  }

  bounds = set_boundries(bounds);
  draw_tree(bounds, ctx, tree_section.tincture);
  console.log(bounds);
  }


  ctx.restore();

}


function draw_image(points,ctx, tree_section){

  //aproximate centre
  var minx = -1;
  var maxx = 9001;
  var miny = -1;
  var maxy = 9001;

  for(var x =0; x < points.length; x++)
  {
    ctx.lineTo(points[x].x ,points[x].y);
    console.log(points[x]);

    if(points[x].x < maxx)
    {
      maxx = points[x].x;
    }  
    if(points[x].x > minx) 
    {
      minx = points[x].x;

    }  
    if(points[x].y < maxy)
    {
      maxy = points[x].y;
    }  
    if(points[x].y > miny) 
    {
      miny = points[x].y;
    }      
  }

  if(points.length==3){

    var centre = triangle_centre(points);
    midy = centre.y;
    midx = centre.x;

    var thickness = (minx - maxx)/8;
    
    var bounds = new Array(new Point2D(midx+thickness, midy+thickness),new Point2D(midx+thickness, midy-thickness),new Point2D(midx-thickness, midy-thickness),new Point2D(midx-thickness, midy+thickness));
    bounds=set_boundries(bounds);

    //draw_tree(bounds, ctx, tree_section.tincture);

    console.log("herp");
    console.log(bounds);
  }
  else
  {

  // work out thickness
    // find the Incenter of the shape. :)
    var midy = points[0].y;
    var midx = points[0].x;


    for(var i =1; i < points.length; i++)
    {
      midy += points[i].y;
      midx += points[i].x;
    }
    
    midy = midy / points.length;
    midx = midx / points.length;


    
    var tmp_intersectpoints = new Array();

    
   if(minx-maxx < miny-maxy)
   {
    for(var i =0; i < points.length; i++)
    {
      var j = (i+1)%points.length;


      var intersect = Intersection.intersectLineLine(points[i], points[j],new Point2D(0,midy) ,new Point2D(1000, midy)); 
      console.log(intersect);


      // if there has been an intersect
      if(intersect.points.length > 0)
      {
        tmp_intersectpoints.push(intersect.points[0]);
      }
        
    }

    
    tmp_intersectpoints = set_boundries(tmp_intersectpoints);
    maxx = tmp_intersectpoints[0].x;
    minx = tmp_intersectpoints[1].x;
    var midx = minx - ((minx - maxx)/2);

    var thickness = (midx - maxx)/1.5;
    var bounds = new Array(new Point2D(midx+thickness, midy+thickness),new Point2D(midx+thickness, midy-thickness),new Point2D(midx-thickness, midy-thickness),new Point2D(midx-thickness, midy+thickness));
  }
  else
  {
    for(var i =0; i < points.length; i++)
    {
      var j = (i+1)%points.length;


      var intersect = Intersection.intersectLineLine(points[i], points[j],new Point2D(midx,0) ,new Point2D(midx, 1000)); 
      console.log(intersect);


      // if there has been an intersect
      if(intersect.points.length > 0)
      {
        tmp_intersectpoints.push(intersect.points[0]);
      }
        
    }

    
    tmp_intersectpoints = set_boundries(tmp_intersectpoints);
    maxx = tmp_intersectpoints[0].y;
    minx = tmp_intersectpoints[1].y;
    var midy = miny - ((miny - maxy)/2);

    var thickness = (midy - maxy)/1.5;
    
    var bounds = new Array(new Point2D(midx+thickness, midy+thickness),new Point2D(midx+thickness, midy-thickness),new Point2D(midx-thickness, midy-thickness),new Point2D(midx-thickness, midy+thickness));
  }

  bounds = set_boundries(bounds);
  //draw_tree(bounds, ctx, tree_section.tincture);
  console.log(bounds);
  }


  var img=document.getElementById("bee");
  img.height=(midx+thickness- midx-thickness);
  img.height=(midx+thickness- midx-thickness);

  ctx.drawImage(img,midx-thickness,midy-thickness);



  ctx.restore();

}

