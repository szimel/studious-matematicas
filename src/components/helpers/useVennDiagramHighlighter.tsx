export type SolutionType = {
  [key: string]: boolean;
  A: boolean;
  B: boolean;
  C: boolean;
  A_B: boolean;
  A_C: boolean;
  B_C: boolean;
  A_B_C: boolean;
};

type SetObject = {
  [key: string]: boolean;
};

type UniversalSet = {
  [key: string]: SetObject;
};

const universalSet: UniversalSet = {
  A: {
    A: true,
    B: false,
    C: false,
    A_B: true,
    A_C: true,
    B_C: false,
    A_B_C: true,
  },
  B: {
    A: false,
    B: true,
    C: false,
    A_B: true,
    A_C: false,
    B_C: true,
    A_B_C: true,
  },
  C: {
    A: false,
    B: false,
    C: true,
    A_B: false,
    A_C: true,
    B_C: true,
    A_B_C: true,
  },
};

interface Step {
  set: string;
  type: '∪' | '∩' | '';
}

function createSteps(expression: string) {
  const steps: Step[] = [];
  let currentSet = '';
  let currentType: Step['type'] = '';

  // A function to add a step if there's an ongoing operation
  const addStepIfNeeded = () => {
    if (currentSet && currentType) {
      steps.push({ set: currentSet, type: currentType });
      currentSet = '';
      currentType = '';
    }
  };

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if (char === '∪' || char === '∩') {
      // If an operator is found, add the step and start a new one
      addStepIfNeeded();
      currentType = char;
    } else if (char === '(') {
      const end = findClosingParenthesis(expression, i);
      if (end === -1) {
        throw alert('Check your parenthesis!');
      } else {
        const subExpression = expression.slice(i + 1, end);
        steps.push(...createSteps(subExpression));
        i = end;
      }
    } else if (char.match(/[ABC]/)) {
      // Accumulate set characters
      currentSet += char;
    }
  }

  // Add the last step if needed
  addStepIfNeeded();

  return steps;
}

// Helper function to find the matching closing parenthesis
function findClosingParenthesis(str: string, start: any) {
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === '(') {depth++;}
    if (str[i] === ')') {
      depth--;
      if (depth === 0) {return i;}
    }
  }
  return -1; // Not found or malformed expression
}

//HOOK being called
export const useVennDiagramHighlighter = (expression: string) => {
  function evaluateExpression(expression: string) {
    const steps = createSteps(expression);
    console.log(steps);
  
    const solution: SolutionType = {
      A: false,
      B: false,
      C: false,
      A_B: false,
      A_C: false,
      B_C: false,
      A_B_C: false,
    };

    // map out steps
    steps.forEach(step => {
      const type = step.type; 
      if (step === steps[0]) {
        // initial sets to compare
        const setOne = universalSet[step.set[0]];
        const setTwo = universalSet[step.set[1]];

        // union logic
        if (type === '∪') {
          // Merge keys from setOne
          Object.keys(setOne).forEach(key => {
            if (setOne[key] === true) {solution[key] = true;}
          });
          // Merge keys from setTwo
          Object.keys(setTwo).forEach(key => {
            if (setTwo[key] === true) {solution[key] = true;}
          });

        // intersection logic
        } else {
          if (type === '∩') {
            Object.keys(setOne).forEach(key => {
              if (setOne[key] === true && setTwo[key] === true) {
                // If the key is true in both sets, include it in the solution
                solution[key] = true;
              } else {
                // If the key is not true in both sets, ensure it's false in the solution
                solution[key] = false; 
              }
            });
          }
        } 

      // for every step after the first one
      } else {
        const valueOne = step.set[0];
        const setOne = universalSet[valueOne];

        if (type === '∪') {
          // Merge keys from setOne
          Object.keys(setOne).forEach(key => {
            if (setOne[key] === true) {solution[key] = true;}
          });

        // intersection logic
        } else {
          if (type === '∩') {
            Object.keys(setOne).forEach(key => {
              if (setOne[key] === true && solution[key] === true) {
                // If the key is true in both sets, include it in the solution
                solution[key] = true;
              } else {
                // If the key is not true in both sets, ensure it's false in the solution
                solution[key] = false;
              }
            });
          }
        } 
      }
    });
    return solution;
  
  } 

  const diagramStyles = evaluateExpression(expression);

  // console.log(diagramStyles);
  return diagramStyles;
};
