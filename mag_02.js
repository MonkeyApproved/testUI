/************ GENERAL FUNCTIONS/DEFINITIONS ******/

const variableColor = '#f78b2d'
const cellColor = '#f78b2d';
const neutralColor = '#f78b2d';
const svgNamespace = 'http://www.w3.org/2000/svg';
const xlinkNamespace = 'http://www.w3.org/1999/xlink';

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

/************ RESIZABLE WINDOWS **********/

// TO DO: fix scroll position when dragging and resizing... (see bringToFrontOnClick for basic idea)
// -> maybe even change scroll when resizing to the right (keep content static on page)

function addResizerDiv(type, div) {
	const resizer = document.createElement('div');
	resizer.className = `resizer ${type}`;
	resizer.addEventListener('mousedown', initializeResize);
	div.prepend(resizer);
}

function initializeResize(event) {
	event.preventDefault();
	const resizer = event.target.classList[1];
	// classify the type of resize action
	let vertical = 'none';
	if (resizer === 'top' || resizer === 'topleft' || resizer === 'topright') {
		vertical = 'from top';
	} else if (resizer === 'bottom' || resizer === 'bottomleft' || resizer === 'bottomright') {
		vertical = 'from bottom';
	}
	let horizontal = 'none';
	if (resizer === 'left' || resizer === 'topleft' || resizer === 'bottomleft') {
		horizontal = 'from left';
	} else if (resizer === 'right' || resizer === 'topright' || resizer === 'bottomright') {
		horizontal = 'from right';
	}
	
	// grab the original positions and sizes
	const element = event.path[1];
   const originalWidth = element.clientWidth;
   const originalHeight = element.clientHeight;
   const originalRect = element.getBoundingClientRect();
   const originalMouseX = event.clientX;
   const originalMouseY = event.clientY;
   window.addEventListener('mousemove', resizeElement);
   window.addEventListener('mouseup', terminateResize);
	
	function resizeElement(event) {
		const mouseMoveX = event.clientX - originalMouseX;
		const mouseMoveY = event.clientY - originalMouseY;
		// horizontal resize
		if (horizontal === 'from right') {
			element.style.width = `${originalWidth + mouseMoveX}px`;
		} else if (horizontal === 'from left') {
			element.style.width = `${originalWidth - mouseMoveX}px`;
			element.style.left = `${originalRect.left + mouseMoveX}px`;
		}
		// vertical resize
		if (vertical === 'from bottom') {
			element.style.height = `${originalHeight + mouseMoveY}px`;
		} else if (vertical === 'from top') {
			element.style.height = `${originalHeight - mouseMoveY}px`;
			element.style.top = `${originalRect.top + mouseMoveY}px`;
		}
	}
	
	function terminateResize(event) {
		window.removeEventListener('mousemove', resizeElement);
		window.removeEventListener('mouseup', terminateResize);
	}
}

function makeResizable(element, horizontal='all', vertical='all') {
	// check from which directions the resize is enabled (left/right/top/bottom)
	let resizeLeft = false;
	if (horizontal === 'left' || horizontal === 'all') {
		resizeLeft = true;
	}
	let resizeRight = false;
	if (horizontal === 'right' || horizontal === 'all') {
		resizeRight = true;
	}
	let resizeTop = false;
	if (vertical === 'top' || vertical === 'all') {
		resizeTop = true;
	}
	let resizeBottom = false;
	if (vertical === 'bottom' || vertical === 'all') {
		resizeBottom = true;
	}
	
	// set up the corner resizers (2D resize)
	if (resizeLeft && resizeTop) {
		addResizerDiv('topleft', element)
	}
	if (resizeLeft && resizeBottom) {
		addResizerDiv('bottomleft', element)
	}
	if (resizeRight && resizeTop) {
		addResizerDiv('topright', element)
	}
	if (resizeRight && resizeBottom) {
		addResizerDiv('bottomright', element)
	}
	
	// set up the resizers on the sides (1D resize)
	if (resizeLeft) {
		addResizerDiv('left', element)
	}
	if (resizeRight) {
		addResizerDiv('right', element)
	}
	if (resizeTop) {
		addResizerDiv('top', element)
	}
	if (resizeBottom) {
		addResizerDiv('bottom', element)
	}
}

function initializeDrag(event) {
	event.preventDefault();
	
	// grab the original positions and sizes
	const element = event.path[1];
	event.path[2].append(element);
   const originalRect = element.getBoundingClientRect();
   const originalMouseX = event.clientX;
   const originalMouseY = event.clientY;
   window.addEventListener('mousemove', dragElement);
   window.addEventListener('mouseup', terminateDrag);
	function dragElement(event) {
		const mouseMoveX = event.clientX - originalMouseX;
		const mouseMoveY = event.clientY - originalMouseY;
		element.style.left = `${originalRect.left + mouseMoveX}px`;
		element.style.top = `${originalRect.top + mouseMoveY}px`;
	}
	
	function terminateDrag(event) {
		window.removeEventListener('mousemove', dragElement);
		window.removeEventListener('mouseup', terminateDrag);
	}
}

function getSVG(element, pathString, className='svgElement') {
	const svg = document.createElementNS(svgNamespace, 'svg');
	svg.setAttribute('class', className);
	svg.setAttribute('viewBox', '0 0 100 100');
	const path = document.createElementNS(svgNamespace, 'path');
	path.setAttribute('d', pathString);
	svg.append(path);
	return svg;
}

function addMenuBar(element, title='') {
	const topBar = document.createElement('div');
	topBar.className = `topBar`;
	topBar.innerHTML = title;
	topBar.addEventListener('mousedown', initializeDrag);
	const svg = getSVG(topBar, 'M 20 20 L 80 80 M 20 80 L 80 20', 'topBarClose');
	svg.addEventListener('mousedown', closeWindow);
	topBar.append(svg);
	element.append(topBar);
	
	function closeWindow(event) {
		element.style.display = 'none';
	}
}

function getClassFromEventPath(event, className) {
	let len = event.path.length;
	for (let i=0; i<len; i++) {
		if (event.path[i].className === className) {
			return event.path[i];
		}
	}
	return -1;
}

function bringToFrontOnClick(event) {
	const windowDiv = getClassFromEventPath(event, 'windowContainer');
	const windowContent = getClassFromEventPath(event, 'windowContent');
	let scrollLeft = 0;
	let scrollTop = 0;
	if (windowContent !== -1) {
		scrollLeft = windowContent.scrollLeft;
		scrollTop = windowContent.scrollTop;
	}
	if (windowDiv !== -1) {
		windowDiv.parentNode.append(windowDiv);
	}
	if (windowContent !== -1) {
		windowContent.scrollLeft = scrollLeft;
		windowContent.scrollTop = scrollTop;
	}
}

function turnIntoWindow(element, title='') {
	const windowDiv = document.createElement('div');
	windowDiv.className = 'windowContainer';
	const content = document.createElement('div');
	content.className = 'windowContent';
	content.append(element);
	windowDiv.append(content);
	makeResizable(windowDiv);
	addMenuBar(windowDiv, title);
	windowDiv.addEventListener('mousedown', bringToFrontOnClick);
	return windowDiv;
}

/************ BUILDING THE DOM **********/

// The following counters are used to uniquely identify an input field in the DOM tree.
// inputCounter - is used for independent (single) input fields in the UI
// spreadsheetCounter - identifies the spreadsheet (if multiple spreadsheets are used)
// variableListCounter - identifies the variable list (if multiple lists are used)
let inputCounter = 0;
let spreadsheetCounter = 0;
let variableListCounter = 0;

function getInfoDiv(id) {
	let wrapperDiv = document.createElement('div');
	
	let inputInfo = document.createElement('div');
	inputInfo.className = 'inputInfo';
	inputInfo.id = `info_${id}`;
	inputInfo.style.display = 'none';
	
	let basicInfo = document.createElement('div');
	basicInfo.className = 'basicInfo';
	basicInfo.id = `basicInfo_${id}`;
	
	let extendedInfo = document.createElement('div');
	extendedInfo.className = 'extendedInfo';
	extendedInfo.id = `extendedInfo_${id}`;
	extendedInfo.style.display = 'none';
	
	let extendInfoButton = document.createElement('div');
	extendInfoButton.className = 'extendInfoButton';
	extendInfoButton.id = `extendInfoButton_${id}`;
	extendInfoButton.innerHTML = '<< show details >>';
	
	inputInfo.append(basicInfo);
	inputInfo.append(extendedInfo);
	inputInfo.append(extendInfoButton);
	wrapperDiv.append(inputInfo);
	
	return wrapperDiv;
}

