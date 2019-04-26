
var stringProps = ("charAt charCodeAt indexOf lastIndexOf substring substr slice trim trimLeft trimRight " +
  "toUpperCase toLowerCase split concat match replace search").split(" ");
var arrayProps = ("length concat join splice push pop shift unshift slice reverse sort indexOf " +
  "lastIndexOf every some filter forEach map reduce reduceRight ").split(" ");
var funcProps = "prototype apply call bind".split(" ");
var javascriptKeywords = ("break case catch class const continue debugger default delete do else export extends false finally for function " +
  "if in import instanceof new null return super switch this throw true try typeof var void while with yield").split(" ");
var varsKey = ("const var let").split(" ");
var mainOperatorKeywords = ("if else while do").split(" ");
mainOperatorKeywords.push("else if");
var openOperatorSign = '(';
var closeOperatorSign = ")";
var openBlockSign = "{";
var closeBlockSign = "}";

function createKeyword(isName, isArgs, identify) {
  return {
    isName: isName,
    name: "",
    vars:  [],
    identify:identify,
    isArgs:isArgs,
    lineFom: null,
    lineTo: null,
    parents:[]
  }
}

var blocksTree = [];

var typesVars =  function(){
  return {
    class:createKeyword(true, false, ["class","{"]),
    function:createKeyword(true, true, ["function", "()"]),
    if:createKeyword(false, false, ["if(", "){"]),
    else:createKeyword(false, false,["else{", "{"]),
    "else if":createKeyword(false, false, ["if(", "){"]),
    while:createKeyword(false, false,["while(", "){"]),
    do:createKeyword(false, false, ["do{","){"]),
    for:createKeyword(false, true,["for(","){"]),
  }
};

import _CodeMirror from 'codemirror'
const CodeMirror = window.CodeMirror || _CodeMirror

class HintJS {

  Pos = CodeMirror.Pos;

  forEach(arr, f) {
    for (let i = 0, e = arr.length; i < e; ++i) f(arr[i]);
  }

  getCompletions(token, context, keywords, options, line) {
    let found = [], start = token.string, global = options && options.globalScope || window;

    function arrayContains(arr, item) {
      if (!Array.prototype.indexOf) {
        let i = arr.length;
        while (i--) {
          if (arr[i] === item) {
            return true;
          }
        }
        return false;
      }
      return arr.indexOf(item) != -1;
    }

    function forAllProps(obj, callback) {
      if (!Object.getOwnPropertyNames || !Object.getPrototypeOf) {
        for (let name in obj) callback(name)
      } else {
        for (let o = obj; o; o = Object.getPrototypeOf(o))
          Object.getOwnPropertyNames(o).forEach(callback)
      }
    }

    function maybeAdd(str) {
      if (str.lastIndexOf(start, 0) == 0 && !arrayContains(found, str)) found.push(str);
    }

    function gatherCompletions(obj) {
      if (typeof obj == "string") forEach(stringProps, maybeAdd);
      else if (obj instanceof Array) forEach(arrayProps, maybeAdd);
      else if (obj instanceof Function) forEach(funcProps, maybeAdd);
      forAllProps(obj, maybeAdd)
    }
    if (context && context.length) {
      // If this is a property, see if it belongs to some object we can
      // find in the current environment.
      var obj = context.pop(), base;
      if (obj.type && obj.type.indexOf("variable") === 0) {
        if (options && options.additionalContext)
          base = options.additionalContext[obj.string];
        if (!options || options.useGlobalScope !== false)
          base = base || global[obj.string];
      } else if (obj.type == "string") {
        base = "";
      } else if (obj.type == "atom") {
        base = 1;
      } else if (obj.type == "function") {
        if (global.jQuery != null && (obj.string == '$' || obj.string == 'jQuery') &&
          (typeof global.jQuery == 'function'))
          base = global.jQuery();
        else if (global._ != null && (obj.string == '_') && (typeof global._ == 'function'))
          base = global._();
      }
      while (base != null && context.length)
        base = base[context.pop().string];
      if (base != null) gatherCompletions(base);
    } else {
      // If not, just look in the global object and any local scope
      // (reading into JS mode internals to get at the local and global variables)
      for (let v = token.state.localVars; v; v = v.next) maybeAdd(v.name);
      for (let v = token.state.globalVars; v; v = v.next) maybeAdd(v.name);
         //maybeAdd(v.name);
      if (!options || options.useGlobalScope !== false)
        gatherCompletions(global);
      this.forEach(keywords, maybeAdd);
    }
    if(token.this && line.handle.localThisVars !== undefined){
      for (let v = 0; v<line.handle.localThisVars.length; v++){
        maybeAdd(line.handle.localThisVars[v])
      }
    }
    if(line.handle.localVars.length>0){
      for (let v = 0; v<line.handle.localVars.length; v++){
        maybeAdd(line.handle.localVars[v])
      }
    }

    return found;
  }

