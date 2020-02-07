//import UniHanDB from "./data/unihan.json"
//const UniHanTypes = ("Nop Mandarin Cantonese Definition Hangul HanyuPinlu HanyuPinyin JapaneseKun JapaneseOn Korean Tang Vietnamese XHC1983 CompatibilityVariant SemanticVariant SimplifiedVariant SpecializedSemanticVariant TraditionalVariant ZVariant Cangjie CheungBauer CihaiT Fenn FourCornerCode Frequency GradeLevel HDZRadBreak HKGlyph Phonetic TotalStrokes CangjieRadical").split(" ");

//let UniHanDB = {};

let UniHanDB = null;

function readUnihanDb() {
  const request_url = "https://chinesecharconv.s3-ap-northeast-1.amazonaws.com/unihan.json";
  const req = new XMLHttpRequest();
  req.open('GET', request_url);
  req.responseType = 'json';
  req.onload = function() {
    UniHanDB = JSON.parse(req.response);
  };
  req.send();
}

function getUnihanDB() {
  if (UniHanDB === null) {
    readUnihanDb();
  }
  return UniHanDB;
}
function UniHanTypeId (typestr) {
  //return UniHanTypes.indexof(typestr);
  getUnihanDB();
  return UniHanDB.syms.indexof(typestr);
}

function getEachCharData(str, type) {
  const typeid = UniHanTypeId(type);
  const uhdb = getUnihanDB();
  if (typeid == -1) {
     console.log("Unknown type : ", type);
     return;
  }
  str.split("").map(function(char) {
    if (uhdb[char] === undefined || uhdb[char][typeid] === undefined) {
      return [char];
    }
    return [char, uhdb[char][typeid]];
  });
}

function modifyVariant(str, type) {
  const typeid  = UniHanTypeId(type);
  const uhdb = getUnihanDB();
  str.split("").map(function(char) {
    if (uhdb[char] === undefined || uhdb[char][typeid] === undefined) {
      return char;
    }
  });
}

window.parseAndUpdateText = function parseText(convTo) {
  let text = document.f1.txt.value;
  const modifier = document.f1.modifier.value;
  const showAsRuby = document.f1.printruby.value;
  console.log("formval", text, modifier, showAsRuby);

  if (modifier == "Simplified") {
    text = modifyVariant(text, "SimplifiedVariant");
  } else if (modifier == "Traditional") {
    text = modifyVariant(text, "TraditionalVariant");
  }

  const converted = getEachCharData(text, convTo);
  let toHtml = null;
  if (showAsRuby) {
    toHtml = function(c) {
      return "<ruby>" + c[0] +  "<rp>(</rp><rt>" + c[1] + "</rt><rp>)</rp></ruby>";
    }
  } else {
    toHtml = c[0] + "(" + c[1] + ")";
  }

  const areaConvResult = document.getElementById("conv_result");
  areaConvResult.innerHtml = converted.map(e => toHtml(e)).join("");
}