function getEquationInput(id, startValue='', classExtension='') {
	/* Equation inputs consist of three main elements:
	*  - result div -> is used to display the result of the equation
	*                  (shown if input in not in states focus or hover)
	*  - input -> text input for user
	*  - info -> info box for live feedback on the user input
	*            (shown if input is in focus)
	*  For details check the CSS file!
	*/
	         
	const inputWrapper = document.createElement('div');
	inputWrapper.className = `inputWrapper${classExtension}`;
	inputWrapper.id = `wrapper_${id}`;
	
	const inputResult = document.createElement('div');
	inputResult.className = `inputResult${classExtension}`;
	inputResult.id = `result_${id}`;
	inputResult.innerHTML = startValue;
	
	const equationInput = document.createElement('input');
	equationInput.className = `equationInput${classExtension}`;
	equationInput.id = id;
	equationInput.value = startValue;
	
	const inputInfo = getInfoDiv(id);
	
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

class containerPrototype {
	constructor(dictionary) {
		this.DOMelements = {};
		this.dictionary = dictionary;
	}
	
	getEquationInputSingle(elementRef, startValue, whoYaGonnaCall, classExtension='') {
		if (classExtension !== '') {
			classExtension = ` ${classExtension}`;
		}
		const equationWrapper = getEquationInput(`FIELD_${inputCounter}`, startValue, classExtension);
		const equation = this.dictionary.claimField(equationWrapper.children[1], whoYaGonnaCall, elementRef);
		inputCounter++;
		
		const DOMelements = {wrapper: equationWrapper, equation: equation, input: equationWrapper.children[1],
			result: equationWrapper.children[0]};
		
		return DOMelements;
	}
	
	getInputFieldLabelTop(elementRef, title, startValue, whoYaGonnaCall, classExtension='') {
		if (classExtension === '') {
			classExtension = 'single';
		} else {
			classExtension = `single ${classExtension}`;
		}
		const equation = getEquationInputSingle(elementRef, startValue, whoYaGonnaCall, classExtension);
		equation.input.required = true;
		const label = document.createElement('div');
		label.className = 'singleInputLabel';
		label.innerHTML = title;
		equation.info.append(label);
		return equation;
	}
	
	getSelector(elementRef, itemList, startValue, whoYaGonnaCall, classExtension = '') {
		if (classExtension !== '') {
			classExtension = ` ${classExtension}`;
		}
		
		const typeDiv = document.createElement('div');
		typeDiv.className = `typeChoice${classExtension}`;
		
		const selected = document.createElement('button');
		selected.className = 'selected';
		selected.innerHTML = startValue;
		
		const choices = document.createElement('div');
		choices.className = 'choices';
		
		for (let key in itemList) {
			const c = document.createElement('button');
			c.innerHTML = key;
			const className = itemList[key][0];
			if (itemList[key][1] === startValue) {
				c.className = 'liSelected';
			} else {
				c.className = className;
			}
			choices.append(c);
		}
		
		typeDiv.append(selected);
		typeDiv.append(choices);
		
		function mousedown(event) {
			const selection = itemList[event.target.innerHTML][1];
			if (selected.innerHTML !== selection) {
				// change the selection
				selected.innerHTML = selection;
				whoYaGonnaCall(elementRef, selection);
				// update the item list to reflect the new selection
				// (highlight the selected item in the list)
				const items = event.path[1].children;
				const len = items.length;
				for (let i=0; i<len; i++) {
					const itemValue = items[i].innerHTML;
					if (itemValue === event.target.innerHTML) {
						items[i].className = 'liSelected';
					} else if (items[i].className !== 'liHeader') {
						items[i].className = 'liItem';
					}
				}
			}
		}
		choices.addEventListener('mousedown', mousedown); 
		if (elementRef !== '') {
			this.DOMelements[elementRef] = {wrapper: typeDiv, button: selected, list: choices};
		}
		return {wrapper: typeDiv, button: selected, list: choices};
	}
	
	setSelector(elementRef, value) {
		this.DOMelements[elementRef].button.innerHTML = value;
		const items = this.DOMelements[elementRef].list.children;
		const len = items.length;
		for (let i=0; i<len; i++) {
			const itemValue = items[i].innerHTML;
			if (itemValue === event.target.innerHTML) {
				items[i].className = 'liSelected';
			} else if (items[i].className !== 'liHeader') {
				items[i].className = 'liItem';
			}
		}
	} 
	
	getDoubleChoice(elementRef, choice1, choice2, startValue, whoYaGonnaCall, classExtension = '') {
		if (classExtension !== '') {
			classExtension = ` ${classExtension}`;
		}
		
		const wrapper = document.createElement('div');
		wrapper.className = `doubleChoice${classExtension}`;
		const selected = document.createElement('button');
		selected.className = 'selected';
		selected.innerHTML = startValue;
		const choices = document.createElement('div');
		choices.className = 'choices';
		const c1 = document.createElement('button');
		c1.className = 'choice1';
		c1.innerHTML = choice1;
		const c2 = document.createElement('button');
		c2.className = 'choice2';
		c2.innerHTML = choice2;
	  	
		choices.append(c1);
		choices.append(c2);
		wrapper.append(selected);
		wrapper.append(choices);
	  	
		function mouseDown(event) {
			const selection = event.target.innerHTML;
			if (selected.innerHTML !== selection) {
				selected.innerHTML = selection;
				whoYaGonnaCall(elementRef, selection);
			}
		}
		choices.addEventListener('mousedown', mouseDown);
		return {wrapper: wrapper, button: selected, list: choices};
	}
	
	getCoordinateInput(elementRef, x='', xScale='x', y='', yScale='y', classExtension = '') {
		const wrapper = document.createElement('div');
		if (classExtension !== '') {
			wrapper.className = `coordinateInput ${classExtension}`;
		} else {
			wrapper.className = `coordinateInput`;
		}
	
		const selectX = this.getDoubleChoice(`${elementRef}X`, 'x', 'dx', xScale, this.scalingChange.bind(this));
		const selectY = this.getDoubleChoice(`${elementRef}Y`, 'y', 'dy', yScale, this.scalingChange.bind(this));
	
		const inputName = document.createElement('div');
		const p = document.createElement('p');
		inputName.append(p);
		p.innerHTML = `${elementRef}:`;
		inputName.className = 'coordinateInput name';
		const xInput = this.getEquationInputSingle(`${elementRef}X`, x, this.coordinateChange.bind(this), 'coordinate');
		const yInput = this.getEquationInputSingle(`${elementRef}Y`, y, this.coordinateChange.bind(this), 'coordinate');
		wrapper.append(inputName);
		wrapper.append(selectX.wrapper);
		wrapper.append(xInput.wrapper);
		wrapper.append(selectY.wrapper);
		wrapper.append(yInput.wrapper);
		
		this.DOMelements[`${elementRef}X`] = {value: xInput, scaling: selectX};
		this.DOMelements[`${elementRef}Y`] = {value: yInput, scaling: selectY};
		this.DOMelements[elementRef] = {wrapper: wrapper, label: inputName};
		return {wrapper: wrapper, inputX: xInput, inputY: yInput, selectX: selectX, selectY: selectY};
	}
	
	getCoordinateValue(elementRef) {
		return this.DOMelements[elementRef].value.equation.value;
	}
	
	getCoordinateScaling(elementRef) {
		const scaling = this.DOMelements[elementRef].scaling.button.innerHTML;
		if (scaling === 'x' || scaling === 'y') {
			return 'absolute';
		} else {
			return 'relative';
		}
	}
	
	setCoordinateValue(elementRef, value) {
		this.DOMelements[elementRef].value.input.value = `${value}`;
		this.DOMelements[elementRef].value.equation.silentUpdate();
	}
	
	setCoordinateScaling(elementRef, value) {
		if (value === 'absolute') {
			value = this.DOMelements[elementRef].scaling.choices.children[0].innerHTML;
		} else if (value === 'relative') {
			value = this.DOMelements[elementRef].scaling.choices.children[1].innerHTML;
		}
		this.DOMelements[elementRef].scaling.button.innerHTML = value;
	}
	
	coordinateChange(elementRef, value) {
		console.log(`${elementRef}: value changed to: ${value}`);
	}
	
	scalingChange(elementRef, value) {
		console.log(`${elementRef}: scaling changed to: ${value}`);
	}
	
	disableInput(input) {
		input.style.opacity = 0.5;
		input.style.pointerEvents = 'none';
	}
}

/************ EQUATION EVALUATION ************/

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
	},
	indexOfMin(list) {
		let min = list[0];
		let index = 0;
		const len = list.length;
		for (let i=1; i<len; i++) {
			if (list[i]<min) {
				min = list[i];
				index = i;
			}
		}
		return index;
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
			this.handleValueChange(input);
		} else if (inputID[0] === 'NAME') {
			this.handleNameChange(input, inputID[1]);
		} else if (inputID[0] === 'VALUE') {
			this.handleValueChange(input);
		} else if (inputID[0] === 'FIELD') {
			this.handleFieldChange(input);
		} else {
			console.log(`ERROR-0120 (unknown id: ${input.id})`);
		}
	}
	
	handleValueChange(input) {
		// the user has changed the value of an input
		let entry = this.dictionary[input.id];
		if (entry === undefined) {
			// this is the first time this input was used -> add new entry
			let newEntry = new equationHandler(input, this);
			this.dictionary[input.id] = newEntry;
			newEntry.update();
		} else if (Array.isArray(entry)) {
			// first use but other cells already refer to this input (childrenList = entry)
			let newEntry = new equationHandler(input, this, entry);
			this.dictionary[input.id] = newEntry;
			newEntry.update();
		} else {
			// this input has previously been used and only has to be updated
			entry.update();
		}
	}
	
	handleNameChange(input, inputNumber) {
		let entry = this.dictionary[input.id];
		if (entry === undefined) {
			this.dictionary[input.id] = new nameHandler(input, inputNumber, this)
		} else {
			entry.update();
		}
	}
	
	handleFieldChange(input) {
		let entry = this.dictionary[input.id];
		if (entry === undefined) {
			// this field was changed for the first time and has not been announced
			let newEntry = new FIELDequationHandler(input, this);
			this.dictionary[input.id] = newEntry;
			newEntry.update();
		} else if (Array.isArray(entry)) {
			// this field is changed for the first time and has been announced
			let newEntry = new FIELDequationHandler(input, this, entry[0], entry[1]);
			this.dictionary[input.id] = newEntry;
			newEntry.update();
		} else {
			// this field was changed before and has to be updated
			entry.update();
		}
	}
	
	claimField(input, whoYaGonnaCall, elementRef) {
		let entry = this.dictionary[input.id];
		if (entry === undefined) {
			const newEntry = new FIELDequationHandler(input, this, whoYaGonnaCall, elementRef);
			this.dictionary[input.id] = newEntry;
			return newEntry;
		} else {
			console.log(`ERROR-DI10 (claim failed for ${input.id})`);
			return -1;
		}
	}
	
	highlightParents(id) {
		let entry = this.dictionary[id];
		if (entry instanceof equationHandler) {
			parents = entry.parents;
			let len = parents.length;
			for (let i=0; i<len; i++) {
				this.setInputLang(parents[i], 'fr');
			}
		}
	}
	
	setInputLang(id, lang) {
		// set language of input field
		let element = document.getElementById(id);
		if (element) {
			element.lang = lang; 
		}
		// set language of result field
		element = document.getElementById(`result_${id}`);
		if (element) {
			element.lang = lang; 
		}
	}
	
	updateParents(equation) {
		// This method is called while an equation is evaluated:
		// the current tokens of the input have been calculated and
		// this method is used to update the cell/variable values in the
		// tokens and to update the parent list.
		
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
				token[2] = value;
			} else if (tokens[i][0] === 'cellRange') {
				let rangeList = cellRangeToCellStrings(token[1], token[2]);
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
	
	updateChildren(id) {
		// this method is called once the new value of an input is calculated
		// it is used to communicate the change to all the children
		let affectedEquations = {};
		this.collectChildren(id, affectedEquations);
		let cyclicDependence = false;
		
		let removeNext = id;
		if (affectedEquations[id] === undefined) {
			while (removeNext !== undefined) {
				removeNext = this.removeIdFromAffectedEquations(removeNext, affectedEquations);
				this.reevaluateEquation(removeNext);
			}
			let unresolvedKeys = Object.keys(affectedEquations);
			if (unresolvedKeys.length !== 0) {
				console.log(`WARNING: cyclic dependence`);
				cyclicDependence = true;
			}
		} else {
			console.log(`WARNING: cyclic dependence`);
			cyclicDependence = true;
		}
		
		if (cyclicDependence) {
			for (let key in affectedEquations) {
				let entry = this.dictionary[key];
				if (entry instanceof equationHandler) {
					entry.value = NaN;
					entry.error = 'cyclic dependence';
					entry.updateDOM();
				}
			}
		}
	}
	
	collectChildren(id, affectedEquations) {
		// this method creates a list of all affected equations, listing each cells affected parents
		let children = this.getEntrysChildren(id);
		let len = children.length;
		for (let i = 0; i < len; i++) {
			if (affectedEquations[children[i]] === undefined) {
				affectedEquations[children[i]] = [id];
				this.collectChildren(children[i], affectedEquations);
			} else if (affectedEquations[children[i]].indexOf(id) === -1) {
				affectedEquations[children[i]].push(id);
			}
		}
	}
	
	getEntrysChildren(id) {
		let entry = this.dictionary[id];
		if (entry === undefined) {
			console.log(`ERROR-DI08 (${id})`);
			return [];
		}
		else if (Array.isArray(entry)) {
			return entry;
		} else {
			return entry.children;
		}
	}
	
	removeIdFromAffectedEquations(id, affectedEquations) {
		let removeNext;
		// remove the key itself
		delete affectedEquations[id];
		// remove the id from all other entries
		for (let key in affectedEquations) {
			let index = affectedEquations[key].indexOf(id);
			if (index !== -1) {
				affectedEquations[key].splice(index, 1);
			}
			if (affectedEquations[key].length === 0) {
				removeNext = key;
			}
		}
		return removeNext;
	}
	
	reevaluateEquation(id) {
		let entry = this.dictionary[id];
		if (entry instanceof equationHandler) {
			this.updateEquationRPN(entry);
			entry.recalculate();
		}
	}
	
	updateEquationRPN(entry) {
		let len = entry.RPN.length;
		for (let i=0; i<len; i++) {
			this.updateTokenValue(entry.RPN[i]);
		}
	}
	
	updateTokenValue(token) {
		let type = token[0];
		if (type === 'cell') {
			let cellID = `CELL_${token[1]}`;
			let value = this.dictionary[cellID].value;
			if (value === undefined) {
				token[2] = NaN;
			} else {
				token[2] = value;
			}
		} else if (type === 'variable') {
			let value = this.dictionary[token[1]].value;
			if (value === undefined) {
				token[2] = NaN;
			} else {
				token[2] = value;
			}
		} else if (type === 'cellRange') {
			let rangeList = cellRangeToCellStrings(token[1], token[2]);
			let rangeArray = [];
			let rangeLen = rangeList.length;
			for (let n = 0; n < rangeLen; n++) {
				let cellID = `CELL_${rangeList[n]}`;
				let value = this.dictionary[cellID].value;
				if (value === undefined) {
					rangeArray.push(NaN);
				} else {
					rangeArray.push(value);
				}
			}
			token[3] = rangeArray;
		}
	}
	
	getEquationHandler(id) {
		let entry = this.dictionary[id];
		if (entry === undefined) {
			// this input is not in the dictionary yet -> add new entry
			let input = document.getElementById(id);
			let newEntry = new equationHandler(input, this);
			this.dictionary[id] = newEntry;
			return newEntry;
		} else if (Array.isArray(entry)) {
			// first use but other cells already refer to this input (childrenList = entry)
			let input = document.getElementById(id);
			let newEntry = new equationHandler(input, this, entry);
			this.dictionary[id] = newEntry;
			return newEntry;
		} else {
			// this input is already defined
			return entry;
		}
	}
	
	deleteEntry(id) {
		let entry = this.dictionary[id];
		if (entry instanceof equationHandler) {
			let children = entry.children;
			if (children.length === 0) {
				delete this.dictionary[id];
			} else {
				this.dictionary[id] = children;
				this.updateChildren(id);
			}
		}
	}
}

