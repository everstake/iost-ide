//'use strict';
var esprima = require('esprima')
var escodegen = require('escodegen')
class Compiler {
  // esprima = require('esprima/dist/esprima.js');
  // escodegen = require('escodegen/escodegen.js');

  esprima = require('esprima')
  escodegen = require('escodegen/escodegen.js');

  lang = "javascript";
  version = "1.0.0";

  isClassDecl(stat) {
    return !!(stat && stat.type === "ClassDeclaration");
  }

  isExport(stat) {
    return !!(stat && stat.type === "AssignmentExpression" && stat.left && stat.left.type === "MemberExpression"
      && stat.left.object && stat.left.object.type === "Identifier" && stat.left.object.name === "module"
      && stat.left.property && stat.left.property.type === "Identifier" && stat.left.property.name === "exports");
  }

  getExportName(stat) {
    if (stat.right.type !== "Identifier") {
      throw new Error("module.exports should be assigned to an identifier");
    }
    return stat.right.name;
  }

  isPublicMethod(def) {
    return def.key.type === "Identifier" && def.value.type === "FunctionExpression" && !def.key.name.startsWith("_");
  }

  genAbi(def, lastPos, comments) {
    for (let param of def.value.params) {
      if (param.type !== "Identifier") {
        throw new Error("invalid method parameter type. must be Identifier, got " + param.type);
      }
    }
    let abi = {
      "name": def.key.name,
      "args": new Array(def.value.params.length).fill("string")
      // "amountLimit": [],
      // "description": ""
    };
    for (let i = comments.length - 1; i >= 0; i--) {
      let comment = comments[i];
      if (comment.range[0] > lastPos && comment.range[1] < def.range[0]) {
        for (let i in def.value.params) {
          let name = def.value.params[i].name;
          let reg = new RegExp("@param\\s*{([a-zA-Z]+)}\\s*" + name);
          let reg1 = new RegExp("@param\\s*" + name + "\\s*{([a-zA-Z]+)}");
          let res = null;
          if (res = comment.value.match(reg), res !== null) {
            abi.args[i] = res[1];
          } else if (res = comment.value.match(reg1), res !== null) {
            abi.args[i] = res[1];
          }
        }
        break;
      }
    }
    return abi;
  }

  genAbiArr(stat, comments) {
    let abiArr = [];
    if (!this.isClassDecl(stat) || stat.body.type !== "ClassBody") {
      throw new Error("invalid statement for generate abi. stat = " + stat);
      return null;
    }
    let initFound = false;
    let lastPos = stat.body.range[0];
    for (let def of stat.body.body) {
      if (def.type === "MethodDefinition" && this.isPublicMethod(def)) {
        if (def.key.name === "constructor") {
          throw new Error("smart contract class shouldn't contain constructor method!");
        } else if (def.key.name === "init") {
          initFound = true;
        } else {
          abiArr.push(this.genAbi(def, lastPos, comments));
          lastPos = def.range[1];
        }
      }
    }
    if (!initFound) {
      throw new Error("init not found!");
      return null;
    }
    return abiArr;
  }

  checkInvalidKeyword(tokens) {
    for (let i = 0; i < tokens.length; i++) {
      if ((tokens[i].type === "Identifier" || tokens[i].type === "Literal") &&
        (tokens[i].value === "_IOSTInstruction_counter" || tokens[i].value === "_IOSTBinaryOp" || tokens[i].value === "IOSTInstruction" ||
          tokens[i].value === "_IOSTTemplateTag" || tokens[i].value === "_IOSTSpreadElement")) {
        throw new Error("use of _IOSTInstruction_counter or _IOSTBinaryOp keyword is not allowed");
      }
      if (tokens[i].type === "RegularExpression") {
        throw new Error("use of RegularExpression is not allowed." + tokens[i].val)
      }
      if (tokens[i].type === "Keyword" && (tokens[i].value === "try" || tokens[i].value === "catch")) {
        throw new Error("use of try catch is not supported");
      }
    }
  }

