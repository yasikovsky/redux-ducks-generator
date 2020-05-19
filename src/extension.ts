import * as vscode from 'vscode';

interface Property {
	name: string,
	type: string
}

interface TsInterface {
	name: string,
	props: Property[];
}

function capitalize(text: string) {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

function splitIntoWords(text: string, delimeter: string) {
	return text.replace(/([a-z0-9])([A-Z])/g, `$1${delimeter}$2`);
}

function isInterface(text: string) {
	let regex = /interface.*{.*}/gmis;
	let groups = regex.exec(text);

	return (groups && groups.length === 1);
}

function getInterfaceName(text: string) {
	let regex = /interface\s([a-z0-9]*)/i;
	let groups = regex.exec(text);

	if (groups && groups.length > 1) {
		return groups[1];
	}

	return '';
}

function getPropertyName(propertyLine: string) {
	let regex = /([a-z0-9]*)\s*:/gi;
	let groups = regex.exec(propertyLine);

	if (groups && groups.length > 1) {
		return groups[1];
	}

	return '';
}

function getPropertyType(propertyLine: string) {
	let regex = /:\s([a-z]*<?.*>?\[?\]?)/gi;
	let groups = regex.exec(propertyLine);

	if (groups && groups.length > 1) {
		return groups[1];
	}

	return '';
}

function getDefaultValueForPropType(type: string) {
	if (type.includes("[]")) {
		return '[]';
	}

	switch (type) {
		case 'string':
			return "''";
		case 'number':
			return '0';
		case 'boolean':
			return 'false';
		default:
			return undefined;
	}
}

function getProperties(text: string): Property[] {
	let regex = /[a-z0-9]*\s*:(\s*[a-z0-9]*\<[a-z0-9]*\s*,*\s*[a-z0-9]*\>\[?\]?|\s*[a-z0-9]*\[?\]?|)/gmi;
	let propLines = text.match(regex);

	let propArray: Property[] = [];

	if (propLines) {
		propLines.forEach(item => {
			let name = getPropertyName(item);
			let type = getPropertyType(item);

			propArray.push({ name: name, type: type });
		});
	}

	return propArray;
}

function getInterface(text: string): TsInterface | undefined {
	let name = getInterfaceName(text);
	let props = getProperties(text);

	if (name) {
		return { name: name, props: props };
	}

	return undefined;
}

function findFirstInterface(text: string, lineOffset?: number) {
	let startLine = -1;
	let endLine = -1;
	let foundOpeningBrace = false;
	let openBraces = 0;
	let interfaceFound = false;

	let lines = text.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (line.includes('interface')) {
			if (interfaceFound) {
				return null;
			}
			else {
				interfaceFound = true;
				startLine = i;
			}
		};

		if (line.includes('{')) {
			foundOpeningBrace = true;
			openBraces++;
		}

		if (line.includes('}')) {
			openBraces--;
		}

		if (interfaceFound && foundOpeningBrace && openBraces === 0) {
			endLine = i;
			break;
		}
	}

	if (startLine >= 0 && endLine >= 0) {

		if (lineOffset)
			return new vscode.Range(new vscode.Position(startLine + lineOffset, 0), new vscode.Position(endLine + lineOffset, lines[endLine].length - 1));

		return new vscode.Range(new vscode.Position(startLine, 0), new vscode.Position(endLine + 1, lines[endLine].length - 1));
	}

	return null;
}

function generateDucks(iface: TsInterface): string {

	let text = '';

	text += '\n\n// Types\n\n';

	text += `export interface ${iface.name}State {\n`;
	iface.props.forEach(prop => {
		text += `\t${prop.name}: ${prop.type}\n`;
	});

	text += `}\n\n`;

	text += `export interface ${iface.name}Action extends ${iface.name}State {\n`;
	text += `\ttype: ${iface.name}ActionTypes\n`;
	text += `}\n\n`;

	text += `export const initial${iface.name}State : ${iface.name}State = {\n`;
	iface.props.forEach((prop, index, array) => {
		text += `\t${prop.name}: ${getDefaultValueForPropType(prop.type)},\n`;
	});
	text += '}\n\n';

	text += `export enum ${iface.name}ActionTypes {\n`;
	iface.props.forEach((prop, index, array) => {
		text += `\tSET_${splitIntoWords(prop.name, "_").toUpperCase()} = "${iface.name.toLowerCase()}/set-${splitIntoWords(prop.name, "-").toLowerCase()}",\n`;
	});
	text += '}\n\n';

	text += '// Action creators\n\n';

	iface.props.forEach(prop => {
		text += `export function set${capitalize(prop.name)}(${prop.name}: ${prop.type}) : ${iface.name}Action {\n`;
		text += `\treturn {...initial${iface.name}State, type: ${iface.name}ActionTypes.SET_${splitIntoWords(prop.name, "_").toUpperCase()}, ${prop.name}: ${prop.name}};\n`;
		text += `}\n\n`;
	});

	text += '// Reducer\n\n';

	text += `const ${iface.name}Reducer = (state: ${iface.name}State = initial${iface.name}State, action: ${iface.name}Action) => {\n`;
	text += `\tswitch(action.type) {\n`;
	iface.props.forEach(prop => {
		text += `\t\tcase ${iface.name}ActionTypes.SET_${splitIntoWords(prop.name, "_").toUpperCase()}:\n`;
		text += `\t\t\treturn {...state, ${prop.name}: action.${prop.name}};\n`;
	});
	text += `\t\tdefault:\n`;
	text += `\t\t\treturn state;\n`;
	text += `\t}\n`;
	text += `}\n\n`;
	text += `export default ${iface.name}Reducer;`;

	return text;
}

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('redux-ducks-generator.ducks', () => {

		let editedContent = '';
		let editor = vscode.window.activeTextEditor;

		let firstInterfaceRange: vscode.Range | null;

		if (editor) {

			if (editor.selection) {
				let text = editor.document.getText(editor.selection);
				firstInterfaceRange = findFirstInterface(text, editor.selection.start.line);
				if (firstInterfaceRange) {
					editedContent = editor.document.getText(firstInterfaceRange);
				}
			}

			if (editedContent === '') {
				let text = editor.document.getText();
				firstInterfaceRange = findFirstInterface(text);
				if (firstInterfaceRange) {
					editedContent = editor.document.getText(firstInterfaceRange);
				}
			}

		}
		else {
			vscode.window.showErrorMessage('No editor active.');
			return;
		}

		if (editedContent === '') {
			vscode.window.showErrorMessage('No interface found in selection or document');
			return;
		}

		let startPosition = firstInterfaceRange!.end;
		let endPosition = new vscode.Position(editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).range.end.character);

		let iface = getInterface(editedContent);

		if (iface) {
			let newContent = generateDucks(iface);
			editor.edit(editBuilder => {
				editBuilder.replace(new vscode.Range(startPosition, endPosition), newContent);
			});
		}

		editor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0));

	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