class equationHandler {
	
	constructor(input, dictionary, children = []) {
		this.id = input.id;
		this.DOMinput = input;
		this.DOMresult = input.previousSibling;
		this.DOMinfoBox = input.nextSibling.children[0];
		this.DOMbasicInfo = this.DOMinfoBox.children[0];
		this.DOMextendedInfo = this.DOMinfoBox.children[1];
		/*
		this.DOMresult = document.getElementById(`result_${this.id}`);
		this.DOMinfoBox = document.getElementById(`info_${this.id}`);
		this.DOMbasicInfo = document.getElementById(`basicInfo_${this.id}`);
		this.DOMextendedInfo = document.getElementById(`extendedInfo_${this.id}`);
		*/
		
		this.dictionary = dictionary;
		this.children = children;
		this.parents = [];
	}
	
	set inputString(value) {
		this._inputString = value;
		this.validEquation = true;
		this.error = 'none';
		this.getTokens();
		this.dictionary.updateChildren(this.id);
		this.updateDOM();
	}
	
	get inputString() {
		return this._inputString;
	}
	
	update() {
		this.inputString = this.DOMinput.value;
	}
	
	recalculate() {
		if (this.validEquation) {
			this.error = 'none';
			this.calculateValue();
			this.updateDOM();
		}
	}
	
	updateDOM() {
		// update all elements in the info box and the result
		
		if (this.error !== 'none' && this.validEquation) {
			if (this.error === 'cyclic dependence') {
				this.DOMresult.innerHTML = 'ERROR';
			} else {
				this.DOMresult.innerHTML = 'NaN';
			}
			this.DOMbasicInfo.innerHTML = this.getBasicInfo();
			this.DOMextendedInfo.innerHTML = this.getExtendedInfo();
		} else if (this.validEquation) {
			this.DOMresult.innerHTML = numberToString(this.value);
			this.DOMbasicInfo.innerHTML = this.getBasicInfo();
			this.DOMextendedInfo.innerHTML = this.getExtendedInfo();
		} else {
			this.DOMresult.innerHTML = 'NaN';
			this.DOMbasicInfo.innerHTML = this.getBasicInfo();
			this.DOMextendedInfo.innerHTML = this.getExtendedInfo();
		}
		
		// check if the input requires any info box
		if (this.tokens.length === 2) {
			// no input (tokens are only start and end) -> hide infoBox
			this.DOMinfoBox.style.display = 'none';
			this.DOMresult.innerHTML = '';
		} else if (this.tokens.length === 3) {
			// single input -> only show if input is cell or known variable
			let inputType = this.tokens[1][0];
			let inputValue = this.tokens[1][1];
			if (inputType === 'number') {
				this.DOMinfoBox.style.display = 'none';
			} else if (inputType === 'variable') {
				if (isNaN(inputValue)) {
					this.DOMinfoBox.style.display = 'none';
				} else {
					this.DOMinfoBox.style.display = 'inherit';
				}
			} else {
				this.DOMinfoBox.style.display = 'inherit';
			}
		} else {
			// for longer equations -> check if there is only text
			if (this.inputTextOnly) {
				this.DOMinfoBox.style.display = 'none';
				this.DOMresult.innerHTML = this.inputString;
			} else {
				this.DOMinfoBox.style.display = 'inherit';
			}
		}
	}
	
	getBasicInfo() {
		if (this.validEquation) {
			return `= ${numberToString(this.value)}`;
		} else {
			return `= NaN`;
		}
	}
	
	getExtendedInfo() {
		let info = '';
		if (this.error !== 'none' && this.validEquation) {
			info += this.getParsedEquation();
			info += `<p><span style="background-color: #FF000088">${this.error}</span></p>`;
			info += this.getDependencyInfo();
			info += this.functionInfo;
		} else if (this.validEquation) {
			info += this.getParsedEquation();
			info += this.getDependencyInfo();
			info += this.functionInfo;
		} else {
			info += this.getParsedEquation();
			info += `<p><span style="background-color: #FF000088">${this.error}</span></p>`;
		}
		return info;
	}
	
	tokenDetails(n) {
		let token = this.tokens[n]
		let opReplace = {add: '+', mul: '&#183;', div: '/', pow: '^', part: '_', sub: '-',
			leftParenthesis: '(', rightParenthesis: ')', comma: ',', mod: '%', mulFirst: '&#183;'};
		let type = token[0];
		let kind = token[1];
		if (type == 'operator') {
			return `${opReplace[kind]}`;
		} else if (type == 'leftParenthesis' || type == 'rightParenthesis') {
			return `${opReplace[kind]}`;
		} else if (type == 'comma') {
			return `,`;
		} else if (type == 'start') {
			return 'beginning of equation';
		} else if (type == 'end') {
			return 'end of equation';
		} else if (type == 'variable') {
			return `<font style="color: ${variableColor}">${kind}</font>`;
		} else if (type == 'cell') {
			return `<font style="color: ${cellColor}">${kind}</font>`;
		} else if (type == 'cellRange') {
			return `<font style="color: ${cellColor}">${kind}:${token[2]}</font>`;
		} else {
			return `${kind}`;
		}
	}
	
