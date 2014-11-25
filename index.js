#!/usr/bin/node

var to_array=require("to_array");
var promise=require("simple_promise");
var fs=require("fs");
var colors=require("colors");
var gamma=require("gamma");

var object_copy=function(o){
  var no={};
  for(k in o){
    no[k]=o[k];
  }
  return no;
};

String.prototype.padLeft=function(n){
  var c=this.toString();
  for(var i=this.length;i<n;i++)
    c=" "+c;
  return c;
  };
Array.prototype.__defineGetter__("last",function(){
  return this[this.length-1];
});
var format_number=function(n){

};

var alphabet=function(){
  var letters="";
  for(var i="a".charCodeAt(0);i<="z".charCodeAt(0);i++){
    letters+=String.fromCharCode(i);
    }
  return letters;
  }

var letter_list=function(win){
  win=win.toLowerCase();
  var alpha=alphabet();
  var l_list=[];
  for(var i=0;i<alpha.length;i++){
    if(win.indexOf(alpha[i])>=0){
      l_list.push(alpha[i]);
    }
  }
  return l_list;
};
var score_list=function(l_list){  
  var score=0;
  var current="a".charCodeAt(0)-1;
  for(var i=0;i<=l_list.length;i++){
    var next;
    if(l_list[i]!=undefined)
      next=l_list[i].charCodeAt(0);
    else
      next="z".charCodeAt(0)+1;
    if(next-current<0)
      throw new Error("negative in list "+JSON.stringify(l_list)+" at index "+i);
    var dist=(next-current)+1;
    score+=gamma(dist+3);
    current=next;
  }
  return Math.round(score);
};
var exp=function(n){
  return Math.pow(3,n);
};

var factorial=function(n){
  if(n<0||parseInt(n)!=n)throw new Error("negative");
  if(n==0)
    return 1;
  return n*factorial(n-1);
};


var in_file=fs.createReadStream("words-en.txt");
var out_file=fs.createWriteStream("words-en.out.txt");


var mbuffer="";
var scored_dict=[];
in_file.on("data",function(data){
  mbuffer+=data.toString();
  console.log("data"+mbuffer.length);
  var lines=mbuffer.split("\n");
  mbuffer=lines.last;
  for(var i=0;i<lines.length-1;i++){
    line=lines[i].trim();
    if(line=="")
      continue;
    var wrd=line;
    var l_list=letter_list(wrd);
    var score=score_list(l_list);
    scored_dict.push({wrd:wrd.padLeft(26),score:score,letters:l_list});
    out_file.write(JSON.stringify(scored_dict.last)+"\n");
    var d_copy=object_copy(scored_dict.last);
    var color_word=d_copy.wrd;delete d_copy.wrd;
    d_copy.score=d_copy.score.toString().padLeft(26);
    console.log(color_word.blue+" "+JSON.stringify(d_copy));
  }
});

in_file.on("end",function(){
  console.log("end calcs\nsorting");
  out_file.end();
  scored_dict.sort(function(a,b){
    return a.score-b.score;
  });
  console.log("sorting done\nwriting");
  var sorted_file=fs.createWriteStream("words-en.out.sort.txt");
  scored_dict.forEach(function(o){
    var alt_o=object_copy(o);
    alt_o.score=alt_o.score.toString().padLeft(26);
    sorted_file.write(JSON.stringify(alt_o)+"\n");
  });
  sorted_file.end();
});
