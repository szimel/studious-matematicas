/* eslint-disable no-debugger */
type TokenType = 'SET' | 'UNION' | 'INTERSECTION' | 'COMPLEMENT' | 'OPEN_PAREN' | 'CLOSE_PAREN';

interface Token {
  type: TokenType;
  value: string;
}

type ASTNodeType = 'UNION' | 'INTERSECTION' | 'COMPLEMENT' | 'SET';

interface ASTNode {
  type: ASTNodeType;
  value: string | null; // Value is null for operations
  left: ASTNode | null;
  right: ASTNode | null;
}

interface UniversalSet {
  [key: string]: SetObject;
}

export type SolutionType = {
  [key: string]: boolean;
  setA: boolean;
  setB: boolean;
  setC: boolean;
  setAUnionB: boolean;
  setAUnionC: boolean;
  setBUnionC: boolean;
  setAUnionBUnionC: boolean;
};

interface SetObject {
  [key: string]: boolean;
}

const universalSet: UniversalSet = {
  setA: {
    setA: true,
    setB: false,
    setC: false,
    setAUnionB: true,
    setAUnionC: true,
    setBUnionC: false,
    setAUnionBUnionC: true,
  },
  setB: {
    setA: false,
    setB: true,
    setC: false,
    setAUnionB: true,
    setAUnionC: false,
    setBUnionC: true,
    setAUnionBUnionC: true,
  },
  setC: {
    setA: false,
    setB: false,
    setC: true,
    setAUnionB: false,
    setAUnionC: true,
    setBUnionC: true,
    setAUnionBUnionC: true,
  },
};

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    switch (char) {
    case '∪':
      tokens.push({ type: 'UNION', value: char });
      break;
    case '∩':
      tokens.push({ type: 'INTERSECTION', value: char });
      break;
    case '\'':
      tokens.push({ type: 'COMPLEMENT', value: char });
      break;
    case '(':
      tokens.push({ type: 'OPEN_PAREN', value: char });
      break;
    case ')':
      tokens.push({ type: 'CLOSE_PAREN', value: char });
      break;
    default:
      if (char.match(/[ABC]/)) {
        tokens.push({ type: 'SET', value: `set${char}` });
      }
    }
  }

  return tokens;
}


// works by using a recursive descent parser - meaning it parses the tokens using a 
// function loop that calls itself recursively, union => intersection => complement => primary
function parse(tokens: Token[]): ASTNode {
  let currentTokenIndex = 0;

  function getNextToken(): Token | null {
    return currentTokenIndex < tokens.length ? tokens[currentTokenIndex++] : null;
  }

  function parseExpression(): ASTNode {
    return parseUnion();
  }

  function parseUnion(): ASTNode {
    let node = parseIntersection();
  
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const token = getNextToken();
      if (!token || token.type !== 'UNION') {
        currentTokenIndex--;
        break;
      }

      const right = parseIntersection();
      node = { type: 'UNION', value: null, left: node, right: right };
    }
  
    return node;
  }

  function parseIntersection(): ASTNode {
    let node = parseComplement();
  
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const token = getNextToken();
      if (!token || token.type !== 'INTERSECTION') {
        currentTokenIndex--;
        break;
      }

      const right = parseComplement();
      node = { type: 'INTERSECTION', value: null, left: node, right: right };
    }
  
    return node;
  }

  function parseComplement(): ASTNode {
    let node = parsePrimary();
    
    // Check if next token is a complement
    const nextToken = getNextToken();
    if (nextToken && nextToken.type === 'COMPLEMENT') {
      node = { type: 'COMPLEMENT', value: null, left: node, right: null };
      // Do not immediately expect another primary expression here
    } else {
      currentTokenIndex--; // If not a complement, put back the token
    }
    
    return node;
  }
  

  function parsePrimary(): ASTNode {
    const token = getNextToken();
    if (!token) {
      alert('Unexpected end of input!');
      throw new Error('Unexpected end of input');
    }
  
    if (token.type === 'OPEN_PAREN') {
      const node = parseExpression();
      const closingToken = getNextToken();
      if (!closingToken || closingToken.type !== 'CLOSE_PAREN') {
        alert('Expected closing parenthesis!');
        throw new Error('Expected closing parenthesis');
      }
      return node;
    }
  
    if (token.type === 'SET') {
      return { type: 'SET', value: token.value, left: null, right: null };
    }
  
    throw new Error('Unexpected token: ' + token.type);
  }
  
  return parseExpression();
}


function evaluateNode(node: ASTNode, universalSet: UniversalSet): SetObject {
  switch (node.type) {
  case 'SET':
    if (node.value === null || !universalSet[node.value]) {
      console.log(node);
      throw new Error('Set node with null value or set not found in universal set');
    }
    return universalSet[node.value]; // This returns a SetObject

  case 'UNION':
  case 'INTERSECTION': {
    if (node.left === null || node.right === null) {
      throw new Error(`${node.type} node with null child`);
    }
    const set1 = evaluateNode(node.left, universalSet);
    const set2 = evaluateNode(node.right, universalSet);
    return node.type === 'UNION' ? union(set1, set2) : intersection(set1, set2);
  }

  case 'COMPLEMENT': {
    if (node.left === null) {
      throw new Error('Complement node with null child');
    }
    return complement(evaluateNode(node.left, universalSet));
  }

  default:
    throw new Error('Unknown AST node type');
  }
}

// Returns the union of two sets
function union(set1: SetObject, set2: SetObject): SetObject {
  const result: SetObject = {};

  Object.keys(set1).forEach(key => {
    result[key] = set1[key] || set2[key];
  });

  return result;
}

// Returns the intersection of two sets
function intersection(set1: SetObject, set2: SetObject): SetObject {
  const result: SetObject = {};

  Object.keys(set1).forEach(key => {
    result[key] = set1[key] && set2[key];
  });

  return result;
}

// Returns the complement of a set
function complement(set: SetObject): SetObject {
  const result: SetObject = {};

  Object.keys(set).forEach(key => {
    result[key] = !set[key]; // Invert the boolean value for each key
  });

  return result;
}

export const useVennDiagramHighlighter = (expression: string) => {
  const tokens = tokenize(expression); // Tokenize the input
  console.log(tokens);
  const ast = parse(tokens); // Parse the tokens into an AST
  console.log(ast);
  const setObject: SetObject = evaluateNode(ast, universalSet); // Evaluate the AST into a SetObject

  // Convert the SetObject into a SolutionType object for the venn diagram
  const solution: SolutionType = {
    setA: setObject['setA'] || false,
    setB: setObject['setB'] || false,
    setC: setObject['setC'] || false,
    setAUnionB: setObject['setAUnionB'] || false,
    setAUnionC: setObject['setAUnionC'] || false,
    setBUnionC: setObject['setBUnionC'] || false,
    setAUnionBUnionC: setObject['setAUnionBUnionC'] || false,
  };

  return solution;
};