	getParsedEquation() {
		let len = this.tokens.length;
		let equation = '';
		let arrayParenthesis = false;
		for (let i = 1; i < len-1; i++) {
			if (this.tokens[i+1][0] === 'error' && this.tokens[i+1][2] === -1) {
				equation += `<span style="background-color: #FF000088">${this.tokenDetails(i)}</span>`;
			} else if (this.tokens[i][0] === 'error') {
				equation += `<span style="background-color: #FF000088">${this.tokenDetails(i)}</span>`;
			} else if (this.tokens[i-1][0] === 'error' && this.tokens[i+1][2] === 1) {
				equation += `<span style="background-color: #FF000088">${this.tokenDetails(i)}</span>`;
			} else if (this.tokens[i][1] === 'array' && this.tokens[i+1][1] === 'arrayBegin') {
				equation += `[`;
				i++;
			} else if (this.tokens[i][1] === 'arrayEnd') {
				equation += `]`;
			} else {
				equation += this.tokenDetails(i);
			}
		}
		if (equation.length > 0) {
			return `<p>\xa0&#9670; <b>equation:</b><Br>\xa0\xa0\xa0\xa0 ${equation.replace('</span><span style="background-color: #FF000088">', '')}</p>`;
		} else {
			return '';
		}
	}
	
	getDependencyInfo() {
		let len = this.tokens.length;
		let dependencies = '';
		for (let i = 1; i < len-1; i++) {
			if (this.or(this.tokens[i][0], 'variable', 'cell')) {
				dependencies += `<Br>\xa0\xa0\xa0\xa0 &#8226; ${this.tokenDetails(i)} = ${numberToString(this.tokens[i][2])}`;
			} else if (this.tokens[i][0] === 'cellRange') {
				dependencies += `<Br>\xa0\xa0\xa0\xa0 &#8226; ${this.tokenDetails(i)} = ${numberToString(this.tokens[i][3])}`;
			}
		}
		if (dependencies.length > 0) {
			return `<p>\xa0&#9670; <b>dependencies:</b>${dependencies}</p>`;
		} else {
			return '';
		}
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
		this.inputTextOnly = true;
		this.numbersOnly = true;
		let len = this.inputString.length;
		for (let i=0; i<len; i++) {
			// go through the equation character by character
			let type = this.identifyChar(this.inputString.charCodeAt(i));
			let nextType = this.identifyChar(this.inputString.charCodeAt(i+1));
			let addNumber = true;
			if (type === 'number' || type === 'delimiter') {
				this.inputTextOnly = false;
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
						this.tokens.push(['error', '.', 0]);
						this.error = 'misplaced delimiter';
						this.validEquation = false;
						continue;
					}
				}
				while (this.or(nextType, 'number', 'delimiter') && addNumber) {
					// successive number/delimiter characters are treated as a single number
					if (nextType === 'delimiter') {
						// check for multiple delimiters in single number
						if (delimiterFound) {
							this.tokens.push(['number', Number(number)], ['error', '.', 0]);
							this.error = 'misplaced delimiter';
							this.validEquation = false;
							addNumber = false;
							i++;
							break;
						}
						delimiterFound = true;
					}
					number = number + this.inputString[i+1];
					i++;
					nextType = this.identifyChar(this.inputString.charCodeAt(i+1));
				}
				if (addNumber) {
					this.tokens.push(['number', Number(number)]);
				}
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
					this.inputTextOnly = false;
					this.numbersOnly = false;
				} else {
					this.tokens.push(['variable', str, 0]);
					this.numbersOnly = false;
				}
			} else if (type === 'arrayBegin') {
				// arrays are denoted by [1,2,3] which is replaced by the function array(1,2,3)
				this.inputTextOnly = false;
				this.tokens.push(['function', 'array', 1]);
				this.tokens.push(['leftParenthesis', 'arrayBegin']);
			} else if (type === 'arrayEnd') {
				this.inputTextOnly = false;
				this.tokens.push(['rightParenthesis', 'arrayEnd']);
			} else if (this.or(type, 'leftParenthesis', 'rightParenthesis', 'comma')) {
				this.inputTextOnly = false;
				this.tokens.push([type, type]);
			} else if (type === 'space') { // do nothing
			} else if (type === 'unknown') {
				this.error = `unknown character (${this.inputString[i]})`;
				this.validEquation = false;
				this.tokens.push(['error', `${this.inputString[i]}`]);
			} else {
				this.inputTextOnly = false;
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
		//  -> count number of items for every function with parenthesis, e.g. min(1,2,3)
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
			
			if (this.or(current, 'number', 'cell', 'variable')) {
				if (valueNext) {
					// fix: missing multiplication -> '2 sin(2)' or '2(1+1)' or '2 bob' or '2 A2'
					this.tokens.splice(i+1, 0, ['operator', 'mul', 2]);
					len++;
				}
			} else if (current === 'function') {
				if (next !== 'leftParenthesis') {
					// function items need to be in parenthesis
					this.error = `parenthesis expected: ${this.tokens[i][1]}(...)`;
					this.tokens[i] = ['error', `${this.tokens[i][1]}`, 1];
					this.validEquation = false;
				}
			} else if (current === 'operator' && this.tokens[i][1] === 'sub') {
				// check '-' is used as a sign:
				if (!valueNext) {
					// minus operator has to be followed by a value (cell, function, number,...)
					this.error = `"${this.tokenDetails(i)}" operator cannot<Br>be followed by "${this.tokenDetails(i)}"`;
					this.tokens[i] = ['error', '-', 1];
					this.validEquation = false;
				} else if (this.or(previous, 'leftParenthesis', 'comma', 'start') && valueNext) {
					// -1+2 or 2+(-3+5) or -sin(2) array(1,-2,3)
					if (next === 'number') {
						this.tokens[i+1][1] = -this.tokens[i+1][1];
						this.tokens.splice(i, 1);
						len--;
					} else {
						this.tokens.splice(i, 1, ['number', -1], ['operator', 'mulFirst', 2]);
						len++;
					}
				} else if (previous === 'operator' && !this.or(this.tokens[i-1][1], 'pow', 'part')  && valueNext) {
					// 2^-1 or [1,2,3]_-1
					this.tokens.splice(i, 1, ['number', -1], ['operator', 'mulFirst', 2]);
					len++;
				}
			} else if (current === 'operator' && !valueNext && this.tokens[i+1][1] !== 'sub') {
				// operators have to be followed by a value (cell, function, number,...)
				// exception: 2^-3 or 2*-3
				this.error = `"${this.tokenDetails(i)}" operator cannot<Br>be followed by "${this.tokenDetails(i+1)}"`;
				this.tokens[i] = ['error', `${this.tokenDetails(i)}`];
				this.validEquation = false;
			} else if (current === 'operator' && this.tokens[i][1] === 'colon') {
				if (previous !== 'cell') {
					// a colon can only be used for cell ranges: A1:B3 -> cells A1 to B3
					this.error = `colon cannot be<Br>preceded by "${this.tokenDetails(i-1)}"`;
					this.tokens[i] = ['error', ':', -1];
					this.validEquation = false;
				} else if (next !== 'cell') {
					// a colon can only be used for cell ranges: A1:B3 -> cells A1 to B3
					this.error = `colon cannot be<Br>followed by ${this.tokenDetails(i+1)}"`;
					this.tokens[i] = ['error', ':', 1];
					this.validEquation = false;
				} else {
					// combine cell range into a single token
					this.tokens.splice(i-1, 3, ['cellRange', this.tokens[i-1][1], this.tokens[i+1][1]]);
					i--;
					len = len - 2;
				}
			} else if (current === 'comma') {
				// commas are used to seperate the items of a function
				if (!valueNext && this.tokens[i+1][1] !== 'sub') {
					// comma needs to be followed by a value (or minus as in array(1,-2))
					this.error = `comma cannot<Br>be followed by "${this.tokenDetails(i+1)}"`;
					this.tokens[i] = ['error', `,`, 1];
					this.validEquation = false;
				} else if (parenthesisLevel === 0) {
					// commas outside of parenthesis are treated as array declarations
					groundLevelCommas++;
				} else if (parenthesisHierarchy[parenthesisLevel - 1] === 0) {
					// comma in parenthesis which is not part of a function call
					this.error = 'commas can only<Br>be used for<Br>array/vector declarations<Br>or function calls';
					this.tokens[i] = ['error', `,`, 0];
					this.validEquation = false;
				} else {
					// comma in a function call -> increase number of items by 1
					parenthesisHierarchy[parenthesisLevel - 1][2]++;
				}
			} else if (current === 'leftParenthesis') {
				if (this.or(next, 'operator', 'comma', 'end') && this.tokens[i+1][1] !== 'sub') {
					// invalid: (*2,2 or (,2 or ( at the end
					this.error = `"(" cannot be<Br>followed by "${this.tokenDetails(i+1)}"`;
					this.tokens[i] = ['error', `(`, 0];
					this.validEquation = false;
					return -1;
				} else if (previous === 'function') {
					// parenthesis contains the items of a function
					parenthesisHierarchy.push(this.tokens[i-1]);
					parenthesisLevel++;
				} else {
					// parenthesis used for evaluation order
					parenthesisHierarchy.push(0)
					parenthesisLevel++;
				}
			} else if (current == 'rightParenthesis') {
				console.log(parenthesisLevel)
				if (parenthesisLevel === 0) {
					this.error = `opening parenthesis missing`;
					this.tokens[i] = ['error', `)`, 0];
					this.validEquation = false;
				} else if (valueNext) {
					// fix: missing multiplication -> '(1+1)(2+2) or (1+1)x'
					this.tokens.splice(i+1, 0, ['operator', 'mul', 2]);
					len++;
				}
				parenthesisLevel--;
				parenthesisHierarchy.pop();
			}
		}
		
		if (parenthesisLevel < 0) {
			this.error = `opening parenthesis missing`;
			this.validEquation = false;
		} else if (parenthesisLevel > 0) {
			this.error = `closing parenthesis missing`;
			this.validEquation = false;
		}
		
		// check if there is an implicit array definition e.g. 1,2,3 -> array(1,2,3)
		if (groundLevelCommas > 0) {
			this.tokens.shift();
			this.tokens.unshift(['start', 'start'], ['function', 'array', groundLevelCommas + 1], ['leftParenthesis', 'arrayBegin']);
			this.tokens.pop();
			this.tokens.push(['rightParenthesis', 'arrayEnd'], ['end', 'end']);
		}
		
		// submit new token list to dictionary
		// this method will check all dependencies (children and parents)
		this.dictionary.updateParents(this);
		
		// continue by calculating the reversed polish notation
		if (this.validEquation) {
			this.getRPN();
		} else {
			this.value = NaN;
		}
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
		for (let i=1; i<len-1; i++) {
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
		this.functionInfo = '';
		while (RPN.length > 0) {
			let element = RPN.pop();
			if (element[0] == 'number') {
				stack.push(element[1]);
			} else if (element[0] == 'variable') {
				// check if variable exists
				let value = element[2];
				stack.push(value);
			} else if (element[0] == 'cell') {
				// check if cell is defined
				let value = element[2];
				stack.push(value);
			} else if (element[0] == 'cellRange') {
				// check if cell is defined
				let value = element[3];
				stack.push(value);
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
					result = NaN;
				}
				stack.push(result);
				if (element[0] === 'function' && !this.or(element[1], 'array', 'range')) {
					this.functionInfo += `<Br>\xa0\xa0\xa0\xa0 &#8226; ${element[1]}(${argString}) = ${numberToString(result)}`;
				}
			}
		}
		if (stack.length == 1) {
			this.value = stack[0];
		} else {
			this.validEquation = false;
			this.value = NaN;
			this.error = 'unknown error in evaluation';
			return -1;
		}
		if (this.functionInfo.length > 0) {
			this.functionInfo = `<p>\xa0&#9670; <b>functions:</b>${this.functionInfo}</p>`;
		}
	}
}