  checkOperator(tokens) {
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "Punctuator" &&
        (tokens[i].value === "+" || tokens[i].value === "-" || tokens[i].value === "*" || tokens[i].value === "/" || tokens[i].value === "%" ||
          tokens[i].value === "+=" || tokens[i].value === "-=" || tokens[i].value === "*=" || tokens[i].value === "/=" || tokens[i].value === "%=" ||
          tokens[i].value === "++" || tokens[i].value === "--")) {
        throw new Error("use of +-*/% operators is not allowed");
      }
    }
  }

  processOperator(node, pnode) {
    if (node.type === "ArrayPattern" || node.type === "ObjectPattern") {
      throw new Error("use of ArrayPattern or ObjectPattern is not allowed." + JSON.stringify(node));
    }
    let ops = ['+', '-', '*', '/', '%', '**', '|', '&', '^', '>>', '>>>', '<<', '==', '!=', '===', '!==', '>', '>=', '<', '<='];

    if (node.type === "AssignmentExpression" && node.operator !== '=') {
      let subnode = {};
      subnode.operator = node.operator.substr(0, node.operator.length - 1);
      subnode.type = 'BinaryExpression';
      subnode.left = Object.assign({}, node.left);
      subnode.right = node.right;
      node.operator = '=';
      node.right = subnode;

    } else if (node.type === "BinaryExpression" && ops.includes(node.operator)) {
      let newnode = {};
      newnode.type = "CallExpression";
      let calleeNode = {};
      calleeNode.type = 'Identifier';
      calleeNode.name = '_IOSTBinaryOp';
      newnode.callee = calleeNode;
      let opNode = {};
      opNode.type = 'Literal';
      opNode.value = node.operator;
      opNode.raw = '\'' + node.operator + '\'';
      newnode.arguments = [node.left, node.right, opNode];
      node = newnode;
    } else if (node.type === "TemplateLiteral" && (pnode === undefined || pnode.type !== "TaggedTemplateExpression")) {
      let newnode = {};
      newnode.type = "TaggedTemplateExpression";
      let tagNode = {};
      tagNode.type = 'Identifier';
      tagNode.name = '_IOSTTemplateTag';
      newnode.tag = tagNode;
      newnode.quasi = node;
      node = newnode;
    } else if (node.type === "SpreadElement") {
      let newnode = {};
      newnode.type = "CallExpression";
      let calleeNode = {};
      calleeNode.type = 'Identifier';
      calleeNode.name = '_IOSTSpreadElement';
      newnode.callee = calleeNode;
      newnode.arguments = [node.argument];
      node.argument = newnode;
    }
    return node;
  }

  traverseOperator(node, pnode) {
    node = this.processOperator(node, pnode);
    for (let key in node) {
      if (node.hasOwnProperty(key)) {
        let child = node[key];
        if (typeof child === 'object' && child !== null) {
          node[key] = this.traverseOperator(child, node);
        }
      }
    }
    return node;
  }

  handleOperator(ast) {
    ast = this.traverseOperator(ast);
    // generate source from ast
    return escodegen.generate(ast);
  }

  processContract(source) {
    if (source === undefined) {
        throw new Error("invalid file content. Is " + file + " exists?")
    }

    let ast = esprima.parseModule(source.toString(), {
        range: true,
        loc: false,
        comment: true,
        tokens: true
    });
    let abiArr = [];
    if (!ast || ast === null || !ast.body || ast.body === null || ast.body.length === 0) {
        throw new Error("invalid source! ast = " + ast);
    }

    this.checkInvalidKeyword(ast.tokens);
    //this.checkOperator(ast.tokens);

    let newSource = "'use strict';\n" + this.handleOperator(ast);

    let className;
    for (let stat of ast.body) {
        if (this.isClassDecl(stat)) {
        }
        else if (stat.type === "ExpressionStatement" && this.isExport(stat.expression)) {
            className = this.getExportName(stat.expression);
        }
    }

    for (let stat of ast.body) {
        if (this.isClassDecl(stat) && stat.id.type === "Identifier" && stat.id.name === className) {
            abiArr = this.genAbiArr(stat, ast.comments);
        }
    }

    let abi = {};
    abi['lang'] = this.lang;
    abi['version'] = this.version;
    abi['abi'] = abiArr;
    let abiStr = JSON.stringify(abi, null, 0);
    return abiStr;
  }
}

export default new Compiler()