  scriptHint(editor, keywords, getToken, options) {

    // Find the token at the cursor
    let cur = editor.getCursor();
    let token = getToken(editor, cur);
    let line = editor.lineInfo(cur.line);
    let text = editor.getLine(cur.line);
    if (/\b(?:string|comment)\b/.test(token.type)) return;
    var innerMode = CodeMirror.innerMode(editor.getMode(), token.state);
    if (innerMode.mode.helperType === "json") return;
    token.state = innerMode.state;

    // If it's not a 'word-style' token, ignore the token.
    if (!/^[\w$_]*$/.test(token.string)) {
      token = {
        start: cur.ch,
        end: cur.ch,
        string: "",
        state: token.state,
        this:this.isThisInLine(text),
        type: token.string == "." ? "property" : null};

    } else if (token.end > cur.ch) {

      token.end = cur.ch;
      token.string = token.string.slice(0, cur.ch - token.start);
    }

    let tprop = token;
    let contextArray = [];

    // If it is a property, find out what it is a property of.
    while (tprop.type == "property") {
      tprop = getToken(editor, this.Pos(cur.line, tprop.start));
      if (tprop.string != ".") break;
      let tprop_ = getToken(editor, this.Pos(cur.line, tprop.end));
      contextArray.push(tprop_);
    }

    return {list: this.getCompletions(token, contextArray, keywords, options, line),
      from: this.Pos(cur.line, token.start),
      to: this.Pos(cur.line, token.end)};
  }

  isThisInLine(str){
    if(str.indexOf('this.') >= 0){
      return true
    }
    return false
  }

  isClassInLine(line){
    if(line.text.indexOf('class') >= 0){
      return true
    }
    return false
  }

  isSrartBlockInLine(line){
    if(line.text.indexOf(openBlockSign) >= 0){
      return true
    }
    return false
  }

  isCloseBlockInLine(line){
    if(line.text.indexOf(closeBlockSign) >= 0){
      return true
    }
    return false
  }

  isVarsKeys(line){
    for(var i=0;i<varsKey.length;i++){
      if(line.text.indexOf(varsKey[i]) >= 0){
        return true
      }
    }
    return false
  }

  setBlockes (lines){
    let blocks = [];
    let open=-1 ;
    for(let i=0;i<lines.length;i++) {
        if(this.isSrartBlockInLine(lines[i])){
          open++;
          blocks.push(open);
          blocks[open] = {start:i,end:null};
        }
        if(this.isCloseBlockInLine(lines[i])){
          blocks[open]['end'] = i;
          lines[blocks[open]['start']].blockInfo = blocks[open]
          open--;
        }
    }
  }

  isOpenOperatorInline(line){
    let i = line.text.indexOf(openOperatorSign)
    if(i >= 0){
      return i
    }
    return false
  }

  isCloseOperatorInline(line){
    let i = line.text.indexOf(closeOperatorSign)
    if(i >= 0){
      return i
    }
    return false
  }

  isMainOperatorKeywords(str){
    for(var i=0;i<mainOperatorKeywords.length;i++){
      if(str.indexOf(mainOperatorKeywords[i]) >=0){
        return true
      }
    }
    return false
  }
   isFor(str){
     if(str.indexOf('for') >= 0){
       return true
     }
     return false
   }