class nameHandler {
	constructor(input, inputNumber, dictionary) {
		this.id = input.id;
		this.dictionary = dictionary;
		this.DOMinput = input;
		this.DOMresult = document.getElementById(`result_${this.id}`);
		
		let valueID = `VALUE_${inputNumber}`;
		this.correspondingEquation = this.dictionary.getEquationHandler(valueID);
		
		this.validName = false;
		this.update();
	}
	
	update() {
		this.name = this.DOMinput.value;
	}
	
	set name(str) {
		// remove old entry from dictionary;
		if (this.validName) {
			this.dictionary.deleteEntry(this.name);
		}
		this._name = str;
		let entry = this.dictionary.dictionary[str];
		if (str === '') {
			this.DOMresult.innerHTML = '';
			this.validName = false;
		} else if (entry === undefined) {
			this.dictionary.dictionary[str] = this.correspondingEquation;
			this.correspondingEquation.children = [];
			this.DOMresult.innerHTML = str;
			this.validName = true;
		} else if (Array.isArray(entry)) {
			this.dictionary.dictionary[str] = this.correspondingEquation;
			this.correspondingEquation.children = entry;
			this.DOMresult.innerHTML = str;
			this.dictionary.updateChildren(str);
			this.validName = true;
		} else {
			this.DOMresult.innerHTML = 'ALREADY EXISTS';
			this.validName = false;
		}
	}
	
	get name() {
		return this._name;
	}
}

/************ SVG PATH ***********************/

let SVGpathCounter = 0
let circleRadius = 0.75;

class SVGcanvas {
	constructor(parentNode, dictionary) {
		this.parentNode = parentNode;
		this.dictionary = dictionary;
		
		// create the svg canvas element
		this.node = document.createElementNS(svgNamespace, 'svg');
		this.node.setAttributeNS(null, 'class', 'SVGcanvas');
		this.node.setAttribute('data-type', `canvas`);
		this.viewBox = [0,0,100,100];
		parentNode.append(this.node);
		
		// create a group which will contain all graphics elements
		this.graphics = document.createElementNS(svgNamespace, 'g');
		this.graphics.setAttributeNS(null, 'class', 'graphics');
		this.node.append(this.graphics);
		
		// create a group which will be used to display additional information
		this.details = document.createElementNS(svgNamespace, 'g');
		this.details.setAttributeNS(null, 'class', 'details');
		this.node.append(this.details);
		
		this.elements = [];
		this.inFocus = -1;
		this.createStyleMenu();
		this.mousePosition = this.node.createSVGPoint();
		this.setEvents();
	}
	
	getMousePosition(event) {
		this.mousePosition.x = event.clientX;
		this.mousePosition.y = event.clientY;
		this.mousePosition = this.mousePosition.matrixTransform(this.node.getScreenCTM().inverse());
		return this.mousePosition;
	}
	
	set viewBox(list) {
		this.node.setAttributeNS(null, 'viewBox', `${list[0]} ${list[1]} ${list[2]} ${list[3]}`);
		this._viewBox = list;
	}
	
	get viewBox() {
		return this._viewBox;
	}
	
	get length() {
		return this.elements.length;
	}
	
	setEvents() {
		this.currentHover = 'none';
		this.currentFocus = 'none';
		this.node.addEventListener('mousedown', this.click.bind(this));
	}
	
	click(event) {
		const type = event.target.getAttribute('data-type');
		console.log(type);
		if (type === 'element') {
			const index = event.target.getAttribute('data-index');
			this.elements[index].showDetails();
			this.inFocus = index;
		} else if (this.inFocus > -1) {
			this.elements[this.inFocus].hideDetails();
			this.inFocus = -1;
		}
	}
	
	createStyleMenu() {
		
	}
	
	addNewPath(pathString) {
		const path = new SVGpath(this, this.dictionary, pathString, this.length);
		this.elements.push(path);
	}
}

class FIELDequationHandler extends equationHandler {
	constructor(input, dictionary, ghostbusters, elementRef) {
		super(input, dictionary);
		this.whoYaGonnaCall = ghostbusters;
		this.elementRef = elementRef;
	}
	
	update() {
		this.inputString = this.DOMinput.value;
		this.callTheGhostbusters();
	}
	
	silentUpdate() {
		this.inputString = this.DOMinput.value;
	}
	
	recalculate() {
		if (this.validEquation) {
			this.error = 'none';
			this.calculateValue();
			this.updateDOM();
			this.callTheGhostbusters()
		}
	}
	
	callTheGhostbusters() {
		if (this.whoYaGonnaCall !== undefined) {
			this.whoYaGonnaCall(this.elementRef, this.value);
		}
	}
}

class pathPoint {
	constructor(path, index, x, y, scaling) {
		this.index = index;
		this.scale = scaling;
		this.path = path;
		if (scaling === 'absolute') {
			this.x = x;
			this.y = y;
		} else if (scaling === 'relative') {
			this.xRel = x;
			this.yRel = y;
		}
	}
	
	set xRel(value) {
		if (this.index === 0) {
			this.x = value;
		} else {
			this.x = value + this.path.nodes[this.index-1].x;
		}
	}
	
	set yRel(value) {
		if (this.index === 0) {
			this.y = value;
		} else {
			this.y = value + this.path.nodes[this.index-1].y;
		}
	}
	
	get xRel() {
		if (this.index === 0) {
			return this.x;
		} else {
			return this.x - this.path.nodes[this.index-1].x;
		}
	}
	
	get yRel() {
		if (this.index === 0) {
			return this.y;
		} else {
			return this.y - this.path.nodes[this.index-1].y;
		}
	}
}

class pathNode extends pathPoint {
	constructor(path, index, x = 0, y = 0, scaling = 'absolute') {
		super(path, index, x, y, scaling);
		// initialize the line menu
		this.menu = document.createElement('div');
		this.menu.className = 'node';
		this.menu.innerHTML = `node ${this.index}`;
		
		// create the svg representation
		this.details = document.createElementNS(svgNamespace, 'g');
		this.svg = document.createElementNS(svgNamespace, 'path');
		this.svg.setAttributeNS(null, 'class', 'pathPoint');
		this.svg.setAttribute('data-type', `node`);
		this.svg.setAttribute('data-index', `${this.index}`);
		this.details.append(this.svg);
		this.addSelector();
	}
	
	update() {
		const size = 0.65;
		const path = `M${this.x-size} ${this.y+size}L${this.x-size} ${this.y-size}L${this.x+size} ${this.y-size}L${this.x+size} ${this.y+size}Z`;
		this.svg.setAttributeNS(null, 'd', path);
	}
	
	get cpBelow() {
		if (this.path.lines[this.index].type === 'C') {
			return this.path.lines[this.index].cp2;
		} else if (this.path.lines[this.index].type === 'Q') {
			return this.path.lines[this.index].cp;
		} else {
			return 'none';
		}
	}
	
	get lineTypeBelow() {
		return this.path.lines[this.index].type;
	}
	
	get cpAbove() {
		if (this.index === this.path.lines.length - 1) {
			// this is the very last node
			return 'none';
		} else if (this.path.lines[this.index + 1].type === 'C') {
			return this.path.lines[this.index + 1].cp1;
		} else if (this.path.lines[this.index].type === 'Q') {
			return this.path.lines[this.index + 1].cp;
		} else {
			return 'none';
		}
	}
	
	get lineTypeAbove() {
		if (this.index === this.path.lines.length - 1) {
			return 'end';
		} else {
			return this.path.lines[this.index + 1].type;
		}
	}
	
