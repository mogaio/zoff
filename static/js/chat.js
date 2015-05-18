var blink_interval;
var blink_interval_exists = false;
var unseen = false;

function chat(data)
{
  if(data.value.length > 150)
    return;
  if($(".tab a.active").attr("href") == "#all_chat")
    socket.emit("all,chat", data.value);
	else
    socket.emit("chat", data.value);
  data.value = "";
  return;
}

document.getElementById("chat-btn").addEventListener("click", function(){
    console.log("clicked");
    $("#text-chat-input").focus();
    //$("#chat-btn").css("color", "white");
    $("#chat-btn i").css("opacity", 1);
    clearInterval(blink_interval);
    blink_interval_exists = false;
    unseen = false;
    $("#favicon").attr("href", "static/images/favicon.png");
});

$(".chat-tab").click(function(){
    $("#text-chat-input").focus();
});

socket.on("chat.all", function(inp)
{
  data = inp[0];

  if($("#chat-bar").position()["left"] != 0)
  {
    //$("#chat-btn").css("color", "grey");
    if(!blink_interval_exists)
    {
      $("#favicon").attr("href", "static/images/highlogo.png");
      blink_interval_exists = true;
      unseen = true;
      blink_interval = setInterval(chat_blink, 2000);
    }
  }else if(document.hidden)
  {
    $("#favicon").attr("href", "static/images/highlogo.png");
    unseen = true;
  }
  var color = intToARGB(hashCode(data.substring(0,data.indexOf(": ")))).substring(0,6);
	$("#chatall").append("<li title='"+inp[1]+"'><span style='color:"+color+";'>"+data.substring(0,data.indexOf(": "))+"</span></li>");
  var in_text = document.createTextNode(data.substring(data.indexOf(": ")));
  $("#chatall li:last")[0].appendChild(in_text);
  document.getElementById("chatall").scrollTop = document.getElementById("chatall").scrollHeight
});

$(window).focus(function(){
  if(unseen)
  {
    $("#favicon").attr("href", "static/images/favicon.png");
    unseen = false;
  }
});

socket.on("chat,"+chan.toLowerCase(), function(data)
{
  if($("#chat-bar").position()["left"] != 0)
  {
    if(data.indexOf(":") >= 0){
      //$("#chat-btn").css("color", "grey");
      if(!blink_interval_exists)
      {
        $("#favicon").attr("href", "static/images/highlogo.png");
        blink_interval_exists = true;
        blink_interval = setInterval(chat_blink, 2000);
      }
    }
  }
  var color = intToARGB(hashCode(data.substring(0,data.indexOf(": ")))).substring(0,6);
	$("#chatchannel").append("<li><span style='color:"+color+";'>"+data.substring(0,data.indexOf(": "))+"</span></li>");
  var in_text = document.createTextNode(data.substring(data.indexOf(": ")));
  $("#chatchannel li:last")[0].appendChild(in_text);
  document.getElementById("chatchannel").scrollTop = document.getElementById("chatchannel").scrollHeight
});

function chat_blink()
{
  $("#chat-btn i").css("opacity", 0.5);
  setTimeout(function(){$("#chat-btn i").css("opacity", 1);}, 1000);
}

function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToARGB(i){
    return ((i>>24)&0xFF).toString(16) +
           ((i>>16)&0xFF).toString(16) +
           ((i>>8)&0xFF).toString(16) +
           (i&0xFF).toString(16);
}