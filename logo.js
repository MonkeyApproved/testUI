/************ GENERAL FUNCTIONS **********/

function getColLabel(index) {
	if (index > 25) {
		let str1 = String.fromCharCode((index % 26) + 65);
		let str2 = getColLabel(Math.floor(index/26) - 1);
		return str2 + str1;
	} else {
		return String.fromCharCode(index + 65)
	}
}

function getRowLabel(index) {
	return `${index + 1}`;
}

/************ BUILDING THE DOM **********/

// The following counters are used to uniquely identify an input field in the DOM tree.
// inputCounter - is used for independent (single) input fields in the UI
// spreadsheetCounter - identifies the spreadsheet (if multiple spreadsheets are used)
// variableListCounter - identifies the variable list (if multiple lists are used)
let inputCounter = 0;
let spreadsheetCounter = 0;
let variableListCounter = 0;

function getEquationInput(id) {
	/* Equation inputs consist of three main elements:
	*  - result div -> is used to display the result of the equation
	*                  (shown if input in not in states focus or hover)
	*  - input -> text input for user
	*  - info -> info box for live feedback on the user input
	*            (shown if input is in focus)
	*  For details check the CSS file!
	*/
	         
	let inputWrapper = document.createElement('div');
	inputWrapper.className = 'inputWrapper';
	inputWrapper.id = `wrapper_${id}`;
	
	let inputResult = document.createElement('div');
	inputResult.className = 'inputResult';
	inputResult.id = `result_${id}`;
	
	let equationInput = document.createElement('input');
	equationInput.className = 'equationInput';
	equationInput.id = id;
	
	let inputInfo = document.createElement('div');
	inputInfo.className = 'inputInfo';
	inputInfo.id = `info_${id}`;;
	
	// combine elements for the equation (value) inputs
	inputWrapper.append(inputResult);
	inputWrapper.append(equationInput);
	inputWrapper.append(inputInfo);
	
	return inputWrapper;
}

function getStringInput(id) {
	let inputWrapper = document.createElement('div');
	inputWrapper.className = 'inputWrapper';
	inputWrapper.id = `wrapper_${id}`;
	
	let inputResult = document.createElement('div');
	inputResult.className = 'inputResult';
	inputResult.id = `result_${id}`;
	
	let stringInput = document.createElement('input');
	stringInput.className = 'stringInput';
	stringInput.id = id;
	
	// combine elements for the equation (value) inputs
	inputWrapper.append(inputResult);
	inputWrapper.append(stringInput);
	
	return inputWrapper;
}

function createVariableTable(rows) {
	// create grid container
	let variableTable = document.createElement('div');
	variableTable.className = 'variableTable';
	
	// create header
	let header = document.createElement('div');
	header.className = 'tableHeader';
	header.innerHTML = 'NAME';
	variableTable.append(header.cloneNode(true));
	//container.append(header.cloneNode(true))
	header.innerHTML = 'VALUE';
	variableTable.append(header);
	
	for (let i=0; i<rows; i++) {
		variableTable.append(getStringInput(`NAME_${i}`));
		variableTable.append(getEquationInput(`VALUE_${i}`));
	}
	
	return variableTable;
}

function createSpreadsheet(rows, columns) {
	// create grid container
	let spreadsheet = document.createElement('div');
	spreadsheet.className = 'spreadsheet';
	spreadsheet.style.gridTemplateColumns = `repeat(${columns+1}, minmax(100px, auto))`;
	
	// column labels
	let header = document.createElement('div');
	header.className = 'tableHeader';
	// row labels
	let rowHeader = document.createElement('div');
	rowHeader.className = 'tableRowLabel';
	// corner
	let corner = document.createElement('div');
	corner.className = 'tableCorner';
	// input field
	
	// generate first row of table
	spreadsheet.append(corner);
	for (let col=0; col<columns; col++) {
		let newHeader = header.cloneNode();
		newHeader.innerHTML = getColLabel(col);
		spreadsheet.append(newHeader);
	}
	
	// generate rest of table
	for (let row=0; row<rows; row++) {
		// first add row label
		let rowLabel = getRowLabel(row);
		let newLabel = rowHeader.cloneNode();
		newLabel.innerHTML = rowLabel;
		spreadsheet.append(newLabel);
		// add input fields for every column
		for (let col=0; col<columns; col++) {
			let colLabel = getColLabel(col);
			spreadsheet.append(getEquationInput(`CELL_${colLabel}${rowLabel}`));
		}
	}
	
	return spreadsheet;
}

let varTitle = document.getElementById('varTitle');
varTitle.after(createVariableTable(40));
let spreadTitle = document.getElementById('spreadTitle');
spreadTitle.after(createSpreadsheet(10, 10));

/*
let test = document.querySelectorAll('.equationInputResult');
test[3].lang = 'fr';
*/

/************ EQUATION EVALUATION **********/