	addSelector() {
		function getChoice(id, index) {
			const choice = document.createElementNS(svgNamespace, 'use');
			choice.setAttributeNS(xlinkNamespace, 'href', id);
			choice.setAttributeNS(null, 'class', 'transitionSVG');
			choice.setAttribute('data-type', `selector`);
			choice.setAttribute('data-index', `${index}`);
			return choice;
		}
		
		const nodeSelect = document.createElementNS(svgNamespace, 'g');
		const choice1 = getChoice('#cpSelect1', 1);
		nodeSelect.append(choice1);
		const choice2 = getChoice('#cpSelect2', 2);
		nodeSelect.append(choice2);
		const choice3 = getChoice('#cpSelect3', 3);
		nodeSelect.append(choice3);
		
		this.selector = {wrapper: nodeSelect, choice1: choice1, choice2: choice2, choice3: choice3};
		this.hideSelector();
	}
	
	hideSelector() {
		for (let key in this.selector) {
			if (key !== 'wrapper') {
				this.selector[key].setAttributeNS(null, 'transform', `translate(0,0)scale(0,0)`);
				this.selector[key].setAttributeNS(null, 'opacity', `0`);
			}
		}
	}
	
	showSelector() {
		this.selector.wrapper.setAttributeNS(null, 'transform', `translate(${this.x}, ${this.y})`);
		this.selector.choice1.setAttributeNS(null, 'transform', `translate(-5.5, -2)scale(0.04,0.04)`);
		this.selector.choice1.setAttributeNS(null, 'opacity', `1`);
		this.selector.choice2.setAttributeNS(null, 'transform', `translate(-0.25, 1)scale(0.04,0.04)`);
		this.selector.choice2.setAttributeNS(null, 'opacity', `1`);
		this.selector.choice3.setAttributeNS(null, 'transform', `translate(-0.25, -5)scale(0.04,0.04)`);
		this.selector.choice3.setAttributeNS(null, 'opacity', `1`);
	}
	
	startMouseDrag(mouseDownPos) {
	   window.addEventListener('mousemove', mousemove);
	   window.addEventListener('mouseup', mouseup);
		
		const root = this;
		const initialX = this.x;
		const initialY = this.y;
		const mouseDownX = mouseDownPos.x;
		const mouseDownY = mouseDownPos.y;
		function mousemove(event) {
			const mousePos = root.path.canvas.getMousePosition(event);
			let newX = initialX + mousePos.x - mouseDownX;
			let newY = initialY + mousePos.y - mouseDownY;
			root.moveNode(newX, newY);
		}
		
		function mouseup() {
			window.removeEventListener('mousemove', mousemove);
			window.removeEventListener('mouseup', mouseup);
		}
	}
	
	moveNode(x,y) {
		const dx = x - this.x;
		const dy = y - this.y;
		this.x = x;
		this.y = y;
		this.update();
		
		// check if control below has to be modified
		if (this.cpBelow !== 'none') {
			this.cpBelow.nodeMovedBy(dx, dy);
		}
		// check if control above has to be modified
		if (this.cpAbove !== 'none') {
			this.cpAbove.nodeMovedBy(dx, dy);
		}
		
		// update line segments
		this.path.lines[this.index].update();
		if (this.index !== this.path.lines.length - 1) {
			this.path.lines[this.index + 1].update();
		}
	}
}

class pathContolPoint extends pathPoint {
	constructor(path, index, x = 0, y = 0, scaling = 'absolute') {
		super(path, index, x, y, scaling);
		
		// create the svg representation
		const radius = 0.65;
		this.details = document.createElementNS(svgNamespace, 'g');
		this.svg = document.createElementNS(svgNamespace, 'circle');
		this.svg.setAttributeNS(null, 'class', 'controlPoint');
		this.svg.setAttributeNS(null, 'r', radius);
		this.svgLine = document.createElementNS(svgNamespace, 'path');
		this.svgLine.setAttributeNS(null, 'class', 'controlLine');
		this.details.append(this.svgLine);
		this.details.append(this.svg);
		
		this.svgLine.setAttribute('data-type', `contolLine`);
		this.svgLine.setAttribute('data-index', `${this.index}`);
		this.svg.setAttribute('data-index', `${this.index}`);
	}
	
	startMouseDrag(mouseDownPos) {
	   window.addEventListener('mousemove', mousemove);
	   window.addEventListener('mouseup', mouseup);
		
		const root = this;
		const initialX = this.x;
		const initialY = this.y;
		const mouseDownX = mouseDownPos.x;
		const mouseDownY = mouseDownPos.y;
		function mousemove(event) {
			const mousePos = root.path.canvas.getMousePosition(event);
			let newX = initialX + mousePos.x - mouseDownX;
			let newY = initialY + mousePos.y - mouseDownY;
			root.moveCP(newX, newY);
		}
		
		function mouseup() {
			window.removeEventListener('mousemove', mousemove);
			window.removeEventListener('mouseup', mouseup);
		}
	}
	
	hideSelector() {}
	
	showSelector() {}
	
	moveCP(newX, newY) {}
}

class pathCP1 extends pathContolPoint {
	constructor(path, index, x = 0, y = 0, scaling = 'absolute', restriction = 'free') {
		super(path, index, x, y, scaling);
		this.svg.setAttribute('data-type', `cp1`);
		this.restriction = restriction;
	}
	
	set x(value) {
		this._x = value;
	}
	
	set y(value) {
		this._y = value;
	}
	
	get sister() {
		return this.path.lines[this.index - 1].cp2;
	}
	
	get node() {
		return this.path.nodes[this.index - 1];
	}
	
	get x() {
		if (this.restriction === 'free') {
			return this._x;
		} else if (this.restriction === 'symmetric') {
			return 2 * this.node.x - this.sister.x;
		} else if (this.restriction === 'smooth') {
			return this.node.x + this.length / this.sister.length * (this.node.x - this.sister.x);
		}
	}
	
	get y() {
		if (this.restriction === 'free') {
			return this._y;
		} else if (this.restriction === 'symmetric') {
			return 2 * this.node.y - this.sister.y;
		} else if (this.restriction === 'smooth') {
			return this.node.y + this.length / this.sister.length * (this.node.y - this.sister.y);
		}
	}
	
	get length() {
		const x = this._x - this.node.x;
		const y = this._y - this.node.y;
		return Math.sqrt(x*x + y*y);
	}
	
	moveCP(newX, newY) {
		if (this.restriction === 'free') {
			this.x = newX;
			this.y = newY;
			this.path.lines[this.index].update();
		} else if (this.restriction === 'symmetric') {
			// symmetric cp1's are controlled by there sister
			//   -> sister.update() will automatically update this cp
			this.sister.moveCP(2*this.node.x-newX, 2*this.node.y-newY);
		} else if (this.restriction === 'smooth') {
			this._x = newX;
			this._y = newY;
			const len = this.length;
			const lenSis = this.sister.length;
			//console.log(len, lenSis);
			const sisterX = this.node.x + lenSis / len * (this.node.x - newX);
			const sisterY = this.node.y + lenSis / len * (this.node.y - newY);
			this.sister.moveCP(sisterX, sisterY);
		}
	}
	
	nodeMovedBy(dx, dy) {
		this._x += dx;
		this._y += dy;
		this.update();
	}
	
	update() {
		this.svgLine.setAttributeNS(null, 'd', `M${this.node.x} ${this.node.y}L${this.x} ${this.y}`);
		this.svg.setAttributeNS(null, 'cx', this.x);
		this.svg.setAttributeNS(null, 'cy', this.y);
	}
}

class pathCP2 extends pathContolPoint {
	constructor(path, index, x = 0, y = 0, scaling = 'absolute') {
		super(path, index, x, y, scaling);
		this.svg.setAttribute('data-type', `cp2`);
	}
	
	get sister() {
		return this.path.lines[this.index + 1].cp1;
	}
	
	get node() {
		return this.path.nodes[this.index];
	}
	
	get length() {
		const x = this.x - this.node.x;
		const y = this.y - this.node.y;
		return Math.sqrt(x*x + y*y);
	}
	
	moveCP(newX, newY) {
		this.x = newX;
		this.y = newY;
		this.path.lines[this.index].update();
		
		if (this.sister) {
			this.path.lines[this.index + 1].update();
		}
	}
	
	nodeMovedBy(dx, dy) {
		this.x += dx;
		this.y += dy;
		this.update();
	}
	
	update() {
		this.svgLine.setAttributeNS(null, 'd', `M${this.node.x} ${this.node.y}L${this.x} ${this.y}`);
		this.svg.setAttributeNS(null, 'cx', this.x);
		this.svg.setAttributeNS(null, 'cy', this.y);
	}
}

class pathCP extends pathContolPoint {
	constructor(path, index, x = 0, y = 0, scaling = 'absolute') {
		super(path, index, x, y, scaling);
		this.svg.setAttribute('data-type', `cp`);
	}
	
	get nodeBefore() {
		return this.path.nodes[this.index - 1];
	}
	
	get nodeAfter() {
		return this.path.nodes[this.index];
	}
	
	update() {
		this.svgLine.setAttributeNS(null, 'd', `M${this.nodeBefore.x} ${this.nodeBefore.y}L${this.x} ${this.y}L${this.nodeAfter.x} ${this.nodeAfter.y}`);
		this.svg.setAttributeNS(null, 'cx', this.x);
		this.svg.setAttributeNS(null, 'cy', this.y);
	}
}

class pathLine {
	constructor(path, index, type, ...args) {
		this.path = path;
		this.index = index;
		this.type = type;
		
		this.setArguments(args);
		
		// initialize the line menu
		this.menu = document.createElement('div');
		this.menu.className = 'segment';
		this.menu.innerHTML = `segment ${this.index}`;
		
		// create the svg representation
		this.details = document.createElementNS(svgNamespace, 'g');
		this.svg = document.createElementNS(svgNamespace, 'path');
		this.svg.setAttributeNS(null, 'class', 'pathLine');
		this.svg.setAttribute('data-type', `line`);
		if (this.type === 'M') {
			this.svg.classList.add('moveTo');
		}
		this.svg.setAttribute('data-index', `${this.index}`);
		this.details.append(this.svg);
		if (this.type === 'Q') {
			this.details.append(this.cp.details);
		} else if (this.type === 'C') {
			this.details.append(this.cp1.details);
			this.details.append(this.cp2.details);
		}
		this.addSelector();
	}
	