  setOperators(lines){
    let operator = [];
    let open=-1 ;
    for(let i=0;i<lines.length;i++) {
      if(this.isOpenOperatorInline(lines[i])){
        open++;
        operator.push(open);
        operator[open] = {start:this.isOpenOperatorInline(lines[i]),end:null};
      }
      if(this.isCloseOperatorInline(lines[i])){
        operator[open]['end'] = this.isCloseOperatorInline(lines[i]);
        lines[i].operatorInfo = operator[open]
        open--;
      }
    }
  }

  getArgs(str){
    if(!this.isMainOperatorKeywords(str))
    {
      if(this.isFor(str)){
        var regex = new RegExp("([var|let]{0,}\\s[a-zA-Z0-9]{0,}=[a-zA-Z0-9]{0,});", "g");
        let asDefaults = str.match(regex);
        for (let i=0; i<asDefaults.length;i++){
          if(asDefaults[0].indexOf('var')>=0){
            let args = str.split('var').pop().split('=');
            return args[0].trim()
          } else if(asDefaults[0].indexOf('let')>=0) {
            let args = str.split('let').pop().split('=');
            return args[0].trim()
          }
        }
      } else {
        let regex = new RegExp("=[a-zA-Z0-9]{0,}[,|\\)]", "g");
        let asDefaults = str.match(regex);
        for (let i=0; i<asDefaults.length;i++){
          str = str.replace((asDefaults[i].slice(0, -1)),'')
        }
        let args = str.split('(').pop().split(')');
        return args[0].split(',')
      }
    }
    return false
  }

  getVars(str){
    if(!this.isFor(str)){
      let vstr = []
      let regex = new RegExp("([var|let|const])([a-zA-Z0-9\\s]{0,})([=|,|;|\\n])", "g");
      let asDefaults = str.match(regex);
      if(asDefaults !== undefined && asDefaults != null){
        for (let i=0; i<asDefaults.length;i++){
          let str = asDefaults[i];
          let keys = ("var let const = ; , \n").split(" ")
          for(let i=0;i<keys.length;i++){
            str = str.replace(keys[i],"")
          }
          vstr.push(str.trim())
        }
      }
      return vstr
    }
  }

  addVarsToBlock(lines, lineNumber, vars){
    let info = this.getBlockInfo(lines, lineNumber)
    if(info.start!=undefined && info.end!=undefined){
      while (info.start != info.end) {
        for(let i=0;i<vars.length;i++)
          lines[info.start].localVars.push(vars[i])
        info.start++
      }
    }
  }

  addThisVarsToBlock(lines, lineNumber, vars){
    let info = this.getBlockInfo(lines, lineNumber)
    if(info.start!=undefined && info.end!=undefined){
      while (info.start != info.end){
        lines[info.start].localThisVars = []
        for(let i=0;i<vars.length;i++)
          lines[info.start].localThisVars.push(vars[i])
        info.start++
      }
    }
  }

  setArgsInLines(lines) {
    for(let i=0;i<lines.length;i++) {
      if(lines[i].operatorInfo !== undefined && lines[i].blockInfo !== undefined) {
        if(lines[i].operatorInfo.end-lines[i].operatorInfo.start > 1){
          let args = this.getArgs(lines[i].text)
          if(args !== undefined && args != false){
            this.addVarsToBlock(lines, i, args)
          }
        }
      }
      else if(lines[i+1] !== undefined) {
        if(lines[i].operatorInfo !== undefined && lines[i+1].blockInfo !== undefined) {
          if(lines[i].operatorInfo.end-lines[i].operatorInfo.start > 1){
            console.log(lines[i].text)
          }
        }
      }

    }
  }

  createBlockTree(lines){
    let currentBlockinfo = []
    for(let i=0;i<lines.length;i++){

      if(lines[i].blockInfo !== undefined){
        currentBlockinfo = lines[i].blockInfo
        let children = this.getChildren(lines, lines[i].blockInfo)
        if(children != undefined && children.length>0){
          lines[i].childrenBlock = children
        }
        let parent = this.getParent(lines, lines[i].blockInfo)
        lines[i].parentBlock = parent
      }
      else {
        lines[i].insideBlockInfo = currentBlockinfo
      }
      //add var in line if exist
      if(this.isVarsKeys(lines[i])){
        let v = this.getVars(lines[i].text)
        if(v!=undefined && v.length>0){
          this.addVarToLine(lines[lines[i].insideBlockInfo.start], v)
        }
      }
    }
  }