let mathFunctions = {
	checkDataType(x) {
		if (typeof x === 'string') {
			return 'string';
		} else if (typeof x === 'number') {
			return 'number';
		} else if (Array.isArray(x)) {
			if (typeof x[0] === 'number') {
				return 'vector';
			} else if (Array.isArray(x[0])) {
				return 'matrix';
			}
		}
	},
	twoArgFunc(x, y, func) {
		let tx = mathFunctions.checkDataType(x);
		let ty = mathFunctions.checkDataType(y);
		if (tx == 'number' && ty == 'number') {
			return func(x, y);
		} else if (tx == 'number' && ty == 'vector') {
			return y.map(yi => func(x, yi)); 
		} else if (tx == 'vector' && ty == 'number') {
			return x.map(xi => func(xi, y)); 
		} else if (tx == 'vector' && ty == 'vector') {
			if (x.length == y.length) {
				return x.map((xi, i) => func(xi, y[i]));
			} else {
				return `vector lengths do not match (${x.length} and ${y.length})`;
			}
		} else if (tx == 'matrix' && ty == 'number') {
			return x.map((xi, i) => mathFunctions.twoArgFunc(xi, y, func));
		} else if (tx == 'number' && ty == 'matrix') {
			return y.map((yi, i) => mathFunctions.twoArgFunc(x, yi, func));
		} else if (tx == 'matrix' && ty == 'vector') {
			return x.map((xi, i) => mathFunctions.twoArgFunc(xi, y, func));
		} else if (tx == 'vector' && ty == 'matrix') {
			return y.map((yi, i) => mathFunctions.twoArgFunc(x, yi, func));
		} else if (tx == 'matrix' && ty == 'matrix') {
			if (x.length == y.length) {
				return x.map((xi, i) => mathFunctions.twoArgFunc(xi, y[i], func));
			} else {
				return 'matrix sizes do not match';
			}
		} else {
			return 'unknown data types in evaluation function...';
		}
	},
	oneArgFunc(x, func) {
		if (isNaN(x)) {
			return NaN;
		}
		let tx = mathFunctions.checkDataType(x);
		if (tx == 'number') {
			return func(x);
		} else if (tx == 'vector') {
			return x.map(xi => func(xi)); 
		} else if (tx == 'matrix') {
			return x.map(xi => mathFunctions.oneArgFunc(xi, func));
		} else {
			return 'unknown data types in evaluation function...';
		}
	},
	flatten(...args) {
		let len = args.length;
		let list = [];
		for (let i = 0; i < len; i++) {
			let type = mathFunctions.checkDataType(args[i]);
			if (type == 'number') {
				list.push(args[i]);
			} else if (type == 'vector') {
				list.push(...args[i]);
			} else {
				return 'unknown data types in evaluation function...';
			}
		}
		return list;
	},
	compareToList(x, ...list) {
		let len = list.length;
		if (len === 1 && Array.isArray(list[0])) {
			list = list[0];
		}
		for (let i = 0; i < len; i++) {
			if (x === list[i]) {return true;}
		} 
		return false;
	},
	forbiddenValues(x, ...values) {
		if (isNaN(x)) {
			return false;
		}
		let type = mathFunctions.checkDataType(x);
		if (type == 'number') {
			return mathFunctions.compareToList(x, ...values);
		} else if (type == 'vector') {
			let len = x.length;
			for (let i = 0; i < len; i++) {
				let match = mathFunctions.compareToList(x[i], ...values);
				if (match) {
					return true;
				}
			}
			return false;
		} else if (type == 'matrix') {
			return x.map(xi => mathFunctions.compareToList(xi, ...values));
		} else {
			return 'forbiddenValues() called with unknown data type...';
		}
	},
	array(...args) {return [...args]},
	part(array, n) {
		if (n > array.length) {
			return `index out of range (index: ${n}, array: ${array.length})`;
		} else if (n == 0) {
			return 'index 0 is invalid (start at 1)'
		} else if (n < 0) {
			return array[array.length + n];
		} else {
			return array[n-1];
		}
	},
	add(...args) {
		let len = args.length;
		let func = (x,y) => x+y;
		if (len == 0) {
			return 0;
		} else if (len == 1) {
			return args[0];
		} else {
			return args.reduce((ac, xi) => mathFunctions.twoArgFunc(ac, xi, func));
		}
	},
	sub(...args) {
		let len = args.length;
		let func = (x,y) => x-y;
		if (len == 0) {
			return 0;
		} else if (len == 1) {
			return args[0];
		} else {
			return args.reduce((ac, xi) => mathFunctions.twoArgFunc(ac, xi, func));
		}
	},
	mul(...args) {
		let len = args.length;
		let func = (x,y) => x*y;
		if (len == 0) {
			return 0;
		} else if (len == 1) {
			return args[0];
		} else {
			return args.reduce((ac, xi) => mathFunctions.twoArgFunc(ac, xi, func));
		}
	},
	mulFirst(x,y) {
		let func = (x,y) => x*y;
		return mathFunctions.twoArgFunc(x, y, func);
	},
	div(...args) {
		let len = args.length;
		for (let i = 1; i < len; i++) {
			if (mathFunctions.forbiddenValues(args[i], 0)) {
				return 'divide by zero error';
			}
		}
		let func = (x,y) => x/y;
		if (len == 0) {
			return 0;
		} else if (len == 1) {
			return args[0];
		} else {
			return args.reduce((ac, xi) => mathFunctions.twoArgFunc(ac, xi, func));
		}
	},
	pow(...args) {
		let len = args.length;
		let func = (x,y) => Math.pow(x,y);
		if (len == 0) {
			return 0;
		} else if (len == 1) {
			return args[0];
		} else {
			return args.reduce((ac, xi) => mathFunctions.twoArgFunc(ac, xi, func));
		}
	},
	abs(x) {
		let func = x => Math.abs(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	acos(x) {
		let func = x => Math.acos(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	acosh(x) {
		let func = x => Math.acosh(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	asin(x) {
		let func = x => Math.asin(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	asinh(x) {
		let func = x => Math.asinh(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	atan(x) {
		let func = x => Math.atan(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	atanh(x) {
		let func = x => Math.atanh(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	cbrt(x) {
		let func = x => Math.cbrt(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	ceil(x) {
		let func = x => Math.ceil(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	cos(x) {
		let func = x => Math.cos(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	cosh(x) {
		let func = x => Math.cosh(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	exp(x) {
		let func = x => Math.exp(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	expml(x) {
		let func = x => Math.expml(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	floor(x) {
		let func = x => Math.floor(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	fround(x) {
		let func = x => Math.fround(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	hypot(x) {
		let func = x => Math.hypot(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	imul(x) {
		let func = x => Math.imul(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	log(x) {
		let func = x => Math.log(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	log10(x) {
		let func = x => Math.log10(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	log1p(x) {
		let func = x => Math.log1p(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	log2(x) {
		let func = x => Math.log2(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	max(...args) {
		let list = mathFunctions.flatten(...args);
		return Math.max(...list);
	},
	min(...args) {
		let list = mathFunctions.flatten(...args);
		return Math.min(...list);
	},
	random() {return Math.random();},
	round(x) {
		let func = x => Math.round(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	sign(x) {
		let func = x => Math.sign(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	sin(x) {
		let func = x => Math.sin(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	sinh(x) {
		let func = x => Math.sinh(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	sqrt(x) {
		if (x < 0) {
			return `sqrt of negative value (${x})`;
		}
		let func = x => Math.sqrt(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	sum(...args) {
		let list = mathFunctions.flatten(...args);
		return list.reduce((sum, current) => sum + current, 0);
	},
	total(...args) {
		let list = mathFunctions.flatten(...args);
		return list.reduce((sum, current) => sum + current, 0);
	},
	tan(x) {
		let func = x => Math.tan(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	tanh(x) {
		let func = x => Math.tanh(x);
		return mathFunctions.oneArgFunc(x, func);
	},
	bezier(t, start, cp1, cp2, end) {
		let x = 1 - t;
		return start*x*x*x + 3*cp1*x*x*t + 3*cp2*x*t*t + end*t*t*t;
	},
	range(x,y,step = 1) {
		if (y == undefined) {
			y = x;
			x = 1;
		}
		let tx = mathFunctions.checkDataType(x);
		let ty = mathFunctions.checkDataType(y);
		let ts = mathFunctions.checkDataType(step);
		if (tx == 'number' && ty == 'number' && ts == 'number') {
			if (x > y) {
				step = -Math.abs(step);
			} else if (x == y) {
				return [x];
			} else {
				step = Math.abs(step);
			}
			let range = [];
			let next = x;
			let counter = 0;
			while (true) {
				range.push(next);
				next = next + step;
				if (x > y && next < y) {
					break;
				} else if (x < y && next > y) {
					break;
				}
				counter++;
				if (counter > 2000) {
					console.log('ERROR: vrange maximum length of 2000 reached');
					break;
				}
			}
			return range;
		} else {
			return 'arange has to be called with numbers';
		}
	},
	vabs(x) {
		
		return 0;
	}
}

function numberToString(value, digits = 4) {
	// convert arrays to strings
	if (Array.isArray(value)) {
		let len = value.length;
		if (len > 0) {
			let str = `[${numberToString(value[0], digits)}`;
			for (let i = 1; i < len; i++) {
				str = `${str}, ${numberToString(value[i], digits)}`;
			}
			return `${str}]`;
		} else {
			return '[]';
		}
	} else if (isNaN(value)) {
		return 'NaN';
	}
	
	// convert numbers to strings
	if (value == 0) {
		return '0';
	}
	let order = 0;
	let sign = Math.sign(value);
	value = Math.abs(value);
	if (value < 0.001) {
		while (value < 1 && order > -1000) {
			value = value * 10;
			order--;
		}
	} else if (value >= 10000) {
		while (value >= 10 && order < 1000) {
			value = value / 10;
			order++;
		}
	}
	let numberString = `${value*sign}`;
	if (numberString.length > digits + 1) {
		numberString = Number.parseFloat(value*sign).toPrecision(digits);
	}
	
	// cut off trailing zeros
	
	if (order === 0) {
		return numberString;
	} else {
		return `${numberString} x 10^${order}`;
	}
}

function stringToCell(str) {
	let valid = true;
	let len = str.length;
	let column = 0;
	let columnChars = 0;
	let row = 0;
	let rowChars = 0;
	for (let i = len - 1; i > -1; i--) {
		let charCode = str.charCodeAt(i)
		if (65 <= charCode && charCode <= 90) {
			// char is a capital letter -> could be column encoding
			column += (charCode - 64) * Math.pow(26, columnChars);
			columnChars++;
		} else if (48 <= charCode && charCode <= 57) {
			// char is a number -> could be a row encoding
			if (columnChars != 0) {
				return -1;
			} else {
				row += (charCode - 48) * Math.pow(10, rowChars);
				rowChars++;
			}
		} else {
			return -1;
		}
	}
	if (columnChars == 0 || rowChars == 0) {
		return -1;
	} else {
		return [column - 1, row - 1];
	}
}

function cellToString(cell) {
	return `${getColLabel(cell[0])}${getRowLabel(cell[1])}`;
}

function cellRangeToCellStrings(str1, str2) {
	let cell1 = stringToCell(str1);
	let cell2 = stringToCell(str2);
	let rangeX = mathFunctions.range(cell1[0], cell2[0]);
	let rangeY = mathFunctions.range(cell1[1], cell2[1]);
	let lenX = rangeX.length;
	let lenY = rangeY.length;
	let list = [];
	for (let x = 0; x < lenX; x++) {
		for (let y = 0; y < lenY; y++) {
			let cellString = cellToString([rangeX[x],rangeY[y]]);
			list.push(cellString);
		}
	}
	return list;
}

class dictionary {
	
	constructor() {
		this.dictionary = {};
	}
	
	inputChange(input) {
		// There are different types of input fields:
		// CELL_A1 -> spreadsheed cell
		// NAME_1 -> variable name in variable table
		// VALUE_1 -> variable value in variable table
		// FIELD_1 -> single input field somewhere in the ui
		
		let inputID = input.id.split('_');
		
		if (inputID[0] === 'CELL') {
			this.handleCellChange(input);
		} else if (inputID[0] === 'NAME') {
			this.handleNameChange(input);
		} else if (inputID[0] === 'VALUE') {
			this.handleValueChange(input);
		} else if (inputID[0] === 'FIELD') {
			this.handleFieldChange(input);
		} else {
			console.log('ERROR-0120');
		}
		console.log(this.dictionary);
	}
	
	handleCellChange(input) {
		let entry = this.dictionary[input.id];
		if (entry === undefined) {
			let newEntry = new equationHandler(input, this);
			this.dictionary[input.id] = newEntry;
		} else if (Array.isArray(entry)) {
			let newEntry = new equationHandler(input, this, entry);
			this.dictionary[input.id] = newEntry;
		} else {
			entry.update();
		}
	}
	
	lookupValue(str) {
		let entry = this.dictionary[str];
		if (entry === undefined) {
			return NaN;
		} else {
			return entry.value;
		}
	}
	
	updateParents(equation) {
		// This method is called while an equation is reevaluated:
		// the current tokens of the input have been calculated and
		// this method is used to update the cell/variable values in the
		// tokens and to communicate changes to the parents.
		
		// There are three different kinds of parent tokens:
		// -> ['cell', 'A1', value]
		// -> ['cellRange', 'A1', 'A3', array]
		// -> ['variable', 'alice', value]
		
		let formerParents = equation.parents.slice();
		let currentParents = [];
		let tokens = equation.tokens;
		let len = tokens.length;
		for (let i = 0; i < len; i++) {
			let token = tokens[i];
			if (token[0] === 'variable') {
				let value = this.addChildToEntry(equation.id, token[1]);
				currentParents.push(token[1]);
				// set the current value of the cell/variable
				token[2] = value;
			} else if (token[0] === 'cell') {
				let value = this.addChildToEntry(equation.id, `CELL_${token[1]}`);
				currentParents.push(`CELL_${token[1]}`);
				// set the current value of the cell/variable
				console.log(value);
				token[2] = value;
			} else if (tokens[i][0] === 'cellRange') {
				let rangeList = cellRangeToCellStrings(tokens[i][1], tokens[i][2]);
				let rangeArray = [];
				let rangeLen = rangeList.length;
				for (let n = 0; n < rangeLen; n++) {
					let cellID = `CELL_${rangeList[n]}`;
					let value = this.addChildToEntry(equation.id, cellID);
					rangeArray.push(value);
					currentParents.push(cellID);
				}
				token[3] = rangeArray;
			}
		}
		// make list unique (remove dublicates)
		currentParents = currentParents.filter((v, i, a) => a.indexOf(v) === i);
		equation.parents = currentParents;
		
		// check if any former parents have been removed
		len = formerParents.length;
		for (let i = 0; i < len; i++) {
			if (currentParents.indexOf(formerParents[i]) === -1) {
				this.removeChildFromEntry(equation.id, formerParents[i]);
			}
		}
	}
	
	addChildToEntry(child, entry) {
		//console.log(`adding child "${child}" to "${entry}"`);
		let parentInput = this.dictionary[entry];
		if (parentInput === undefined) {
			// this is the first child of an undefined cell/variable
			// -> start a children list
			this.dictionary[entry] = [child];
			return NaN;
		} else if (Array.isArray(parentInput)) {
			// this cell/variable is not defined but already has other children
			// -> add child to list if not in list already
			if (parentInput.indexOf(child) === -1) {
				parentInput.push(child);
			}
			return NaN;
		} else {
			// this is an existing equation
			// add child to parent list if not in list already
			if (parentInput.children.indexOf(child) === -1) {
				parentInput.children.push(child);
			}
			return parentInput.value;
		}
	}
	
	removeChildFromEntry(child, entry) {
		//console.log(`removing child "${child}" to "${entry}"`);
		let parentInput = this.dictionary[entry];
		if (parentInput === undefined) {
			console.log(`ERROR-0101`);
		} else if (Array.isArray(parentInput)) {
			// this cell/variable only exists as a childrens list
			let index = parentInput.indexOf(child);
			if (index === -1) {
				console.log('ERROR-0102');
			} else {
				parentInput.splice(index, 1);
			}
			// if children list empty, remove entry from dictionary
			if (parentInput.length === 0) {
				delete this.dictionary[entry];
			}
		} else {
			// this is an existing userInput
			let index = parentInput.children.indexOf(child);
			if (index === -1) {
				console.log('ERROR-0103');
			} else {
				parentInput.children.splice(index, 1);
			}
		}
	}
	
	informChildren(userInput) {
		// this method is called once the new value of an input is calculated
		// it is used to communicate the change to all the children
		let affectedInputs = {};
		this.collectChildren(userInput, affectedInputs);
	}
	
	collectChildren(userInput, affectedInputs) {
		let children = this.userInput.children;
		let len = children.length;
		for (let i = 0; i < len; i++) {
			if (childrenList[children[i]] == undefined) {
				childrenList[children[i]] = {parents: [cellString]};
				let childInput = this.dictionary
				this.collectChildren(children[i], list);
			} else {
				list[children[i]].parents.push(cellString);
			}
		}
	}
	
	addInputToDictionary(userInput) {
		let inputName = userInput.name;
		this.dictionary[inputName] = userInput;
	}
}

class equationHandler {
	
	constructor(input, dictionary, children = []) {
		this.id = input.id;
		this.DOMinput = input;
		this.DOMresult = document.getElementById(`result_${this.id}`);
		this.DOMinfo = document.getElementById(`info_${this.id}`);
		
		this.dictionary = dictionary;
		this.children = children;
		this.parents = [];
		this.inputString = input.value;
	}
	
	set inputString(value) {
		this._inputString = value;
		this.validEquation = true;
		this.getTokens();
		this.updateDOM();
	}
	
	get inputString() {
		return this._inputString;
	}
	
	update() {
		this.inputString = this.DOMinput.value;
	}
	
	updateDOM() {
		if (this.validEquation) {
			this.DOMresult.innerHTML = numberToString(this.value);
			this.DOMinfo.innerHTML = this.getValidInfo();
		} else {
			this.DOMresult.innerHTML = 'NaN';
			this.DOMinfo.innerHTML = this.getErrorInfo();
		}
	}
	
	getValidInfo() {
		let info = '';
		info = `= ${numberToString(this.value)}`;
		info += `<Br>  <Br> ${this.getParsedEquation()} <Br>`;
		if (this.cellInfo.length > 0) {
			info += `<font style="color: ${cellColor}">`;
			info += this.cellInfo;
			info += `</font>`;
		}
		if (this.variableInfo.length > 0) {
			info += `<font style="color: ${variableColor}">`;
			info += this.variableInfo;
			info += `</font>`;
		}
		if (this.functionInfo.length > 0) {
			info += `<font style="color: ${neutralColor}">`;
			info += this.functionInfo;
			info += `</font>`;
		}
		return info;
	}
	
	getErrorInfo() {
		return `= NaN<Br> -> ${this.error}`;
	}
	
	getVar(varName) {
		return 1;
	}
	
	tokenDetails(n) {
		let token = this.tokens[n]
		let opReplace = {add: '+', mul: '*', div: '/', pow: '^', part: '_', sub: '-',
			leftParenthesis: '(', rightParenthesis: ')', comma: ',', mod: '%', mulFirst: '*'};
		let type = token[0];
		let kind = token[1];
		if (type == 'operator') {
			return `${opReplace[kind]}`;
		} else if (type == 'leftParenthesis' || type == 'rightParenthesis') {
			return `${opReplace[kind]}`;
		} else if (type == 'comma') {
			return `,`;
		} else if (type == 'start' || type == 'end') {
			return '';
		} else if (type == 'variable') {
			return `<font style="color: ${variableColor}">${kind}</font>`;
		} else if (type == 'cell') {
			return `<font style="color: ${cellColor}">${kind}</font>`;;
		} else if (type == 'cellRange') {
			return `<font style="color: ${cellColor}">${kind}:${token[2]}</font>`;;
		} else {
			return `${kind}`;
		}
	}
	
	getParsedEquation() {
		let len = this.tokens.length;
		let equation = '';
		for (let i = 0; i < len; i++) {
			if (this.tokens[i][1] === -1) {
				equation = equation + `-`;
				i++;
			}
			equation = equation + `${this.tokenDetails(i)}`;
		}
		return equation;
	}
	
	identifyChar(charCode) {
		if (97 <= charCode && charCode <= 122) {
			return 'letter';
		} else if (65 <= charCode && charCode <= 90) {
			return 'Cletter';
		} else if (48 <= charCode && charCode <= 57) {
			return 'number';
		} else if (46 == charCode) {
			return 'delimiter';
		} else if (44 == charCode) {
			return 'comma';
		} else if (charCode == 40) {
			return 'leftParenthesis';
		} else if (charCode == 41) {
			return 'rightParenthesis';
		} else if (charCode == 91) {
			return 'arrayBegin';
		} else if (charCode == 93) {
			return 'arrayEnd';
		} else if (charCode == 32 || charCode == 9) {
			return 'space';
		} else if (charCode == 37) {
			return 'mod';
		} else if (charCode == 42) {
			return 'mul';
		} else if (charCode == 43) {
			return 'add';
		} else if (charCode == 45) {
			return 'sub';
		} else if (charCode == 47) {
			return 'div';
		} else if (charCode == 94) {
			return 'pow';
		} else if (charCode == 58) {
			return 'colon';
		} else if (charCode == 95) {
			return 'part';
		} else {
			return 'unknown';
		} 
	}
	
	or(item, ...compareTo) {
		let len = compareTo.length;
		for (let i=0; i<len; i++) {
			if (item === compareTo[i]) {
				return true;
			}
		}
		return false;
	}
	
	getTokens() {
		// split up the expression into it's basic elements (numbers, operators, variables, brackets)
		// all strings that are defined in mathFunctions() are treated as functions, all others are
		// treated as variable names.
		this.tokens = [];
		let len = this.inputString.length;
		for (let i=0; i<len; i++) {
			// go through the equation character by character
			let type = this.identifyChar(this.inputString.charCodeAt(i));
			let nextType = this.identifyChar(this.inputString.charCodeAt(i+1));
			if (type === 'number' || type === 'delimiter') {
				// valid: 1234 or 12.34 or .1234
				// invalid: 1.23.4 or ..23
				let number = this.inputString[i];
				let delimiterFound = false;
				if (type === 'delimiter') {
					// number starting with delimiter is transformed as .12 -> 0.12
					if (nextType === 'number') {
						number = '0' + this.inputString[i];
						delimiterFound = true;
					} else {
						// single delimiter without any number
						this.error = 'misplaced delimiter';
						this.validEquation = false;
						return -1;
					}
				}
				while (nextType === 'number' || nextType === 'delimiter') {
					// successive number/delimiter characters are treated as a single number
					if (nextType === 'delimiter') {
						// check for multiple delimiters in single number
						if (delimiterFound) {
							this.error = 'misplaced delimiter';
							this.validEquation = false;
							return -1;
						}
						delimiterFound = true;
					}
					number = number + this.inputString[i+1];
					i++;
					nextType = this.identifyChar(this.inputString.charCodeAt(i+1));
				}
				this.tokens.push(['number', Number(number)]);
			} else if (type === 'letter' || type === 'Cletter') {
				// collect letters/numbers until next non-letter character
				let str = this.inputString[i];
				let counter = 0;
				while (this.or(nextType, 'letter', 'Cletter', 'number')) {
					str = str + this.inputString[i+1];
					i++;
					nextType = this.identifyChar(this.inputString.charCodeAt(i+1));
				}
				// differentiate between cell (A2), function (sin) and variable (bob123)
				if (mathFunctions[str.toLowerCase()] != undefined) {
					this.tokens.push(['function', str.toLowerCase(), 1]);
				} else if (stringToCell(str) != -1) {
					this.tokens.push(['cell', str, 0]);
				} else {
					this.tokens.push(['variable', str, 0]);
				}
			} else if (type === 'arrayBegin') {
				// arrays are denoted by [1,2,3] which is replaced by the function array(1,2,3)
				this.tokens.push(['function', 'array', 1]);
				this.tokens.push(['leftParenthesis', 'leftParenthesis']);
			} else if (type === 'arrayEnd') {
				this.tokens.push(['rightParenthesis', 'rightParenthesis']);
			} else if (this.or(type, 'leftParenthesis', 'rightParenthesis', 'comma')) {
				this.tokens.push([type, type]);
			} else if (type === 'space') { // do nothing
			} else if (type === 'unknown') {
				this.error = `unknown character (${this.inputString[i]})`;
				this.validEquation = false;
				return -1;
			} else {
				this.tokens.push(['operator', type, 2]);
			}
		}
		
		this.fixTokens();
	}
	
	fixTokens() {
		// check validity of tokens:
		//  -> check parenthesis
		//  -> check compliance with neighbors
		//
		// also fix a few complications:
		//  -> check for '+'/'-' operators that are actually signs
		//  -> if there are commas on the 'lowest level', interpret the input as array
		//  -> count number of arguments for every function with parenthesis, e.g. min(1,2,3)
		//
		// at the end the new tokens are submitted to the dictionary in order to update
		// the children and parent lists
		
		// add first token ['start', 'start'] and last token ['end', 'end']
		this.tokens.unshift(['start', 'start']);
		this.tokens.push(['end', 'end']);
		
		let groundLevelCommas = 0;
		let parenthesisLevel = 0;
		let parenthesisHierarchy = [];
		let len = this.tokens.length;
		for (let i = 1; i < len - 1; i++) {
			// possible token types: 
			//    number, function, cell, variable, leftParenthesis, rightParenthesis,
			//    operator, comma, start, end
			
			let current = this.tokens[i][0];
			let next = this.tokens[i+1][0];
			let previous = this.tokens[i-1][0];
			
			let valueNext = this.or(next, 'number', 'function', 'cell', 'variable', 'leftParenthesis', 'cellRange');
			let errorString = `${this.tokenDetails(i-1)}${this.tokenDetails(i)}${this.tokenDetails(i+1)}`;
			
			if (this.or(current, 'number', 'cell', 'variable')) {
				if (valueNext) {
					// fix: missing multiplication -> '2 sin(2)' or '2(1+1)' or '2 bob' or '2 A2'
					this.tokens.splice(i+1, 0, ['operator', 'mul', 2]);
					len++;
				}
			} else if (current === 'function') {
				if (next !== 'leftParenthesis') {
					// function arguments need to be in parenthesis
					this.error = `missing parenthesis: ${this.tokenDetails(i)} ${this.tokenDetails(i+1)}`;
					this.validEquation = false;
					return -1;
				}
			} else if (current === 'operator' && this.tokens[i][1] === 'sub') {
				// check '-' is used as a sign:
				if (!valueNext) {
					// minus operator has to be followed by a value (cell, function, number,...)
					this.error = `invalid operator: ${errorString}`;
					this.validEquation = false;
					return -1;
				} else if (this.or(previous, 'leftParenthesis', 'comma', 'start') && valueNext) {
					// -1+2 or 2+(-3+5) or -sin(2) array(1,-2,3)
					this.tokens.splice(i, 1, ['number', -1], ['operator', 'mulFirst', 2]);
					len++;
				} else if (previous === 'operator' && !this.or(this.tokens[i-1][1], 'add', 'sub')  && valueNext) {
					// 2^-1 or [1,2,3]_-1
					this.tokens.splice(i, 1, ['number', -1], ['operator', 'mulFirst', 2]);
					len++;
				}
			} else if (current === 'operator' && !valueNext && this.tokens[i+1][1] !== 'sub') {
				// operators have to be followed by a value (cell, function, number,...)
				// exception: 2^-3 or 2*-3
				this.error = `invalid operator: ${errorString}`;
				this.validEquation = false;
				return -1;
			} else if (current === 'operator' && this.tokens[i][1] === 'colon') {
				if (previous !== 'cell' || next !== 'cell') {
					// a colon can only be used for cell ranges: A1:B3 -> cells A1 to B3
					this.error = `misplaced colon: ${errorString}`;
					this.validEquation = false;
					return -1;
				} else {
					// combine cell range into a single token
					this.tokens.splice(i-1, 3, ['cellRange', this.tokens[i-1][1], this.tokens[i+1][1]]);
					i--;
					len = len - 2;
				}
			} else if (current === 'comma') {
				// commas are used to seperate the arguments of a function
				if (!valueNext && this.tokens[i+1][1] !== 'sub') {
					// comma needs to be followed by a value (or minus as in array(1,-2))
					this.error = `misplaced comma: ${errorString}`;
					this.validEquation = false;
					return -1;
				} else if (parenthesisLevel === 0) {
					// commas outside of parenthesis are treated as array declarations
					groundLevelCommas++;
				} else if (parenthesisHierarchy[parenthesisLevel - 1] === 0) {
					// comma in parenthesis which is not part of a function call
					this.error = 'misplaced comma';
					this.validEquation = false;
					return -1;
				} else {
					// comma in a function call -> increase number of arguments by 1
					parenthesisHierarchy[parenthesisLevel - 1][2]++;
				}
			} else if (current === 'leftParenthesis') {
				if (this.or(next, 'operator', 'comma', 'end') && this.tokens[i+1][1] !== 'sub') {
					// invalid: (*2,2 or (,2 or ( at the end
					this.error = 'misplaced parenthesis';
					this.validEquation = false;
					return -1;
				} else if (previous === 'function') {
					// parenthesis contains the arguments of a function
					parenthesisHierarchy.push(this.tokens[i-1]);
					parenthesisLevel++;
				} else {
					// parenthesis used for evaluation order
					parenthesisHierarchy.push(0)
					parenthesisLevel++;
				}
			} else if (current == 'rightParenthesis') {
				if (parenthesisLevel === 0) {
					this.error = 'misplaced parenthesis';
					this.validEquation = false;
					return -1;
				} else if (valueNext) {
					// fix: missing multiplication -> '(1+1)(2+2) or (1+1)x'
					this.tokens.splice(i+1, 0, ['operator', 'mul', 2]);
					len++;
				}
				parenthesisLevel--;
				parenthesisHierarchy.pop();
			}
		}
		
		if (parenthesisLevel !== 0) {
			this.error = 'missing parenthesis';
			this.validEquation = false;
			return -1;
		}
		
		// remove start and end tokens
		this.tokens.pop();
		this.tokens.shift();
		
		// check if there is an implicit array definition e.g. 1,2,3 -> array(1,2,3)
		if (groundLevelCommas > 0) {
			this.tokens.unshift(['function', 'array', groundLevelCommas + 1], ['leftParenthesis', 'leftParenthesis']);
			this.tokens.push(['rightParenthesis', 'rightParenthesis']);
		}
		
		// submit new token list to dictionary
		// this method will check all dependencies (children and parents)
		this.dictionary.updateParents(this);
		
		// continue by calculating the reversed polish notation
		this.getRPN();
	}
	
	asso(str) {
		if (str == 'pow' || str == 'part') {
			return 'right';
		} else {
			return 'left';
		}
	}
	
	precedence(str) {
		if (str == 'mod' || str == 'mul' || str == 'div') {
			return 2;
		} else if (str == 'pow' || str == 'part') {
			return 3;
		} else if (str == 'mulFirst') {
			return 4;
		} else {
			return 0;
		}
	}
	
	getRPN() {
		// compute the reversed polish notation of the expression
		let functionStack = [];
		let outputQueue = [];
		let len = this.tokens.length;
		for (let i=0; i<len; i++) {
			let type = this.tokens[i][0];
			if (this.or(type, 'number', 'cell', 'variable', 'cellRange')) {
				outputQueue.push(this.tokens[i]);
			} else if (type === 'function') {
				functionStack.push(this.tokens[i]);
			} else if (type === 'operator') {
				let counter = 0;
				while (functionStack.length > 0) {
					let x = this.tokens[i][1];
					let stackTop = functionStack.pop();
					let x2 = stackTop[1];
					if (stackTop[0] === 'function') {
						outputQueue.push(stackTop);
					} else if (this.precedence(x2) > this.precedence(x)) {
						outputQueue.push(stackTop);
					} else if (this.precedence(x2) === this.precedence(x) && this.asso(x2) === 'right') {
						outputQueue.push(stackTop);
					} else {
						functionStack.push(stackTop);
						break;
					}
				}
				functionStack.push(this.tokens[i]);
			} else if (type === 'leftParenthesis') {
				functionStack.push(this.tokens[i]);
			} else if (type === 'comma') {
				let stackTop = functionStack.pop();
				while (stackTop[0] !== 'leftParenthesis') {
					outputQueue.push(stackTop);
					stackTop = functionStack.pop();
					if (stackTop === undefined) {
						this.error = 'unknown error in calculation';
						this.validEquation = false;
						return -1;
					}
				}
				functionStack.push(stackTop);
			} else if (type === 'rightParenthesis') {
				let stackTop = functionStack.pop();
				while (stackTop[0] !== 'leftParenthesis') {
					if (stackTop === undefined) {
						return 'unknown parenthesis error';
					}
					outputQueue.push(stackTop);
					stackTop = functionStack.pop();
				}
			}
		}
		while (functionStack.length > 0) {
			outputQueue.push(functionStack.pop());
		}
		this.RPN = outputQueue.reverse();
		this.calculateValue();
	}
	
	calculateValue() {
		/** Takes a reversed polish notation (RPN) as input and calculates the resulting value.
		*   
		*  In RPN the equation '1+2/3' is stored as RPN: [1,3,2,'div','add']. Additionally we have a stack: []
		*  To calculate the final value we always take the first element of the RPN and act depending on type:
		*    item is number/variable     ->  move onto stack
		*    item is operator/function   ->  take N numbers from the stack (N = number of args of func)
		*                                    and evaluate function, put result on stack
		*
		*  For the example above this looks like:
		*     RPN: [1,3,2,'div','add']    stack: []
		*     RPN: [3,2,'div','add']      stack: [1]
		*     RPN: [2,'div','add']        stack: [1,3]
		*     RPN: ['div','add']          stack: [1,3,2]
		*             evaluate: div(2,3)
		*     RPN: ['add']                stack: [1,0.666]
		*             evaluate: add(0.666,1)
		*     RPN: []                     stack: [1.666] <- result
		*
		*  If there is exactly one number left on the stack at the end, this is the result.
		*  If there are multiple items left, the equation is not mathematically correct!
		**/
		
		// check if RPN just contains an error code...
		
		let RPN = this.RPN.slice();
		let stack = [];
		this.cellInfo = '';
		this.variableInfo = '';
		this.functionInfo = '';
		while (RPN.length > 0) {
			let element = RPN.pop();
			if (element[0] == 'number') {
				stack.push(element[1]);
			} else if (element[0] == 'variable') {
				// check if variable exists
				let value = element[2];
				if (isNaN(value)) {
					this.validEquation = false;
					this.error = `unknown variable: ${element[1]}`;
					return -1;
				}
				stack.push(value);
				this.variableInfo += `<Br>- ${element[1]} = ${numberToString(value)}`;
			} else if (element[0] == 'cell') {
				// check if cell is defined
				let value = element[2];
				stack.push(value);
				this.cellInfo += `<Br>- ${element[1]} = ${numberToString(value)}`;
			} else if (element[0] == 'cellRange') {
				// check if cell is defined
				let value = element[3];
				stack.push(value);
				this.cellInfo += `<Br>- ${element[1]}:${element[2]} = ${numberToString(value)}`;
			} else if (element[0] === 'operator' || element[0] === 'function') {
				let func = mathFunctions[element[1]];
				let Nargs = element[2];
				if (Nargs > stack.length) {
					this.validEquation = false;
					this.error = 'unknown error in evaluation';
					return -1;
				}
				let args = [];
				let argString = '';
				for (let i = 0; i < Nargs; i++) {
					let arg = stack.pop();
					args.unshift(arg);
					argString += `${numberToString(arg)}, `
				}
				argString = argString.substring(0, argString.length - 2);
				let result = func(...args);
				if (typeof result === 'string') {
					this.error = result;
					this.validEquation = false;
					return -1;
				}
				stack.push(result);
				if (element[0] === 'function' && !this.or(element[1], 'array', 'range')) {
					this.functionInfo += `<Br>- ${element[1]}(${argString}) = ${numberToString(result)}`;
				}
			}
		}
		if (stack.length == 1) {
			this.value = stack[0];
		} else {
			this.validEquation = false;
			this.error = 'unknown error in evaluation';
			return -1;
		}
	}
}

function inputChange(event) {
	//console.log(`input change in ${event.target.id}`);
	inputDictionary.inputChange(event.target);
}

console.log(mathFunctions.add(NaN,NaN))

let inputDictionary = new dictionary();
let variableColor = '#f78b2d'
let cellColor = '#f78b2d';
let neutralColor = '#f78b2d';

document.addEventListener('input', inputChange);