	get pathString() {
		if (this.type === 'L' || this.type === 'M') {
			return `${this.type}${this.end.x} ${this.end.y}`;
		} else if (this.type === 'Q') {
			return `Q${this.cp.x} ${this.cp.y} ${this.end.x} ${this.end.y}`;
		} else if (this.type === 'C') {
			return `C${this.cp1.x} ${this.cp1.y} ${this.cp2.x} ${this.cp2.y} ${this.end.x} ${this.end.y}`;
		}  else if (this.type === 'A') {
			return `A${this.rX} ${this.rY} ${this.rot} ${this.f1} ${this.f2} ${this.end.x} ${this.end.y}`;
		}  else if (this.type === 'Z') {
			return `Z`;
		}
	}
	
	setArguments(args) {
		if (this.type === 'Q') {
			// Q -> quadratic Bezier curve (defined via single control points)
			this.cp = args[0];
		} else if (this.type === 'T') {
			// T -> quadratic Bezier curve (control point mirrored from last segment)
			this.cp = new pathCP(this.path, this.index, 5, 0, 'relative', 'smooth');
			this.type = 'Q';
		} else if (this.type === 'C') {
			// C -> cubic Bezier curve (defined via two control points)
			this.cp1 = args[0];
			this.cp2 = args[1];
		} else if (this.type === 'S') {
			// S -> cubic Bezier curve (first control point mirrored from last segment)
			this.cp1 = new pathCP1(this.path, this.index, 5, 0, 'relative', 'smooth');
			this.cp2 = args[0];
			this.type = 'C';
		} else if (this.type === 'A') {
			// A -> arc with items: rx, ry, rot, f1, f2, endX, endY
			this.rX = args[0];
			this.rY = args[1];
			this.rot = args[2];
			this.f1 = args[3];
			this.f2 = args[4];
		}
	}
	
	get start() {
		return this.path.nodes[this.index - 1];
	}
	
	get end() {
		return this.path.nodes[this.index];
	}
	
	getLinePosition(t) {
		let len = this.svg.getTotalLength();
		let point = this.svg.getPointAtLength(t*len);
		return point;
	}
	
	getClosestPoint(x,y) {
		let root = this;
		function len2(t) {
			const p = root.getLinePosition(t);
			const dx = p.x - x;
			const dy = p.y - y;
			return dx*dx+dy*dy;
		}
		
		let t = [0, 0.25, 0.5, 0.75, 1];
		let step = 0.25;
		let distances, indexMin;
		while (step > 0.01) {
			step = step/2;
			distances = t.map(item => len2(item));
			indexMin = mathFunctions.indexOfMin(distances);
			if (indexMin < 2) {
				t = [t[0], t[0]+step, t[1], t[1]+step, t[2]];
			} else if (indexMin === 2) {
				t = [t[1], t[1]+step, t[2], t[2]+step, t[3]];
			} else {
				t = [t[2], t[2]+step, t[3], t[3]+step, t[4]];
			}
		}
		return this.getLinePosition(t[2]);
	}
	
	update() {
		// update svg path
		if (this.type === 'Z') {
			this.svg.setAttributeNS(null, 'd', `M${this.start.x} ${this.start.y}L${this.end.x} ${this.end.y}`);
		} else if (this.index > 0) {
			if (this.type === 'M') {
				this.svg.setAttributeNS(null, 'd', `M${this.start.x} ${this.start.y}L${this.end.x} ${this.end.y}`);
			} else {
				this.svg.setAttributeNS(null, 'd', `M${this.start.x} ${this.start.y}${this.pathString}`);
			}
		}
		
		// update control points
		if (this.type === 'Q') {
			this.cp.update();
		} else if (this.type === 'C') {
			this.cp1.update();
			this.cp2.update();
		}
		
		// move to commands might have connected close path commands that need updating
		if (this.connectedZ) {
			this.path.lines[this.connectedZ].update();
		}
	}
	
	addSelector() {
		function getChoice(id) {
			const choice = document.createElementNS(svgNamespace, 'use');
			choice.setAttributeNS(xlinkNamespace, 'href', id);
			choice.setAttributeNS(null, 'class', 'transitionSVG');
			return choice;
		}
		
		const lineSelect = document.createElementNS(svgNamespace, 'g');
		const choice4 = getChoice('#pathSelect1');
		lineSelect.append(choice4);
		const choice5 = getChoice('#pathSelect2');
		lineSelect.append(choice5);
		const choice6 = getChoice('#pathSelect3');
		lineSelect.append(choice6);
		const choice7 = getChoice('#pathSelect4');
		lineSelect.append(choice7);
		
		this.selector = {wrapper: lineSelect, choice1: choice4, choice2: choice5, choice3: choice6, choice4: choice7};
		this.hideSelector();
	}
	
	hideSelector() {
		for (let key in this.selector) {
			if (key !== 'wrapper') {
				this.selector[key].setAttributeNS(null, 'transform', `translate(0,0)scale(0,0)`);
				this.selector[key].setAttributeNS(null, 'opacity', `0`);
			}
		}
	}
	
	showSelector(mousePos) {
		const center = this.getClosestPoint(mousePos.x, mousePos.y);
		this.selector.wrapper.setAttributeNS(null, 'transform', `translate(${center.x}, ${center.y})`);
		this.selector.choice1.setAttributeNS(null, 'transform', `translate(-5, -4)scale(0.04,0.04)`);
		this.selector.choice1.setAttributeNS(null, 'opacity', `1`);
		this.selector.choice2.setAttributeNS(null, 'transform', `translate(0, -5)scale(0.04,0.04)`);
		this.selector.choice2.setAttributeNS(null, 'opacity', `1`);
		this.selector.choice3.setAttributeNS(null, 'transform', `translate(-4, 1)scale(0.04,0.04)`);
		this.selector.choice3.setAttributeNS(null, 'opacity', `1`);
		this.selector.choice4.setAttributeNS(null, 'transform', `translate(1, 0)scale(0.04,0.04)`);
		this.selector.choice4.setAttributeNS(null, 'opacity', `1`);
	}
	
	startMouseDrag(mouseDownPos) {
		console.log('drag line');
	}
}

class SVGpath {
	constructor(SVGcanvas, dictionary, pathString, index) {
		this.index = index;
		this.dictionary = dictionary;
		this.canvas = SVGcanvas;
		
		// add path element to canvas -> to display the actual path
		this.graphics = document.createElementNS(svgNamespace, 'path');
		this.graphics.setAttribute('data-index', `${this.index}`);
		this.graphics.setAttribute('data-type', `element`);
		this.graphics.setAttributeNS(null, 'd', pathString);
		this.canvas.graphics.append(this.graphics);
		
		// add group to nodeTop -> used to display path details
		this.details = document.createElementNS(svgNamespace, 'g');
		this.details.setAttribute('visibility', 'hidden');
		this.canvas.details.append(this.details);
		
		// create path menu -> displays details about the path
		this.menu = document.createElement('div');
		this.menu.className = 'pathMenu';
		
		this.parsePathString(pathString);
		const len = this.lines.length;
		for (let i=0; i<len; i++) {
			this.lines[i].update();
			this.nodes[i].update();
		}
		this.setEvents();
	}
	
	identifyChar(charCode) {
		if (48 <= charCode && charCode <= 57) {
			return 'number';
		} else if (charCode === 32 || charCode === 44) {
			return 'seperator';
		} else if (charCode === 46) {
			return 'delimiter';
		} else if (charCode === 45) {
			return 'minus';
		} else if (65 <= charCode && charCode <= 90) {
			// character is upper case letter
			// known letters are: A,C,H,L,M,Q,S,T,V,Z
			const knownLetterChars = [65, 67, 72, 76, 77, 81, 83, 84, 86, 90];
			if (knownLetterChars.indexOf(charCode) > -1) {
				return String.fromCharCode(charCode);
			}
		} else if (97 <= charCode && charCode <= 122) {
			// character is lower case letter
			// known letters are: a,c,h,l,m,q,s,t,v,z
			const knownLetterChars = [97, 99, 104, 108, 109, 113, 115, 116, 118, 122];
			if (knownLetterChars.indexOf(charCode) > -1) {
				return String.fromCharCode(charCode);
			}
		} else {
			return 'unknown';
		}
	}
	
	parsePathString(str) {
		this.valid = true;
		this.nodes = [];
		this.lines = [];
		// the path has to start with a move command ('M' or 'm')
		let len = str.length;
		let istart = 0;
		let items = ['M'];
		while (istart < len) {
			const type = this.identifyChar(str.charCodeAt(istart));
			if (['M','m'].indexOf(type) > -1) {
				istart++;
				break;
			} else if (type === 'seperator') {
				// ignore leading seperators
				istart++;
			} else {
				// invalid start of path string!
				console.log(`ERROR-PATH01 (invalid path string)`);
				this.valid = false;
				return -1;
			}
		}
		
		// once a correct start is identified, parse the rest of the string
		for (let i=istart; i<len; i++) {
			// go through the path character by character
			let type = this.identifyChar(str.charCodeAt(i));
			if (type === 'number' || type === 'minus') {
				let number = str[i];
				let nextType = this.identifyChar(str.charCodeAt(i+1));
				while (nextType === 'number' || nextType === 'delimiter') {
					number = number + str[i+1];
					i++;
					nextType = this.identifyChar(str.charCodeAt(i+1));
				}
				items.push(Number(number));
			} else if (type === 'unknown') {
				console.log(`ERROR-PATH02 (invalid character "${str[i]}" in path string)`);
			} else if (type === 'seperator') {
				// ignore
			} else {
				// char must be a segment indicator ('M','L',...)
				this.addSegment(items);
				items = [type];
			}
		}
		this.addSegment(items);
	}
	
