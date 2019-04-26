var esprima = require('esprima')
class CodeResearcher {
  isPublicMethod(def) {
    return def.key.type === "Identifier" && def.value.type === "FunctionExpression" && !def.key.name.startsWith("_");
  }
  genAbiArr(stat, comments) {
    let abiArr = [];
    if (!this.isClassDecl(stat) || stat.body.type !== "ClassBody") {
      throw new Error("invalid statement for generate abi. stat = " + stat);
      return null;
    }
    let initFound = false;
    for (let def of stat.body.body) {
      if (def.type === "MethodDefinition" && this.isPublicMethod(def)) {
        if (def.key.name === "constructor") {
          throw new Error("smart contract class shouldn't contain constructor method!");
        } else if (def.key.name === "init") {
          initFound = true;
        } else {
          let args = []
          for(let i=0;i<def.value.params.length;i++) {
            args.push(def.value.params[i].name)
          }
          abiArr.push({name:def.key.name,args:args})
        }
      }
    }
    return abiArr;
  }

  isClassDecl(stat) {
    return !!(stat && stat.type === "ClassDeclaration");
  }

  processContract (source) {
    if (source === undefined) {
      throw new Error("invalid is data exists?")
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

    for (let stat of ast.body) {
      if (this.isClassDecl(stat) && stat.id.type === "Identifier") {
        abiArr = this.genAbiArr(stat, ast.comments);
      }
    }
    return abiArr;
  }
}
export default new CodeResearcher()