  getChildren(lines, info){
    let childrenBlock=[];
    for(let i=0;i<lines.length;i++){
      if(lines[i].blockInfo !== undefined){
       if(lines[i].blockInfo.start>info.start && lines[i].blockInfo.end<info.end){
         childrenBlock.push(lines[i].blockInfo)
       }
      }
    }
    return childrenBlock
  }

  getParent(lines, info){
    for(let i=info.start;i>=0;i--){
      if(lines[i].blockInfo !== undefined){
        if(lines[i].blockInfo.start<info.start && lines[i].blockInfo.end>info.end){
          return lines[i].blockInfo
        }
      }
    }
  }

  getBlockInfo(lines, lineNumber){
    let start, end=0;
    if(lines[lineNumber] != undefined){
      if(lines[lineNumber].blockInfo != undefined){
        start = lines[lineNumber].blockInfo.start
        end = lines[lineNumber].blockInfo.end
      } else if(lines[lineNumber+1].blockInfo != undefined) {
        start = lines[lineNumber].blockInfo.start
        end = lines[lineNumber].blockInfo.end
      } else {
        return false
      }
    }
    return {start:start,end:end}
  }

  getOperatorsName(lines, blockInfo){
    let vars = []
    while(blockInfo.start != blockInfo.end){
      if(lines[blockInfo.start].operatorInfo != undefined && !this.isMainOperatorKeywords(lines[blockInfo.start].text)){
        let endName = lines[blockInfo.start].text.indexOf('(')
        if(endName>=0){
          let name = ((lines[blockInfo.start].text).slice(0,endName)).trim()
          if(name != undefined){
            vars.push(name)
          }
        }
      }
      blockInfo.start++
    }
    return vars;
  }

  setThisVarsInClass(lines,blockInfo,thisVars){
    while(blockInfo.start != blockInfo.end){
      if(lines[blockInfo.start].blockInfo != undefined && !this.isMainOperatorKeywords(lines[blockInfo.start].text)){
        this.addThisVarsToBlock(lines, blockInfo.start, thisVars)
      }
      blockInfo.start++
    }
  }

  setOperatorsInClass(lines){
    for(let i=0;i<lines.length;i++) {
      if(this.isClassInLine(lines[i])){
        let thisVars = this.getOperatorsName(lines, this.getBlockInfo(lines, i))
        this.setThisVarsInClass(lines, this.getBlockInfo(lines, i),thisVars)
        i=this.getBlockInfo(lines, i).end
      }
    }
  }

  addVarToLine(line, items){
    for(let i=0;i<items.length;i++){
      if(!line.localVars.includes(items[i]))
        line.localVars.push(items[i])
    }
  }

  addVarsToBlocks(lines){
    for(let i=0;i<lines.length;i++){
      if(lines[i].insideBlockInfo !== undefined) {
        let block = lines[lines[i].insideBlockInfo.start]
        while (true){
          if(block.localVars !== undefined && block.localVars.length>0) {
            this.addVarToLine(lines[i], block.localVars)
          }
          if(block.parentBlock == undefined)
            break
          else{
            block = lines[block.parentBlock.start]
          }
        }

      }
    }
  }

  setGlobalVars(codeLines){
    let varsArray = [];
    for (let i=0;i<codeLines.length;i++){
      let lines = codeLines[i].lines
      for(let j=0;j<lines.length;j++){
        lines[j].localThisVars = [];
        lines[j].localVars = [];
      }
      this.setBlockes(lines);
      this.createBlockTree(lines);
      this.setOperators(lines);
      this.setOperatorsInClass(lines);
      this.setArgsInLines(lines);
      this.addVarsToBlocks(lines);
    }
  }

  javascriptHint(editor, options) {
    if(editor!=undefined && editor.doc != undefined && editor.doc.children)
      this.setGlobalVars(editor.doc.children);
    return this.scriptHint(editor, javascriptKeywords,
       function (e, cur) {return e.getTokenAt(cur);},
       options);
  };
}
export default new HintJS()