	addSegment(items, index = -1) {
		// check if the token has the correct number of items
		// e.g. a line needs two additional items whereas
		// a cubic Bezier curve requires 6 items:
		let type = items[0];
		let valid = true;
		if (['Z','z'].indexOf(type) > -1 && items.length !== 1) {
			valid = false;
		} else if (['H','h','V','v'].indexOf(type) > -1 && items.length !== 2) {
			valid = false;
		} else if (['L','l','T','t','M','m'].indexOf(type) > -1 && items.length !== 3) {
			valid = false;
		} else if (['Q','q','S','s'].indexOf(type) > -1 && items.length !== 5) {
			valid = false;
		} else if (['C','c'].indexOf(type) > -1 && items.length !== 7) {
			valid = false;
		} else if (['A','a'].indexOf(type) > -1 && items.length !== 8) {
			valid = false;
		}
		if (!valid) {
			console.log(`ERROR-PATH03 (${this.type} of length ${this.token.length})`);
			return -1;
		}
		
		// check which scaling the token uses (upper case letter -> absolute, lower case -> relative)
		let scaling = 'absolute';
		if (type.charCodeAt(0) > 90) {
			scaling = 'relative';
			type = type.toUpperCase();
		}
		
		// set index to be in range (index = -1 is used to append at the end)
		if (index < 0 || index > this.nodes.length) {
			index = this.nodes.length;
		}
		
		let node, line;
		if (type === 'L' || type === 'M') {
			// L -> line, M -> move to
			node = new pathNode(this, index, items[1], items[2], scaling);
			line = new pathLine(this, index, type);
		} else if (type === 'H') {
			// H -> horizontal line
			if (scaling === 'relative') {
				node = new pathNode(this, index, items[1], this.nodes[index-1].yRel, scaling);
			} else {
				node = new pathNode(this, index, items[1], this.nodes[index-1].y, scaling);
			}
			line = new pathLine(this, index, 'L');
		} else if (type === 'V') {
			// H -> vertical line
			if (scaling === 'relative') {
				node = new pathNode(this, index, this.nodes[index-1].xRel, items[1], scaling);
			} else {
				node = new pathNode(this, index, this.nodes[index-1].x, items[1], scaling);
			}
			line = new pathLine(this, index, 'L');
		} else if (type === 'Q') {
			// Q -> quadratic Bezier curve (defined via single control points)
			node = new pathNode(this, index, items[3], items[4], scaling);
			const cp = new pathCP(this, index, items[1], items[2], scaling);
			line = new pathLine(this, index, 'Q', cp);
		} else if (type === 'C') {
			// C -> cubic Bezier curve (defined via two control points)
			node = new pathNode(this, index, items[5], items[6], scaling);
			const cp1 = new pathCP1(this, index, items[1], items[2], scaling);
			const cp2 = new pathCP2(this, index, items[3], items[4], scaling);
			line = new pathLine(this, index, 'C', cp1, cp2);
		} else if (type === 'T') {
			// T -> quadratic Bezier curve (control point mirrored from last segment)
			node = new pathNode(this, index, items[1], items[2], scaling);
			line = new pathLine(this, index, 'T');
		} else if (type === 'S') {
			// S -> cubic Bezier curve (first control point mirrored from last segment)
			node = new pathNode(this, index, items[3], items[4], scaling);
			const cp2 = new pathCP2(this, index, items[1], items[2], scaling);
			line = new pathLine(this, index, 'S', cp2);
		} else if (type === 'A') {
			// A -> arc with items: rx, ry, rot, f1, f2, endX, endY
			node = new pathNode(this, index, items[6], items[7], scaling);
			line = new pathLine(this, index, 'A', items[1], items[2], items[3], items[4], items[5]);
		} else if (type === 'Z') {
			// Z -> draws a line to the last 'move to' (M)
			for (let i=index-1; i>=0; i--) {
				const t = this.lines[i].type;
				if (t === 'M') {
					node = this.nodes[i];
					this.lines[i].connectedZ = index;
					break;
				}
			}
			line = new pathLine(this, index, 'Z');
		} else {
			console.log(`ERROR-PATH04 (unknown type identifier)`);
		}
		this.nodes.splice(index, 0, node);
		this.lines.splice(index, 0, line);
		
		// add to menu
		if (index === this.nodes.length - 1) {
			this.menu.append(line.menu);
		} else if (index > 0) {
			const sibling = this.menu.children[index-1];
			sibling.after(line.menu);
		} else if (index === 0) {
			this.menu.prepend(line.menu);
		}
		
		// add to details
		this.details.prepend(line.details);
		const beforeNode = this.details.children[index];
		beforeNode.after(node.details);
		this.details.append(line.selector.wrapper);
		this.details.append(node.selector.wrapper);
	}
	
	setEvents() {
		//this.details.addEventListener('click', this.clickDetails.bind(this));
		this.details.addEventListener('mousedown', this.mousedownDetails.bind(this));
		this.details.addEventListener('mouseover', this.mouseoverDetails.bind(this));
		this.details.addEventListener('mouseleave', this.mouseleaveDetails.bind(this));
	}
	
	getEventTarget(event) {
		const targetType = event.target.getAttribute('data-type');
		const targetIndex = event.target.getAttribute('data-index');
		if (targetType === 'node') {
			return this.nodes[targetIndex];
		} else if (targetType === 'line') {
			return this.lines[targetIndex];
		} else if (targetType === 'selector') {
			return 'selector';
		} else if (['cp', 'cp1', 'cp2'].indexOf(targetType) > -1) {
			return this.lines[targetIndex][targetType];
		} else {
			return 0;
		}
	}
	
	mousedownDetails(event) {
		event.stopPropagation();
		
		// remove select status from previous target
		if (this.selectedElement) {
			this.selectedElement.hideSelector();
			this.selectedElement.svg.classList.remove('selected');
		}
		
		// select new target
		//   -> if mouseup happens without any movement, show selector
		//   -> if mouse moves, initialize drag (handled by element)
		const target = this.getEventTarget(event);
		if (target === 'selector') {
			console.log(`selector ${event.target.getAttribute('data-index')} chosen`)
		} else if (target !== 0) {
			const mouseDownPos = this.canvas.getMousePosition(event);
		   window.addEventListener('mousemove', mousemove);
		   window.addEventListener('mouseup', click);
			
			this.selectedElement = target;
			target.svg.classList.add('selected');
			
			function mousemove(event) {
				window.removeEventListener('mousemove', mousemove);
				window.removeEventListener('mouseup', click);
				target.startMouseDrag(mouseDownPos);
			}
	
			function click(event) {
				window.removeEventListener('mousemove', mousemove);
				window.removeEventListener('mouseup', click);
				target.showSelector(mouseDownPos);
			}
		}
	}
	
	mouseoverDetails(event) {
		event.stopPropagation();
		const target = this.getEventTarget(event);
		// remove hover status from previous target
		if (this.hoverElement) {
			this.hoverElement.svg.classList.remove('hover');
		}
		
		// add hover status from new target
		if (target === 'selector') {
			console.log(`selector ${event.target.getAttribute('data-index')} hover`)
		} else if (target !== 0) {
			this.hoverElement = target;
			target.svg.classList.add('hover');
		}
	}
	
	mouseleaveDetails() {
		if (this.hoverElement) {
			this.hoverElement.svg.classList.remove('hover');
		}
	}
	
	showDetails() {
		this.details.setAttribute('visibility', 'visible');
	}
	
	hideDetails() {
		this.details.setAttribute('visibility', 'hidden');
		if (this.selectedElement) {
			this.selectedElement.hideSelector();
			this.selectedElement.svg.classList.remove('selected');
		}
		if (this.hoverElement) {
			this.hoverElement.svg.classList.remove('hover');
		}
	}
}

/************ MOUSE INTERACTION **************/

function enableMouseInteraction() {
	
	let infoStatus = 'basic';
	
	document.addEventListener('input', inputChange);
	document.addEventListener('mousedown', mouseDown);
	
	function mouseDown(event) {
		//console.log(`input change in ${event.target.id}`);
		let id = event.target.id;
		let idParts = id.split('_');
	
		// check for extendInfoButton
		if (idParts[0] === 'extendInfoButton') {
			changeInfoStyle();
			event.preventDefault();
		}
	}
	
	function inputChange(event) {
		inputDictionary.inputChange(event.target);
	}
	
	function changeInfoStyle() {
		let allExtendedInfoElements = document.getElementsByClassName('extendedInfo');
		let allExtendedInfoButtonElements = document.getElementsByClassName('extendInfoButton');
	
		let newDisplay, newButtonText;
		if (infoStatus === 'extended') {
			newDisplay = 'none';
			newButtonText = '<< show details >>';
			infoStatus = 'basic';
		} else {
			newDisplay = 'inherit';
			newButtonText = '>> hide details <<';
			infoStatus = 'extended';
		}
	
		let len = allExtendedInfoElements.length;
		for (let i=0; i<len; i++) {
			allExtendedInfoElements[i].style.display = newDisplay;
		}
		len = allExtendedInfoButtonElements.length;
		for (let i=0; i<len; i++) {
			allExtendedInfoButtonElements[i].innerHTML = newButtonText;
		}
	}
}

const inputDictionary = new dictionary();
enableMouseInteraction()

//document.body.append(turnIntoWindow(createSpreadsheet(20, 10), 'spreadsheet'));
//document.body.append(turnIntoWindow(createVariableTable(40), 'variables'));

let svg = new SVGcanvas(document.body, inputDictionary);
svg.addNewPath('M 0 0 l 3 0 l 0 3 l -3 0 Z M 30 30 c 10 10 20 10 30 0 s 20 -10 30 0 s10 -10 15 0Z');

//document.body.append(turnIntoWindow(svg.elements[0].menu, 'path'));

